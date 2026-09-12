import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// Clean and normalize the Supabase URL
let supabaseUrl = (process.env.SUPABASE_URL || '').trim();
if (supabaseUrl.endsWith('/rest/v1/')) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');
} else if (supabaseUrl.endsWith('/rest/v1')) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1$/, '');
}

const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials missing! Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Seed data definitions
const seedEvents = [
  {
    id: 'event-praxis-2026',
    slug: 'praxis-2026',
    title: 'Praxis 2026 — National Technical Symposium',
    category: 'competitions',
    event_date: new Date('2026-10-15T09:00:00Z').toISOString(),
    formatted_date: 'October 2026',
    location: 'PCCoE Campus, Pune',
    organizer: 'ITSA Core & Department of IT',
    is_featured: true,
    interest_count: 242,
    description: 'The flagship annual national symposium bringing multi-track hackathons, algorithmic coding, web3 design sprints, and tech summits.',
    full_description: 'Praxis 2026 is PCCoE IT Department’s premier national engineering symposium. Over 2,000 delegates from engineering institutions across India gather for 48 hours of intense hacking, algorithmic challenges, product design showcases, and robotics face-offs. Keynote speakers include industry pioneers from Google, NVIDIA, and top tech startups.',
    poster_image_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    gallery_images: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'event-induction-2026',
    slug: 'induction-2026',
    title: 'SY, ITSA, IEEE and MLSC Induction 2026',
    category: 'career',
    event_date: new Date('2026-08-05T10:00:00Z').toISOString(),
    formatted_date: '5th August, 2026',
    location: 'Mechanical Seminar Hall, PCCoE Pune',
    organizer: 'ITSA Executive Council',
    is_featured: false,
    interest_count: 168,
    description: 'Welcoming 150 students and faculty to usher in the new leadership of ITSA, IEEE Student Branch, and MLSC chapters.',
    full_description: 'The Induction Ceremony 2026 for the Department of Information Technology was held on 5th August 2026 at the Mechanical Seminar Hall, PCCoE, Pune. The event brought together 150 students and faculty to welcome new members of SY, ITSA, IEEE and MLSC, while honoring outgoing leaders and celebrating the department’s shining stars.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge4_imqjiy.jpg'
    ]
  },
  {
    id: 'event-bruteforge-coderush',
    slug: 'bruteforge-coderush',
    title: 'BRUTEFORGE - Code Rush',
    category: 'competitions',
    event_date: new Date('2025-09-17T11:00:00Z').toISOString(),
    formatted_date: '17th September, 2025',
    location: 'IT Computer Labs 1 & 2',
    organizer: 'ITSA Coding Club',
    is_featured: false,
    interest_count: 195,
    description: 'A rapid-fire competitive programming sprint and binary puzzle contest pushing speed, algorithmic precision, and problem-solving prowess.',
    full_description: 'The first round was a quiz-based challenge featuring binary puzzles, logical reasoning questions, and applied AI problems. Around sixteen teams participated, and their performance was judged on accuracy and completion time. After an intense one-hour session, only seven to eight teams qualified for the next round.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284684/bruteforge3_d9zmfj.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge1_n1bij2.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760284685/bruteforge2_fx1arg.jpg'
    ]
  },
  {
    id: 'event-bruteforge-ai',
    slug: 'bruteforge-ai',
    title: 'BRUTEFORGE - AI Innovation Forge',
    category: 'competitions',
    event_date: new Date('2025-09-17T14:00:00Z').toISOString(),
    formatted_date: '17th September, 2025',
    location: 'LRDC Seminar Hall, PCCoE',
    organizer: 'ITSA & MLSC Chapter',
    is_featured: false,
    interest_count: 210,
    description: 'Applied machine learning sprint testing data modeling, neural network fine-tuning, and production AI workflow implementation.',
    full_description: 'The second round was a problem-solving challenge that tested participants’ creativity and technical skills. Teams were given a set of problems related to AI, machine learning, and data science, and they had to come up with innovative solutions judged on originality and execution.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_123800_eslxqc.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_123800_eslxqc.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285089/IMG_20250917_122542_lnkhut.jpg'
    ]
  },
  {
    id: 'event-ai-workshop',
    slug: 'ai-workshop',
    title: 'AI in Day-to-Day Life — Expert Masterclass',
    category: 'workshops',
    event_date: new Date('2025-07-21T10:00:00Z').toISOString(),
    formatted_date: '21st July, 2025',
    location: 'Seminar Hall 401, IT Dept',
    organizer: 'ITSA & IEEE Student Branch',
    is_featured: false,
    interest_count: 147,
    description: 'Distinguished expert session delivered by Mr. Ajay Deshpande (ACM Eminent Speaker) covering practical AI tooling and ethical usage.',
    full_description: 'The Department of IT, PCCoE, along with IEEE Student Branch and ITSA, organized an expert session on “Using AI in Day-to-Day Life”, delivered by Mr. Ajay Deshpande, an ACM Eminent Speaker with 25+ years of industry experience. He highlighted how AI impacts healthcare, education, transport, and productivity.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760285805/IMG-20250721-WA0037_xdw02t.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285805/IMG-20250721-WA0037_xdw02t.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760285804/IMG-20250721-WA0013_jrh0dn.jpg'
    ]
  },
  {
    id: 'event-gre-gate',
    slug: 'gre-gate-mock',
    title: 'Higher Studies Strategy & National GATE Mock',
    category: 'career',
    event_date: new Date('2025-09-05T13:30:00Z').toISOString(),
    formatted_date: '5th September, 2025',
    location: 'Auditorium, PCCoE Pune',
    organizer: 'ITSA Academic Wing',
    is_featured: false,
    interest_count: 112,
    description: 'Comprehensive roadmap for international master’s admissions, GRE/TOEFL preparation, and simulated GATE entrance examination.',
    full_description: 'The main objective was to guide students who are interested in pursuing higher education abroad, especially in the United States and Germany, with detailed information on GRE structure, SOP writing, and live GATE mock evaluations.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gre_session_-1_vdcjte.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gre_session_-1_vdcjte.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286535/Gate_exam_jz4kpg.jpg'
    ]
  },
  {
    id: 'event-ieee-drive',
    slug: 'ieee-drive',
    title: 'IEEE Awareness & Global Membership Drive',
    category: 'community',
    event_date: new Date('2025-09-24T15:00:00Z').toISOString(),
    formatted_date: '24th September, 2025',
    location: 'LRDC Hall, PCCoE Pune',
    organizer: 'ITSA & IEEE PCCoE',
    is_featured: false,
    interest_count: 134,
    description: 'Introducing students to IEEE research conferences, global tech networks, and student grant funding ($5000 IEEE grant).',
    full_description: 'Held at LRDC Hall, PCCoE, speakers Mr. Rakshit Jain and Mr. Mandar Khurjekar highlighted how IEEE supports technical growth, global paper publications, research mentorship, and professional networking.',
    poster_image_url: 'https://res.cloudinary.com/devyriv6o/image/upload/v1760286668/20250924_35139PMByGPSMapCamera_tsrwqi.jpg',
    gallery_images: [
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286668/20250924_35139PMByGPSMapCamera_tsrwqi.jpg',
      'https://res.cloudinary.com/devyriv6o/image/upload/v1760286666/IMG_20250924_164541_obldfo.jpg'
    ]
  }
];

export async function initDatabase() {
  try {
    // Check events count
    const { count: eventCount, error: countErr } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (countErr) {
      console.warn('Supabase events check warning:', countErr.message);
      return;
    }

    if (!eventCount || eventCount < seedEvents.length) {
      console.log('Seeding Supabase events...');
      for (const ev of seedEvents) {
        await supabase.from('events').upsert(ev, { onConflict: 'id' });
      }
    }

    // Check subscribers count
    const { count: subCount } = await supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    if (!subCount || subCount === 0) {
      console.log('Seeding sample subscribers...');
      const now = Date.now();
      const sampleSubs = [
        { id: 'sub-1', email: 'alex.sharma@pccoepune.org', status: 'verified', subscribed_at: new Date(now - 14 * 86400000).toISOString(), source: 'newsletter_page' },
        { id: 'sub-2', email: 'priya.deshmukh@pccoepune.org', status: 'verified', subscribed_at: new Date(now - 10 * 86400000).toISOString(), source: 'newsletter_page' },
        { id: 'sub-3', email: 'rohit.kulkarni@pccoepune.org', status: 'verified', subscribed_at: new Date(now - 6 * 86400000).toISOString(), source: 'newsletter_page' },
        { id: 'sub-4', email: 'sneha.patil@pccoepune.org', status: 'pending', subscribed_at: new Date(now - 2 * 86400000).toISOString(), source: 'newsletter_page' },
        { id: 'sub-5', email: 'rahul.joshi@pccoepune.org', status: 'unsubscribed', subscribed_at: new Date(now - 1 * 86400000).toISOString(), source: 'newsletter_page' },
      ];
      await supabase.from('subscribers').upsert(sampleSubs, { onConflict: 'id' });

      // Seed sent sample newsletter
      const nId = 'nl-archive-01';
      await supabase.from('newsletters').upsert({
        id: nId,
        subject: 'ITSA Bulletin 01: Welcome to the New Academic Tenure',
        body: 'Welcome to the official ITSA newsletter dispatch. We are gearing up for high-impact hackathons, research drives, and industry workshops.',
        status: 'sent',
        sent_at: new Date(now - 5 * 86400000).toISOString(),
        created_by: 'admin'
      }, { onConflict: 'id' });

      // Seed recipient tracking
      const sampleRecipients = [
        { id: 'rec-1', newsletter_id: nId, subscriber_id: 'sub-1', sent_at: new Date(now - 5 * 86400000).toISOString(), opened_at: new Date(now - 4 * 86400000).toISOString(), clicked_at: new Date(now - 4 * 86400000 + 7200000).toISOString() },
        { id: 'rec-2', newsletter_id: nId, subscriber_id: 'sub-2', sent_at: new Date(now - 5 * 86400000).toISOString(), opened_at: new Date(now - 4 * 86400000).toISOString() },
        { id: 'rec-3', newsletter_id: nId, subscriber_id: 'sub-3', sent_at: new Date(now - 5 * 86400000).toISOString(), opened_at: new Date(now - 4 * 86400000).toISOString() },
      ];
      await supabase.from('newsletter_recipients').upsert(sampleRecipients, { onConflict: 'id' });
    }
  } catch (err) {
    console.warn('initDatabase notice:', err.message);
  }
}

// ----------------------------------------------------
// DATABASE SERVICE FUNCTIONS (Supabase Backend)
// ----------------------------------------------------

export const dbService = {
  // Subscribers
  async getSubscriberByEmail(email) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .ilike('email', email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getSubscriberByToken(token) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('verification_token', token)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getSubscriberByIdOrToken(token) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .or(`id.eq.${token},verification_token.eq.${token}`)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getSubscriberById(id) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async createSubscriber(sub) {
    const { data, error } = await supabase
      .from('subscribers')
      .insert(sub)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSubscriber(id, updates) {
    const { data, error } = await supabase
      .from('subscribers')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async deleteSubscriber(id) {
    const { error } = await supabase
      .from('subscribers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async listSubscribers({ search = '', status = 'all', source = 'all', startDate = '', endDate = '' }) {
    let query = supabase.from('subscribers').select('*').order('subscribed_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (source && source !== 'all') {
      query = query.eq('source', source);
    }
    if (startDate) {
      query = query.gte('subscribed_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      // end of selected day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('subscribed_at', end.toISOString());
    }
    if (search && search.trim()) {
      query = query.ilike('email', `%${search.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async bulkUnsubscribe(ids) {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
      .in('id', ids)
      .select();
    if (error) throw error;
    return data ? data.length : 0;
  },

  async bulkDelete(ids) {
    const { data, error } = await supabase
      .from('subscribers')
      .delete()
      .in('id', ids)
      .select();
    if (error) throw error;
    return data ? data.length : 0;
  },

  async getPendingSubscribers(ids) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email')
      .in('id', ids)
      .eq('status', 'pending');
    if (error) throw error;
    return data || [];
  },

  async getSubscribersByIds(ids) {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email, status, subscribed_at, unsubscribed_at, source')
      .in('id', ids)
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getAllSubscribers() {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, email, status, subscribed_at, unsubscribed_at, source')
      .order('subscribed_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Events & Interests
  async getEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('event_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getUserInterests(userIdentifier) {
    if (!userIdentifier) return [];
    const { data, error } = await supabase
      .from('event_interests')
      .select('event_id')
      .eq('user_identifier', userIdentifier);
    if (error) throw error;
    return (data || []).map(i => i.event_id);
  },

  async getEventById(id) {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getInterest(eventId, userIdentifier) {
    const { data, error } = await supabase
      .from('event_interests')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_identifier', userIdentifier)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async removeInterest(interestId, eventId, currentCount = 1) {
    await supabase.from('event_interests').delete().eq('id', interestId);
    const newCount = Math.max(0, currentCount - 1);
    const { data, error } = await supabase
      .from('events')
      .update({ interest_count: newCount })
      .eq('id', eventId)
      .select('interest_count')
      .single();
    if (error) throw error;
    return data ? data.interest_count : newCount;
  },

  async addInterest(interestId, eventId, userIdentifier, currentCount = 0) {
    await supabase.from('event_interests').insert({
      id: interestId,
      event_id: eventId,
      user_identifier: userIdentifier,
    });
    const newCount = currentCount + 1;
    const { data, error } = await supabase
      .from('events')
      .update({ interest_count: newCount })
      .eq('id', eventId)
      .select('interest_count')
      .single();
    if (error) throw error;
    return data ? data.interest_count : newCount;
  },

  // Newsletters & Dispatches
  async getNewslettersWithStats() {
    const { data: newsletters, error: nlErr } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });
    if (nlErr) throw nlErr;

    if (!newsletters || newsletters.length === 0) return [];

    // Fetch all recipients to calculate stats
    const { data: recipients, error: recErr } = await supabase
      .from('newsletter_recipients')
      .select('id, newsletter_id, opened_at, clicked_at');
    if (recErr) throw recErr;

    // Fetch newsletter events junction
    const { data: nlEvents, error: nleErr } = await supabase
      .from('newsletter_events')
      .select('newsletter_id, event_id');
    if (nleErr) throw nleErr;

    // Fetch all events
    const { data: allEvents } = await supabase.from('events').select('*');
    const eventsMap = new Map((allEvents || []).map(e => [e.id, e]));

    return newsletters.map(nl => {
      const matchingRecs = (recipients || []).filter(r => r.newsletter_id === nl.id);
      const recipient_count = matchingRecs.length;
      const open_count = matchingRecs.filter(r => r.opened_at !== null).length;
      const click_count = matchingRecs.filter(r => r.clicked_at !== null).length;

      const eventIds = (nlEvents || []).filter(ne => ne.newsletter_id === nl.id).map(ne => ne.event_id);
      const linkedEvents = eventIds.map(eid => eventsMap.get(eid)).filter(Boolean);

      return {
        ...nl,
        recipient_count,
        open_count,
        click_count,
        events: linkedEvents
      };
    });
  },

  async getNewsletterById(id) {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getLinkedEventsForNewsletter(newsletterId) {
    const { data: junctions, error: jErr } = await supabase
      .from('newsletter_events')
      .select('event_id')
      .eq('newsletter_id', newsletterId);
    if (jErr) throw jErr;

    const eventIds = (junctions || []).map(j => j.event_id);
    if (eventIds.length === 0) return [];

    const { data: events, error: eErr } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds);
    if (eErr) throw eErr;
    return events || [];
  },

  async getVerifiedSubscribers() {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .eq('status', 'verified');
    if (error) throw error;
    return data || [];
  },

  async createNewsletter(nl) {
    const { data, error } = await supabase
      .from('newsletters')
      .insert(nl)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async linkNewsletterEvents(links) {
    if (!links || links.length === 0) return;
    const { error } = await supabase.from('newsletter_events').insert(links);
    if (error) throw error;
  },

  async recordNewsletterRecipients(recipients) {
    if (!recipients || recipients.length === 0) return;
    const { error } = await supabase.from('newsletter_recipients').insert(recipients);
    if (error) throw error;
  },

  async updateNewsletter(id, updates) {
    const { data, error } = await supabase
      .from('newsletters')
      .update(updates)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data;
  },

  async getDueScheduledNewsletters() {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('newsletters')
      .select('id')
      .eq('status', 'scheduled')
      .lte('scheduled_at', nowIso);
    if (error) throw error;
    return data || [];
  },

  // Analytics
  async getAnalytics() {
    const [
      { count: totalSubscribers },
      { count: verifiedCount },
      { count: pendingCount },
      { count: unsubscribedCount },
      { count: totalSentNewsletters },
      { count: scheduledNewsletters },
      { count: totalDispatches },
      { count: totalOpens },
      { count: totalClicks },
      { count: totalBounces },
      { count: totalUnsubscribesAfter }
    ] = await Promise.all([
      supabase.from('subscribers').select('*', { count: 'exact', head: true }),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('subscribers').select('*', { count: 'exact', head: true }).eq('status', 'unsubscribed'),
      supabase.from('newsletters').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
      supabase.from('newsletters').select('*', { count: 'exact', head: true }).eq('status', 'scheduled'),
      supabase.from('newsletter_recipients').select('*', { count: 'exact', head: true }),
      supabase.from('newsletter_recipients').select('*', { count: 'exact', head: true }).not('opened_at', 'is', null),
      supabase.from('newsletter_recipients').select('*', { count: 'exact', head: true }).not('clicked_at', 'is', null),
      supabase.from('newsletter_recipients').select('*', { count: 'exact', head: true }).eq('bounced', true),
      supabase.from('newsletter_recipients').select('*', { count: 'exact', head: true }).eq('unsubscribed_after', true),
    ]);

    const totSubs = totalSubscribers || 0;
    const totDisp = totalDispatches || 0;

    const verificationRate = totSubs > 0 ? Math.round(((verifiedCount || 0) / totSubs) * 100) : 0;
    const unsubscribeRate = totSubs > 0 ? Math.round(((unsubscribedCount || 0) / totSubs) * 100) : 0;
    const openRate = totDisp > 0 ? Math.round(((totalOpens || 0) / totDisp) * 100) : 0;
    const clickRate = totDisp > 0 ? Math.round(((totalClicks || 0) / totDisp) * 100) : 0;
    const bounceRate = totDisp > 0 ? Math.round(((totalBounces || 0) / totDisp) * 100) : 0;

    // Growth timeline
    const { data: subsTimeline } = await supabase
      .from('subscribers')
      .select('subscribed_at')
      .order('subscribed_at', { ascending: true });

    const timelineMap = {};
    for (const s of (subsTimeline || [])) {
      if (s.subscribed_at) {
        const d = s.subscribed_at.split('T')[0];
        timelineMap[d] = (timelineMap[d] || 0) + 1;
      }
    }
    const growthTimeline = Object.entries(timelineMap).map(([date, count]) => ({ date, count })).slice(-14);

    // Per-newsletter stats
    const { data: sentNls } = await supabase
      .from('newsletters')
      .select('id, subject, sent_at, status')
      .eq('status', 'sent')
      .order('sent_at', { ascending: false });

    const { data: allRecipients } = await supabase
      .from('newsletter_recipients')
      .select('id, newsletter_id, opened_at, clicked_at, bounced, unsubscribed_after');

    const newsletterStats = (sentNls || []).map(nl => {
      const recs = (allRecipients || []).filter(r => r.newsletter_id === nl.id);
      return {
        id: nl.id,
        subject: nl.subject,
        sent_at: nl.sent_at,
        status: nl.status,
        recipients: recs.length,
        opens: recs.filter(r => r.opened_at !== null).length,
        clicks: recs.filter(r => r.clicked_at !== null).length,
        bounces: recs.filter(r => r.bounced === true).length,
        unsubscribes: recs.filter(r => r.unsubscribed_after === true).length,
      };
    });

    // Recent activity log
    const { data: recentSubs } = await supabase
      .from('subscribers')
      .select('email, status, subscribed_at')
      .order('subscribed_at', { ascending: false })
      .limit(5);

    const recentActivity = (recentSubs || []).map(s => ({
      type: 'new_subscriber',
      title: s.email,
      detail: s.status,
      timestamp: s.subscribed_at
    }));

    return {
      summary: {
        totalSubscribers: totSubs,
        verifiedCount: verifiedCount || 0,
        pendingCount: pendingCount || 0,
        unsubscribedCount: unsubscribedCount || 0,
        totalSentNewsletters: totalSentNewsletters || 0,
        scheduledNewsletters: scheduledNewsletters || 0,
        totalDispatches: totDisp,
        totalOpens: totalOpens || 0,
        totalClicks: totalClicks || 0,
        totalBounces: totalBounces || 0,
        totalUnsubscribesAfter: totalUnsubscribesAfter || 0,
        verificationRate,
        unsubscribeRate,
        openRate,
        clickRate,
        bounceRate,
      },
      growthTimeline,
      newsletterStats,
      recentActivity,
    };
  },

  // Outbox
  async saveOutboxEmail(emailData) {
    const { error } = await supabase.from('outbox_emails').insert(emailData);
    if (error) console.warn('Supabase outbox insert error:', error.message);
  },

  async getOutboxEmails(limit = 50) {
    const { data, error } = await supabase
      .from('outbox_emails')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  },

  // Tracking
  async trackOpen(recipientId) {
    if (!recipientId) return;
    const nowIso = new Date().toISOString();
    await supabase
      .from('newsletter_recipients')
      .update({ opened_at: nowIso })
      .eq('id', recipientId)
      .is('opened_at', null);
  },

  async trackClick(recipientId) {
    if (!recipientId) return;
    const nowIso = new Date().toISOString();
    await supabase
      .from('newsletter_recipients')
      .update({ clicked_at: nowIso })
      .eq('id', recipientId);
  }
};

export default dbService;
