import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import db, { initDatabase } from './db.js';
import {
  createVerificationEmail,
  createNewsletterEmail,
  createUnsubscribeEmail,
  sendEmail
} from './email.js';

// Initialize Supabase data & seed if necessary
initDatabase().catch(err => console.warn('Database initialization warning:', err.message));

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory IP rate limiter for subscribe requests (max 10 requests per 15 min per IP)
const ipRateLimitMap = new Map();
function rateLimitSubscribe(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxRequests = 10;

  const userRecord = ipRateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };
  if (now > userRecord.resetTime) {
    userRecord.count = 0;
    userRecord.resetTime = now + windowMs;
  }

  userRecord.count++;
  ipRateLimitMap.set(ip, userRecord);

  if (userRecord.count > maxRequests) {
    return res.status(429).json({ error: 'Too many subscription attempts. Please wait a few minutes before trying again.' });
  }
  next();
}

// Helper to validate email RFC 5322 regex
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

// ----------------------------------------------------
// PUBLIC API: SUBSCRIBER FLOW
// ----------------------------------------------------

// 1. Subscribe endpoint with IP rate limiting
app.post('/api/subscribe', rateLimitSubscribe, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.getSubscriberByEmail(cleanEmail);

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    if (existing) {
      if (existing.status === 'verified') {
        return res.status(409).json({ error: "You're already subscribed to ITSA dispatches." });
      }

      // If pending or unsubscribed, refresh token and resend
      await db.updateSubscriber(existing.id, {
        status: 'pending',
        verification_token: token,
        verification_expires_at: expiresAt,
        unsubscribed_at: null
      });

      const emailData = createVerificationEmail({ email: cleanEmail, token });
      await sendEmail({ to: cleanEmail, subject: emailData.subject, html: emailData.html, type: 'verification' });

      return res.json({
        success: true,
        message: 'A fresh verification link has been dispatched to your inbox. Please check to confirm.',
        token,
      });
    }

    // Insert new subscriber
    const subId = 'sub-' + crypto.randomUUID();
    await db.createSubscriber({
      id: subId,
      email: cleanEmail,
      status: 'pending',
      verification_token: token,
      verification_expires_at: expiresAt,
      source: 'newsletter_page'
    });

    const emailData = createVerificationEmail({ email: cleanEmail, token });
    await sendEmail({ to: cleanEmail, subject: emailData.subject, html: emailData.html, type: 'verification' });

    res.status(201).json({
      success: true,
      message: 'Subscription initiated! Check your inbox to confirm your email.',
      token,
    });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Internal server error while processing subscription.' });
  }
});

// 2. Verification check endpoint
app.get('/api/verify', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Verification token is required.' });
    }

    const subscriber = await db.getSubscriberByToken(token);
    if (!subscriber) {
      return res.status(404).json({ error: 'Invalid or already used verification token.' });
    }

    if (subscriber.verification_expires_at && new Date(subscriber.verification_expires_at) < new Date()) {
      return res.status(410).json({ error: 'Verification token has expired. Please subscribe again to receive a fresh link.' });
    }

    // Mark as verified
    await db.updateSubscriber(subscriber.id, {
      status: 'verified',
      verification_token: null,
      verification_expires_at: null
    });

    res.json({
      success: true,
      email: subscriber.email,
      message: 'Your email address has been successfully verified.'
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Error processing verification.' });
  }
});

// 3. Unsubscribe endpoint
app.get('/api/unsubscribe', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ error: 'Unsubscribe token is required.' });
    }

    // Token could be subscriber id or verification token
    const subscriber = await db.getSubscriberByIdOrToken(token);
    if (!subscriber) {
      return res.status(404).json({ error: 'Subscriber record not found.' });
    }

    await db.updateSubscriber(subscriber.id, {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    });

    // Confirmation email
    const emailData = createUnsubscribeEmail({ email: subscriber.email });
    await sendEmail({ to: subscriber.email, subject: emailData.subject, html: emailData.html, type: 'unsubscribe' });

    res.json({
      success: true,
      email: subscriber.email,
      message: 'You have been successfully unsubscribed.'
    });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: 'Error processing unsubscribe request.' });
  }
});

// ----------------------------------------------------
// PUBLIC API: EVENTS & HYPE COUNTER
// ----------------------------------------------------

// 4. Get events list
app.get('/api/events', async (req, res) => {
  try {
    const { userIdentifier } = req.query;
    const events = await db.getEvents();
    const userInterests = new Set(await db.getUserInterests(userIdentifier));

    const formatted = events.map(e => {
      let gallery = [];
      if (Array.isArray(e.gallery_images)) {
        gallery = e.gallery_images;
      } else if (typeof e.gallery_images === 'string') {
        try { gallery = JSON.parse(e.gallery_images); } catch (_) { gallery = []; }
      }

      return {
        ...e,
        gallery_images: gallery,
        userInterested: userInterests.has(e.id)
      };
    });

    res.json({ events: formatted });
  } catch (err) {
    console.error('Events error:', err);
    res.status(500).json({ error: 'Failed to fetch events.' });
  }
});

// 5. Toggle or express interest
app.post('/api/events/:id/interest', async (req, res) => {
  try {
    const { id } = req.params;
    const { userIdentifier } = req.body;

    if (!userIdentifier) {
      return res.status(400).json({ error: 'User identifier required to register interest.' });
    }

    const event = await db.getEventById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    const existingInterest = await db.getInterest(id, userIdentifier);

    if (existingInterest) {
      // Toggle off
      const updatedCount = await db.removeInterest(existingInterest.id, id, event.interest_count || 1);
      return res.json({
        success: true,
        interested: false,
        interest_count: updatedCount,
        message: 'Interest removed.'
      });
    }

    // Register new interest
    const interestId = 'int-' + crypto.randomUUID();
    const updatedCount = await db.addInterest(interestId, id, userIdentifier, event.interest_count || 0);

    res.json({
      success: true,
      interested: true,
      interest_count: updatedCount,
      message: 'Hype registered! You will be notified when tickets/registration opens.'
    });
  } catch (err) {
    console.error('Interest error:', err);
    res.status(500).json({ error: 'Failed to toggle interest.' });
  }
});

// ----------------------------------------------------
// ADMIN API: NEWSLETTERS & SCHEDULING
// ----------------------------------------------------

// 6. Get all newsletters with stats
app.get('/api/newsletters', async (req, res) => {
  try {
    const newsletters = await db.getNewslettersWithStats();
    res.json({ newsletters });
  } catch (err) {
    console.error('Newsletters list error:', err);
    res.status(500).json({ error: 'Failed to fetch newsletters.' });
  }
});

// Helper to execute dispatch for a newsletter
async function dispatchNewsletter(newsletterId) {
  const newsletter = await db.getNewsletterById(newsletterId);
  if (!newsletter) return;

  const linkedEvents = await db.getLinkedEventsForNewsletter(newsletterId);
  const verifiedSubscribers = await db.getVerifiedSubscribers();

  const recipientsToRecord = [];

  for (const sub of verifiedSubscribers) {
    const recipientId = 'rec-' + crypto.randomUUID();
    recipientsToRecord.push({
      id: recipientId,
      newsletter_id: newsletterId,
      subscriber_id: sub.id,
      sent_at: new Date().toISOString()
    });

    const emailData = createNewsletterEmail({
      subject: newsletter.subject,
      body: newsletter.body,
      events: linkedEvents,
      unsubscribeToken: sub.id,
      recipientId
    });

    await sendEmail({
      to: sub.email,
      subject: emailData.subject,
      html: emailData.html,
      type: 'newsletter'
    });
  }

  if (recipientsToRecord.length > 0) {
    await db.recordNewsletterRecipients(recipientsToRecord);
  }

  await db.updateNewsletter(newsletterId, {
    status: 'sent',
    sent_at: new Date().toISOString()
  });
}

// 7. Create newsletter (send now or schedule)
app.post('/api/newsletters', async (req, res) => {
  try {
    const { subject, body, eventIds = [], scheduleDate } = req.body;

    if (!subject || !subject.trim()) {
      return res.status(400).json({ error: 'Subject line is required.' });
    }
    if (!body || !body.trim()) {
      return res.status(400).json({ error: 'Newsletter content body is required.' });
    }

    const newsletterId = 'nl-' + crypto.randomUUID();
    let isScheduled = false;

    if (scheduleDate) {
      const targetTime = new Date(scheduleDate);
      if (isNaN(targetTime.getTime()) || targetTime <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be a future timestamp.' });
      }
      isScheduled = true;
    }

    const status = isScheduled ? 'scheduled' : 'draft';
    const scheduledAt = isScheduled ? new Date(scheduleDate).toISOString() : null;

    await db.createNewsletter({
      id: newsletterId,
      subject: subject.trim(),
      body: body.trim(),
      status,
      scheduled_at: scheduledAt,
      created_by: 'admin'
    });

    // Link events
    if (eventIds && eventIds.length > 0) {
      const links = eventIds.map(eid => ({
        id: 'nle-' + crypto.randomUUID(),
        newsletter_id: newsletterId,
        event_id: eid
      }));
      await db.linkNewsletterEvents(links);
    }

    if (!isScheduled) {
      // Send immediately
      await dispatchNewsletter(newsletterId);
    }

    res.status(201).json({
      success: true,
      message: isScheduled ? 'Newsletter successfully scheduled.' : 'Newsletter dispatched to all verified subscribers!',
      newsletterId
    });
  } catch (err) {
    console.error('Create newsletter error:', err);
    res.status(500).json({ error: 'Failed to create newsletter.' });
  }
});

// 8. Cancel scheduled newsletter
app.put('/api/newsletters/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const nl = await db.getNewsletterById(id);
    if (!nl) return res.status(404).json({ error: 'Newsletter not found.' });

    if (nl.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled newsletters can be cancelled.' });
    }

    await db.updateNewsletter(id, { status: 'draft', scheduled_at: null });
    res.json({ success: true, message: 'Scheduled newsletter converted back to draft.' });
  } catch (err) {
    console.error('Cancel newsletter error:', err);
    res.status(500).json({ error: 'Failed to cancel newsletter.' });
  }
});

// ----------------------------------------------------
// ADMIN API: SUBSCRIBERS & ANALYTICS
// ----------------------------------------------------

// 9. List subscribers with search & filter (status, source, date range)
app.get('/api/admin/subscribers', async (req, res) => {
  try {
    const { search = '', status = 'all', source = 'all', startDate = '', endDate = '' } = req.query;
    const subscribers = await db.listSubscribers({ search, status, source, startDate, endDate });
    res.json({ subscribers });
  } catch (err) {
    console.error('Admin subscribers error:', err);
    res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

// 10. Resend verification (single)
app.post('/api/admin/subscribers/:id/resend-verification', async (req, res) => {
  try {
    const { id } = req.params;
    const subscriber = await db.getSubscriberById(id);
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found.' });

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

    await db.updateSubscriber(id, {
      verification_token: token,
      verification_expires_at: expiresAt
    });

    const emailData = createVerificationEmail({ email: subscriber.email, token });
    await sendEmail({ to: subscriber.email, subject: emailData.subject, html: emailData.html, type: 'verification' });

    res.json({ success: true, message: `Verification email resent to ${subscriber.email}` });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Failed to resend verification.' });
  }
});

// 11. Manual unsubscribe (single)
app.post('/api/admin/subscribers/:id/unsubscribe', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateSubscriber(id, {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    });

    res.json({ success: true, message: 'Subscriber unsubscribed.' });
  } catch (err) {
    console.error('Admin unsubscribe error:', err);
    res.status(500).json({ error: 'Failed to unsubscribe.' });
  }
});

// 12. Manual resubscribe (single)
app.post('/api/admin/subscribers/:id/resubscribe', async (req, res) => {
  try {
    const { id } = req.params;
    await db.updateSubscriber(id, {
      status: 'verified',
      unsubscribed_at: null
    });

    res.json({ success: true, message: 'Subscriber manually resubscribed as verified.' });
  } catch (err) {
    console.error('Admin resubscribe error:', err);
    res.status(500).json({ error: 'Failed to resubscribe.' });
  }
});

// 13. Delete subscriber (single)
app.delete('/api/admin/subscribers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteSubscriber(id);
    res.json({ success: true, message: 'Subscriber deleted permanently.' });
  } catch (err) {
    console.error('Delete subscriber error:', err);
    res.status(500).json({ error: 'Failed to delete subscriber.' });
  }
});

// 14. Bulk Unsubscribe Selected
app.post('/api/admin/subscribers/bulk-unsubscribe', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No subscriber IDs provided.' });
    }

    const changedCount = await db.bulkUnsubscribe(ids);
    res.json({
      success: true,
      message: `Successfully unsubscribed ${changedCount} subscriber(s).`,
      count: changedCount
    });
  } catch (err) {
    console.error('Bulk unsubscribe error:', err);
    res.status(500).json({ error: 'Failed to execute bulk unsubscribe.' });
  }
});

// 15. Bulk Resend Verification Selected (pending only)
app.post('/api/admin/subscribers/bulk-resend', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No subscriber IDs provided.' });
    }

    const pendingSubs = await db.getPendingSubscribers(ids);

    if (pendingSubs.length === 0) {
      return res.json({ success: true, message: 'No pending subscribers found in selection.', count: 0 });
    }

    let sentCount = 0;
    for (const sub of pendingSubs) {
      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000).toISOString();

      await db.updateSubscriber(sub.id, {
        verification_token: token,
        verification_expires_at: expiresAt
      });

      const emailData = createVerificationEmail({ email: sub.email, token });
      await sendEmail({ to: sub.email, subject: emailData.subject, html: emailData.html, type: 'verification' });
      sentCount++;
    }

    res.json({
      success: true,
      message: `Resent verification to ${sentCount} pending subscriber(s).`,
      count: sentCount
    });
  } catch (err) {
    console.error('Bulk resend error:', err);
    res.status(500).json({ error: 'Failed to execute bulk resend verification.' });
  }
});

// 16. Bulk Delete Selected
app.post('/api/admin/subscribers/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No subscriber IDs provided.' });
    }

    const deletedCount = await db.bulkDelete(ids);
    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} subscriber(s).`,
      count: deletedCount
    });
  } catch (err) {
    console.error('Bulk delete error:', err);
    res.status(500).json({ error: 'Failed to delete selected subscribers.' });
  }
});

// 17. Bulk Export Selected to CSV
app.post('/api/admin/subscribers/bulk-export', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No subscriber IDs provided.' });
    }

    const subscribers = await db.getSubscribersByIds(ids);

    let csv = 'ID,Email,Status,Subscribed At,Unsubscribed At,Source\r\n';
    for (const sub of subscribers) {
      csv += `"${sub.id}","${sub.email}","${sub.status}","${sub.subscribed_at || ''}","${sub.unsubscribed_at || ''}","${sub.source || ''}"\r\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="itsa_selected_subscribers.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Bulk CSV export error:', err);
    res.status(500).json({ error: 'Failed to export selected subscribers.' });
  }
});

// 18. Export ALL subscribers to CSV
app.get('/api/admin/subscribers/export', async (req, res) => {
  try {
    const subscribers = await db.getAllSubscribers();

    let csv = 'ID,Email,Status,Subscribed At,Unsubscribed At,Source\r\n';
    for (const sub of subscribers) {
      csv += `"${sub.id}","${sub.email}","${sub.status}","${sub.subscribed_at || ''}","${sub.unsubscribed_at || ''}","${sub.source || ''}"\r\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="itsa_all_subscribers.csv"');
    res.status(200).send(csv);
  } catch (err) {
    console.error('CSV export error:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

// 19. Analytics metrics (with growth chart and per-newsletter statistics)
app.get('/api/admin/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

// 20. Outbox emails inspector
app.get('/api/outbox', async (req, res) => {
  try {
    const emails = await db.getOutboxEmails(50);
    res.json({ emails });
  } catch (err) {
    console.error('Outbox fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch outbox.' });
  }
});

// 21. Open tracking pixel
app.get('/api/track/open', async (req, res) => {
  try {
    const { r } = req.query;
    if (r) {
      await db.trackOpen(r);
    }
  } catch (err) {
    console.warn('Tracking error:', err);
  }
  // 1x1 transparent gif
  const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
  res.writeHead(200, {
    'Content-Type': 'image/gif',
    'Content-Length': gif.length,
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
  });
  res.end(gif);
});

// 22. Click tracking redirect
app.get('/api/track/click', async (req, res) => {
  try {
    const { r, url } = req.query;
    if (r) {
      await db.trackClick(r);
    }
    if (url) {
      return res.redirect(url);
    }
  } catch (err) {
    console.warn('Click track error:', err);
  }
  res.redirect('/newsletter');
});

// Background cron: check for scheduled newsletters every 30 seconds (local dev server)
if (!process.env.VERCEL) {
  setInterval(async () => {
    try {
      const dueNewsletters = await db.getDueScheduledNewsletters();
      for (const item of dueNewsletters) {
        console.log(`[Scheduler] Dispatching due newsletter: ${item.id}`);
        await dispatchNewsletter(item.id);
      }
    } catch (err) {
      console.error('[Scheduler] Error checking scheduled items:', err);
    }
  }, 30000);
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`ITSA Newsletter Server running at http://localhost:${PORT}`);
  });
}

export default app;
