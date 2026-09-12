import React, { useState, useEffect } from 'react';
import {
  Send,
  Calendar,
  Users,
  BarChart3,
  Mail,
  Download,
  Search,
  RefreshCw,
  UserX,
  CheckCircle,
  Clock,
  Eye,
  AlertTriangle,
  Lock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckSquare,
  Square,
  Trash2,
  X,
  Check,
  FileDown
} from 'lucide-react';

export default function AdminNewsletterPage({ onNavigate }) {
  // Simple auth lock
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('itsa-admin-auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  // Active tab: 'compose' | 'dispatches' | 'subscribers' | 'analytics' | 'outbox'
  const [activeTab, setActiveTab] = useState('compose');

  // Compose State
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState(
    "Hello Engineers,\n\nWe are excited to share key updates from the ITSA Department of IT at PCCoE Pune. Below are the upcoming hackathons, AI masterclasses, and chapter drives scheduled for this month.\n\nMake sure to review details and RSVP early!"
  );
  const [availableEvents, setAvailableEvents] = useState([]);
  const [selectedEventIds, setSelectedEventIds] = useState([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDatetime, setScheduleDatetime] = useState('');
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeMessage, setComposeMessage] = useState(null);

  // Dispatches State
  const [newsletters, setNewsletters] = useState([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [subSearch, setSubSearch] = useState('');
  const [subFilter, setSubFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [selectedSubIds, setSelectedSubIds] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, type: 'single', subId: null, count: 1 });

  // Analytics State
  const [analytics, setAnalytics] = useState(null);

  // Outbox State
  const [outbox, setOutbox] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllAdminData();
    }
  }, [isAuthenticated]);

  const loadAllAdminData = () => {
    loadEvents();
    loadNewsletters();
    loadSubscribers();
    loadAnalytics();
    loadOutbox();
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === 'itsa2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('itsa-admin-auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const loadEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.events) {
        setAvailableEvents(data.events);
        // Default select first two events
        if (data.events.length > 0) {
          setSelectedEventIds([data.events[0].id]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadNewsletters = async () => {
    setLoadingNewsletters(true);
    try {
      const res = await fetch('/api/newsletters');
      const data = await res.json();
      if (data.newsletters) setNewsletters(data.newsletters);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNewsletters(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const loadSubscribers = async () => {
    setLoadingSubscribers(true);
    try {
      const params = new URLSearchParams();
      if (subSearch) params.append('search', subSearch);
      if (subFilter && subFilter !== 'all') params.append('status', subFilter);
      if (sourceFilter && sourceFilter !== 'all') params.append('source', sourceFilter);
      if (startDateFilter) params.append('startDate', startDateFilter);
      if (endDateFilter) params.append('endDate', endDateFilter);

      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      const data = await res.json();
      if (data.subscribers) setSubscribers(data.subscribers);
    } catch (err) {
      console.error(err);
      showToast('Failed to load subscribers.', 'error');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOutbox = async () => {
    try {
      const res = await fetch('/api/outbox');
      const data = await res.json();
      if (data.emails) setOutbox(data.emails);
    } catch (err) {
      console.error(err);
    }
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSubIds(subscribers.map((s) => s.id));
    } else {
      setSelectedSubIds([]);
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedSubIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Bulk action handlers
  const handleBulkUnsubscribe = async () => {
    if (selectedSubIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/subscribers/bulk-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubIds }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setSelectedSubIds([]);
        loadSubscribers();
        loadAnalytics();
      } else {
        showToast(data.error || 'Bulk unsubscribe failed.', 'error');
      }
    } catch (err) {
      showToast('Network error on bulk unsubscribe.', 'error');
    }
  };

  const handleBulkResend = async () => {
    if (selectedSubIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/subscribers/bulk-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubIds }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadOutbox();
      } else {
        showToast(data.error || 'Bulk resend failed.', 'error');
      }
    } catch (err) {
      showToast('Network error on bulk resend.', 'error');
    }
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const res = await fetch('/api/admin/subscribers/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubIds }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setSelectedSubIds([]);
        loadSubscribers();
        loadAnalytics();
      } else {
        showToast(data.error || 'Bulk delete failed.', 'error');
      }
    } catch (err) {
      showToast('Network error on bulk delete.', 'error');
    } finally {
      setDeleteModal({ isOpen: false, type: 'single', subId: null, count: 1 });
    }
  };

  const handleBulkExportCSV = async () => {
    if (selectedSubIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/subscribers/bulk-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubIds }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'itsa_selected_subscribers.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Exported ${selectedSubIds.length} subscriber(s) to CSV.`);
    } catch (err) {
      showToast('Failed to export selected CSV.', 'error');
    }
  };

  const handleExportAllCSV = () => {
    window.open('/api/admin/subscribers/export', '_blank');
    showToast('Exporting all subscribers to CSV...');
  };
  const handleExportCSV = handleExportAllCSV;


  // Per-row single handlers
  const handleResendVerification = async (subId) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${subId}/resend-verification`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadOutbox();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  const handleManualUnsubscribe = async (subId) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${subId}/unsubscribe`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadSubscribers();
        loadAnalytics();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  const handleManualResubscribe = async (subId) => {
    try {
      const res = await fetch(`/api/admin/subscribers/${subId}/resubscribe`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        loadSubscribers();
        loadAnalytics();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  const handleDeleteSingleConfirm = async () => {
    if (!deleteModal.subId) return;
    try {
      const res = await fetch(`/api/admin/subscribers/${deleteModal.subId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message);
        setSelectedSubIds((prev) => prev.filter((i) => i !== deleteModal.subId));
        loadSubscribers();
        loadAnalytics();
      } else {
        showToast(data.error, 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    } finally {
      setDeleteModal({ isOpen: false, type: 'single', subId: null, count: 1 });
    }
  };

  // Compose / Dispatch Handler
  const handleDispatch = async (e) => {
    e.preventDefault();
    setComposeLoading(true);
    setComposeMessage(null);

    // Validation
    if (isScheduling && scheduleDatetime) {
      const scheduledDate = new Date(scheduleDatetime);
      if (scheduledDate <= new Date()) {
        setComposeMessage({ type: 'error', text: 'Scheduled date and time must be in the future.' });
        setComposeLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/newsletters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          body,
          eventIds: selectedEventIds,
          scheduleDate: isScheduling ? scheduleDatetime : null,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setComposeMessage({ type: 'success', text: data.message });
        setSubject('');
        loadNewsletters();
        loadAnalytics();
        loadOutbox();
      } else {
        setComposeMessage({ type: 'error', text: data.error || 'Failed to dispatch newsletter.' });
      }
    } catch (err) {
      setComposeMessage({ type: 'error', text: 'Network request failed.' });
    } finally {
      setComposeLoading(false);
    }
  };

  // Cancel scheduled
  const handleCancelScheduled = async (id) => {
    try {
      const res = await fetch(`/api/newsletters/${id}/cancel`, { method: 'PUT' });
      if (res.ok) {
        showToast('Scheduled newsletter cancelled and moved back to draft.');
        loadNewsletters();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Lock screen view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5 py-24 sm:px-8">
        <div className="w-full max-w-md border border-border bg-card p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="size-4 text-primary" />
            <span className="label-mono">RESTRICTED DISPATCH SYSTEM</span>
          </div>

          <h2 className="font-display text-2xl font-bold text-foreground">
            ITSA Admin Access
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Authentication required to compose newsletters, inspect analytics, or export subscribers.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="label-mono block mb-1.5">Security Passcode</label>
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode (e.g. itsa2026)"
                className="w-full border border-border bg-surface px-3.5 py-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 text-destructive font-mono text-xs">
                <AlertTriangle className="size-3.5" />
                <span>Incorrect passcode. Use "itsa2026".</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-foreground py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-foreground/90 transition-colors cursor-pointer"
            >
              Unlock Console →
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Embedded events for live email preview
  const previewEvents = availableEvents.filter((e) => selectedEventIds.includes(e.id));

  return (
    <div className="min-h-screen px-5 pt-28 pb-20 sm:px-8 sm:pt-36">
      <div className="mx-auto max-w-[1600px]">
        {/* Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/20 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
                04 — ADMIN PORTAL
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                DISPATCH CONTROL CENTER
              </span>
            </div>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              ITSA Newsletter Engine
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportAllCSV}
              className="inline-flex items-center gap-2 border border-border bg-surface px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground hover:border-foreground/50 transition-colors cursor-pointer"
            >
              <Download className="size-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('itsa-admin-auth');
                setIsAuthenticated(false);
              }}
              className="border border-border bg-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-3">
          {[
            { id: 'compose', label: 'Compose & Send', icon: Send },
            { id: 'dispatches', label: 'Dispatches & Queue', icon: Mail },
            { id: 'subscribers', label: 'Subscribers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'outbox', label: 'Outbox Inspector', icon: Eye },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'subscribers') loadSubscribers();
                  if (tab.id === 'analytics') loadAnalytics();
                  if (tab.id === 'dispatches') loadNewsletters();
                  if (tab.id === 'outbox') loadOutbox();
                }}
                className={`inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] transition-all cursor-pointer ${
                  active
                    ? 'bg-foreground text-background font-bold shadow-sm'
                    : 'border border-border bg-surface text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: COMPOSE & SEND */}
        {activeTab === 'compose' && (
          <div className="mt-10 grid gap-10 lg:grid-cols-2">
            {/* Left: Editor Form */}
            <div className="border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Draft Official Dispatch
              </h2>

              <form onSubmit={handleDispatch} className="space-y-5">
                <div>
                  <label className="label-mono block mb-1.5">Subject Line</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. ITSA Dispatch #14: Praxis 2026 Keynote & Hackathon"
                    className="w-full border border-border bg-surface px-4 py-2.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="label-mono block mb-1.5">Body Text (Markdown Paragraphs)</label>
                  <textarea
                    rows={7}
                    required
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full border border-border bg-surface p-3.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Event Selector */}
                <div>
                  <label className="label-mono block mb-2">Embed Upcoming Event Posters</label>
                  <div className="space-y-2 border border-border bg-surface/50 p-3 max-h-48 overflow-y-auto">
                    {availableEvents.map((ev) => {
                      const isChecked = selectedEventIds.includes(ev.id);
                      return (
                        <label
                          key={ev.id}
                          className="flex items-center gap-3 p-2 hover:bg-surface cursor-pointer border border-transparent hover:border-border transition-colors text-xs font-mono"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedEventIds((prev) =>
                                isChecked ? prev.filter((id) => id !== ev.id) : [...prev, ev.id]
                              );
                            }}
                            className="size-4 rounded-none accent-primary"
                          />
                          <span className="text-primary uppercase tracking-wider text-[10px]">
                            [{ev.category}]
                          </span>
                          <span className="font-medium text-foreground truncate">{ev.title}</span>
                          <span className="ml-auto text-muted-foreground text-[10px]">
                            {ev.formatted_date || ev.event_date}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Scheduling Toggle */}
                <div className="border-t border-border pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduling}
                      onChange={(e) => setIsScheduling(e.target.checked)}
                      className="size-4 rounded-none accent-primary"
                    />
                    <span className="font-mono text-xs uppercase tracking-[0.14em] text-foreground">
                      Schedule for later delivery
                    </span>
                  </label>

                  {isScheduling && (
                    <div className="mt-3 p-4 border border-border bg-surface animate-in fade-in-0">
                      <label className="label-mono block mb-1.5">Delivery Date & Time</label>
                      <input
                        type="datetime-local"
                        required={isScheduling}
                        value={scheduleDatetime}
                        onChange={(e) => setScheduleDatetime(e.target.value)}
                        className="w-full border border-border bg-background px-3.5 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="mt-1 text-[10px] font-mono text-muted-foreground">
                        Past timestamps will be automatically rejected.
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                {composeMessage && (
                  <div
                    className={`p-3 font-mono text-xs border ${
                      composeMessage.type === 'success'
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-destructive/40 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {composeMessage.text}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={composeLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-foreground py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    {composeLoading ? (
                      <span>Processing...</span>
                    ) : isScheduling ? (
                      <>
                        <Clock className="size-3.5" />
                        <span>Schedule Dispatch</span>
                      </>
                    ) : (
                      <>
                        <Send className="size-3.5" />
                        <span>Dispatch to All Subscribers Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live Responsive Email Preview */}
            <div className="border border-border bg-surface p-6 sm:p-8 flex flex-col">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h3 className="label-mono">LIVE SUBSCRIBER INBOX PREVIEW</h3>
                <span className="font-mono text-[10px] text-muted-foreground uppercase">HTML Email Frame</span>
              </div>

              {/* Simulated Email Envelope */}
              <div className="border border-border bg-[#ffffff] text-[#1a1918] p-6 sm:p-8 shadow-sm flex-1 overflow-y-auto max-h-[680px]">
                {/* Email Header */}
                <div className="border-b border-[#e2e0d8] pb-4 mb-5 flex items-center justify-between">
                  <div>
                    <span className="font-display text-xl font-extrabold tracking-tight text-[#1a1918]">ITSA</span>
                    <span className="block font-mono text-[8px] uppercase tracking-[0.2em] text-[#6c6b66]">
                      PCCoE · PUNE
                    </span>
                  </div>
                  <span className="font-mono text-[9px] uppercase tracking-wider bg-[#e0f2fe] text-[#2563eb] border border-[#bae6fd] px-2 py-0.5 font-semibold">
                    OFFICIAL DISPATCH
                  </span>
                </div>

                {/* Subject & Body */}
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#2563eb] mb-1">
                  OFFICIAL BULLETIN
                </div>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-[#1a1918] mb-4">
                  {subject || 'ITSA Dispatch: Upcoming Initiatives & Hackathons'}
                </h2>

                <div className="text-xs leading-relaxed text-[#1a1918] space-y-3">
                  {body.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Embedded Event Posters in Email */}
                {previewEvents.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[#e2e0d8]">
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#2563eb] mb-3 font-semibold">
                      FEATURED UPCOMING EVENTS
                    </div>
                    <div className="space-y-3">
                      {previewEvents.map((ev) => (
                        <div key={ev.id} className="border border-[#e2e0d8] bg-[#faf9f7] p-3">
                          <span className="font-mono text-[8px] uppercase tracking-wider text-[#2563eb]">
                            [{ev.category}]
                          </span>
                          <h4 className="font-display text-sm font-bold text-[#1a1918] mt-0.5">
                            {ev.title}
                          </h4>
                          <p className="font-mono text-[9px] text-[#6c6b66]">
                            📅 {ev.formatted_date || ev.event_date} &nbsp;·&nbsp; 📍 {ev.location}
                          </p>
                          <p className="text-[11px] text-[#6c6b66] mt-1 line-clamp-2">
                            {ev.description}
                          </p>
                          <div className="mt-2.5">
                            <span className="inline-block bg-[#1a1918] text-[#ffffff] px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider">
                              View Details / RSVP →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Footer */}
                <div className="mt-8 pt-4 border-t border-[#e2e0d8] font-mono text-[9px] text-[#6c6b66] leading-relaxed">
                  <p>
                    <strong>Information Technology Students' Association</strong><br />
                    PCCoE Pune · <a href="#unsubscribe" className="underline">Unsubscribe instantly</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISPATCHES & QUEUE */}
        {activeTab === 'dispatches' && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-foreground">
                Dispatches Archive & Scheduled Queue
              </h2>
              <button
                type="button"
                onClick={loadNewsletters}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="p-4">Subject</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Recipients</th>
                    <th className="p-4">Opens / Clicks</th>
                    <th className="p-4">Dispatched / Scheduled</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {newsletters.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No dispatches found in history.
                      </td>
                    </tr>
                  ) : (
                    newsletters.map((nl) => (
                      <tr key={nl.id} className="hover:bg-surface/50 transition-colors">
                        <td className="p-4">
                          <p className="font-display text-sm font-bold text-foreground">{nl.subject}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1">{nl.body}</p>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                              nl.status === 'sent'
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : nl.status === 'scheduled'
                                ? 'bg-acid text-black'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {nl.status}
                          </span>
                        </td>
                        <td className="p-4">{nl.recipient_count || 0}</td>
                        <td className="p-4">
                          <span className="text-primary font-bold">{nl.open_count || 0}</span> opens &nbsp;/&nbsp;{' '}
                          <span>{nl.click_count || 0}</span> clicks
                        </td>
                        <td className="p-4 text-muted-foreground text-[10px]">
                          {nl.sent_at || nl.scheduled_at || nl.created_at}
                        </td>
                        <td className="p-4 text-right">
                          {nl.status === 'scheduled' && (
                            <button
                              type="button"
                              onClick={() => handleCancelScheduled(nl.id)}
                              className="text-destructive hover:underline text-[10px] uppercase"
                            >
                              Cancel Send
                            </button>
                          )}
                          {nl.status === 'sent' && (
                            <span className="text-primary text-[10px] uppercase">Delivered</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIBERS TABLE & BULK MANAGEMENT */}
        {activeTab === 'subscribers' && (
          <div className="mt-10">
            {/* Filter controls */}
            <div className="flex flex-col gap-4 mb-6 border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-primary" />
                  <span className="label-mono">SUBSCRIBER DIRECTORY FILTERS</span>
                </div>
                {/* Always-Available Export All CSV Button */}
                <button
                  type="button"
                  onClick={handleExportAllCSV}
                  className="inline-flex items-center gap-2 border border-border bg-surface px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground hover:border-foreground transition-colors cursor-pointer"
                >
                  <Download className="size-3.5 text-primary" />
                  <span>Export All Subscribers (CSV)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') loadSubscribers();
                    }}
                    placeholder="Search by email..."
                    className="w-full border border-border bg-surface pl-9 pr-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={subFilter}
                    onChange={(e) => setSubFilter(e.target.value)}
                    className="w-full border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="unsubscribed">Unsubscribed Only</option>
                  </select>
                </div>

                {/* Source Filter */}
                <div>
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="w-full border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Sources</option>
                    <option value="newsletter_page">newsletter_page</option>
                    <option value="homepage">homepage</option>
                    <option value="events_page">events_page</option>
                  </select>
                </div>

                {/* Date Range Start */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">From:</span>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="w-full border border-border bg-surface px-2 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Date Range End & Filter Apply Button */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">To:</span>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="w-full border border-border bg-surface px-2 py-1.5 font-mono text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={loadSubscribers}
                    className="bg-foreground text-background px-4 py-2 font-mono text-xs uppercase tracking-wider hover:bg-foreground/90 cursor-pointer shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* REQUIRED BULK ACTIONS TOOLBAR */}
            {selectedSubIds.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-2 border-primary bg-primary/10 p-3.5 sm:px-5 animate-in fade-in-0 duration-200">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground font-mono text-xs font-bold px-2.5 py-0.5">
                    {selectedSubIds.length} SELECTED
                  </span>
                  <span className="font-mono text-xs text-muted-foreground hidden sm:inline">
                    Choose bulk action to execute across selected subscribers:
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Bulk Unsubscribe */}
                  <button
                    type="button"
                    onClick={handleBulkUnsubscribe}
                    className="inline-flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-foreground hover:border-primary cursor-pointer"
                  >
                    <UserX className="size-3.5 text-muted-foreground" />
                    <span>Unsubscribe</span>
                  </button>

                  {/* Bulk Resend Verification */}
                  <button
                    type="button"
                    onClick={handleBulkResend}
                    title="Resend verification to pending subscribers in selection"
                    className="inline-flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-primary hover:border-primary cursor-pointer"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Resend Verification (Pending)</span>
                  </button>

                  {/* Bulk Delete */}
                  <button
                    type="button"
                    onClick={() => setDeleteModal({ isOpen: true, type: 'bulk', count: selectedSubIds.length })}
                    className="inline-flex items-center gap-1.5 bg-destructive/10 border border-destructive/40 text-destructive px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider hover:bg-destructive hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>Delete Selected</span>
                  </button>

                  {/* Bulk Export Selected CSV */}
                  <button
                    type="button"
                    onClick={handleBulkExportCSV}
                    className="inline-flex items-center gap-1.5 bg-foreground text-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider hover:bg-foreground/90 cursor-pointer"
                  >
                    <FileDown className="size-3.5" />
                    <span>Export CSV</span>
                  </button>

                  {/* Clear Selection */}
                  <button
                    type="button"
                    onClick={() => setSelectedSubIds([])}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground underline ml-2 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface text-muted-foreground uppercase text-[10px] tracking-wider">
                    <th className="p-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={subscribers.length > 0 && selectedSubIds.length === subscribers.length}
                        onChange={handleSelectAll}
                        aria-label="Select all subscribers"
                        className="size-4 cursor-pointer accent-primary"
                      />
                    </th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Subscribed Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">
                        No matching subscribers found for the current query.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub) => {
                      const isSelected = selectedSubIds.includes(sub.id);
                      return (
                        <tr
                          key={sub.id}
                          className={`transition-colors ${
                            isSelected ? 'bg-primary/5' : 'hover:bg-surface/50'
                          }`}
                        >
                          <td className="p-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(sub.id)}
                              aria-label={`Select subscriber ${sub.email}`}
                              className="size-4 cursor-pointer accent-primary"
                            />
                          </td>
                          <td className="p-4 font-semibold text-foreground">
                            {sub.email}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${
                                sub.status === 'verified'
                                  ? 'bg-primary/10 text-primary border border-primary/20'
                                  : sub.status === 'pending'
                                  ? 'bg-acid text-black'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-4 text-muted-foreground text-[10px]">{sub.source || 'newsletter_page'}</td>
                          <td className="p-4 text-muted-foreground text-[10px]">{sub.subscribed_at}</td>
                          <td className="p-4 text-right space-x-3">
                            {sub.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleResendVerification(sub.id)}
                                className="text-primary hover:underline text-[10px] uppercase cursor-pointer"
                              >
                                Resend
                              </button>
                            )}
                            {sub.status !== 'unsubscribed' && (
                              <button
                                type="button"
                                onClick={() => handleManualUnsubscribe(sub.id)}
                                className="text-muted-foreground hover:text-foreground text-[10px] uppercase cursor-pointer"
                              >
                                Unsubscribe
                              </button>
                            )}
                            {sub.status === 'unsubscribed' && (
                              <button
                                type="button"
                                onClick={() => handleManualResubscribe(sub.id)}
                                className="text-primary hover:underline text-[10px] uppercase cursor-pointer"
                              >
                                Resubscribe
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteModal({ isOpen: true, type: 'single', subId: sub.id, email: sub.email })}
                              className="text-destructive hover:underline text-[10px] uppercase cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
              <span>Showing {subscribers.length} total subscribers</span>
              {selectedSubIds.length > 0 && (
                <span className="text-primary font-semibold">{selectedSubIds.length} subscriber(s) currently selected</span>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: MINIMAL ANALYTICS DASHBOARD & PERFORMANCE */}
        {activeTab === 'analytics' && analytics && (
          <div className="mt-10 space-y-10">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-border bg-card p-6">
                <p className="label-mono">Total Subscribers</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-foreground">
                  {analytics.summary.totalSubscribers}
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {analytics.summary.verifiedCount} verified · {analytics.summary.pendingCount} pending
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="label-mono">Verification Rate</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-primary">
                  {analytics.summary.verificationRate}%
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  Double opt-in conversion
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="label-mono">Average Open Rate</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-foreground">
                  {analytics.summary.openRate}%
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {analytics.summary.totalOpens} confirmed opens
                </p>
              </div>

              <div className="border border-border bg-card p-6">
                <p className="label-mono">Click-Through Rate</p>
                <p className="mt-2 font-display text-4xl font-extrabold text-primary">
                  {analytics.summary.clickRate}%
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {analytics.summary.totalClicks} interaction clicks
                </p>
              </div>
            </div>

            {/* Subscriber Growth Chart (Minimalist SVG/CSS Bar Chart) */}
            <div className="border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
                <div>
                  <h3 className="label-mono">SUBSCRIBER GROWTH TIMELINE</h3>
                  <p className="font-display text-lg font-bold text-foreground mt-1">
                    New Subscriptions by Date
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  Past 14 Days Activity
                </span>
              </div>

              {analytics.growthTimeline && analytics.growthTimeline.length > 0 ? (
                <div className="pt-6">
                  {/* SVG minimal bar graph */}
                  <div className="h-44 w-full flex items-end gap-3 sm:gap-6 border-b border-foreground/20 pb-2">
                    {analytics.growthTimeline.map((item, idx) => {
                      const maxVal = Math.max(...analytics.growthTimeline.map((g) => g.count), 5);
                      const heightPercent = Math.max(15, Math.round((item.count / maxVal) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                          <span className="font-mono text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            {item.count}
                          </span>
                          <div
                            className="w-full max-w-[36px] bg-primary group-hover:bg-acid transition-colors"
                            style={{ height: `${heightPercent}%` }}
                          ></div>
                          <span className="font-mono text-[9px] text-muted-foreground truncate w-full text-center">
                            {item.date ? item.date.slice(5) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="font-mono text-xs text-muted-foreground py-8 text-center">
                  Growth activity will populate as new subscriptions are registered.
                </p>
              )}
            </div>

            {/* Per-Newsletter Performance Table */}
            <div className="border border-border bg-card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                  <h3 className="label-mono">PER-NEWSLETTER PERFORMANCE</h3>
                  <p className="font-display text-lg font-bold text-foreground mt-1">
                    Dispatches Open &amp; Click Ratios
                  </p>
                </div>
                <span className="font-mono text-[10px] uppercase text-muted-foreground">
                  Delivery Metrics
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="p-3">Newsletter Subject</th>
                      <th className="p-3">Sent Date</th>
                      <th className="p-3">Recipients</th>
                      <th className="p-3">Opens</th>
                      <th className="p-3">Clicks</th>
                      <th className="p-3">Bounces</th>
                      <th className="p-3">Unsubscribes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analytics.newsletterStats && analytics.newsletterStats.length > 0 ? (
                      analytics.newsletterStats.map((nl) => {
                        const openPct = nl.recipients > 0 ? Math.round((nl.opens / nl.recipients) * 100) : 0;
                        const clickPct = nl.recipients > 0 ? Math.round((nl.clicks / nl.recipients) * 100) : 0;
                        return (
                          <tr key={nl.id} className="hover:bg-surface/50 transition-colors">
                            <td className="p-3 font-semibold text-foreground">{nl.subject}</td>
                            <td className="p-3 text-muted-foreground text-[10px]">{nl.sent_at}</td>
                            <td className="p-3 font-bold">{nl.recipients}</td>
                            <td className="p-3">
                              <span className="text-primary font-bold">{nl.opens}</span>
                              <span className="text-muted-foreground ml-1 text-[10px]">({openPct}%)</span>
                            </td>
                            <td className="p-3">
                              <span className="text-foreground font-bold">{nl.clicks}</span>
                              <span className="text-muted-foreground ml-1 text-[10px]">({clickPct}%)</span>
                            </td>
                            <td className="p-3 text-muted-foreground">{nl.bounces || 0}</td>
                            <td className="p-3 text-muted-foreground">{nl.unsubscribes || 0}</td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-muted-foreground">
                          No dispatched newsletter metrics available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Overview in Minimal Aesthetics */}
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="border border-border bg-card p-6">
                <h3 className="label-mono mb-4">ENGAGEMENT RATIOS</h3>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Verification Completion</span>
                      <span className="font-bold text-foreground">{analytics.summary.verificationRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${analytics.summary.verificationRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Open Rate Efficiency</span>
                      <span className="font-bold text-foreground">{analytics.summary.openRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${analytics.summary.openRate}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-muted-foreground mb-1">
                      <span>Unsubscribe Churn</span>
                      <span className="font-bold text-destructive">{analytics.summary.unsubscribeRate}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface">
                      <div
                        className="h-full bg-destructive"
                        style={{ width: `${analytics.summary.unsubscribeRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-border bg-card p-6">
                <h3 className="label-mono mb-4">RECENT SUBSCRIBER ACTIVITY</h3>
                <div className="space-y-3 font-mono text-xs">
                  {analytics.recentActivity && analytics.recentActivity.map((act, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-semibold text-foreground">{act.title}</p>
                        <p className="text-[10px] text-muted-foreground">Status: {act.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OUTBOX INSPECTOR */}
        {activeTab === 'outbox' && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Simulated Outbox &amp; Verification Token Inspector
                </h2>
                <p className="text-xs font-mono text-muted-foreground">
                  Every email dispatched by the system is saved here for instant local browser inspection and testing.
                </p>
              </div>
              <button
                type="button"
                onClick={loadOutbox}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:underline cursor-pointer"
              >
                <RefreshCw className="size-3.5" />
                <span>Refresh Outbox</span>
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Outbox List */}
              <div className="border border-border bg-card overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-surface text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3 text-right">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {outbox.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-muted-foreground">
                          Outbox empty. Send a test subscription or dispatch a newsletter to see generated emails.
                        </td>
                      </tr>
                    ) : (
                      outbox.map((mail) => (
                        <tr
                          key={mail.id}
                          onClick={() => setSelectedEmail(mail)}
                          className={`hover:bg-surface/60 cursor-pointer transition-colors ${
                            selectedEmail?.id === mail.id ? 'bg-surface font-semibold' : ''
                          }`}
                        >
                          <td className="p-3 truncate max-w-[150px]">{mail.to_email}</td>
                          <td className="p-3">
                            <span className="text-[9px] uppercase px-1.5 py-0.5 border border-border">
                              {mail.email_type}
                            </span>
                          </td>
                          <td className="p-3 truncate max-w-[180px]">{mail.subject}</td>
                          <td className="p-3 text-right">
                            <span className="text-primary text-[10px]">View →</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selected Email Frame */}
              <div className="border border-border bg-card p-5">
                {selectedEmail ? (
                  <div>
                    <div className="border-b border-border pb-3 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">
                          DISPATCH PREVIEW · {selectedEmail.email_type}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {selectedEmail.created_at}
                        </span>
                      </div>
                      <h3 className="font-display text-base font-bold text-foreground mt-1">
                        {selectedEmail.subject}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground">
                        To: <span className="text-foreground">{selectedEmail.to_email}</span>
                      </p>
                    </div>

                    <iframe
                      title="Email Preview"
                      srcDoc={selectedEmail.html_content}
                      className="w-full h-[450px] border border-border bg-white"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground font-mono text-xs">
                    <Mail className="size-8 mb-2 opacity-40" />
                    <p>Select an email from the left list to inspect its rendered HTML contents and test links.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FLOATING THEMED TOAST NOTIFICATION */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in-0 duration-300">
            <div
              className={`flex items-center gap-3 border p-4 shadow-2xl font-mono text-xs max-w-md ${
                toast.type === 'error'
                  ? 'border-destructive bg-card text-destructive'
                  : 'border-primary bg-card text-foreground'
              }`}
            >
              {toast.type === 'error' ? (
                <AlertTriangle className="size-4 shrink-0 text-destructive" />
              ) : (
                <Check className="size-4 shrink-0 text-primary" />
              )}
              <span className="flex-1">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast(null)}
                className="text-muted-foreground hover:text-foreground ml-2 cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* THEMED CONFIRMATION MODAL FOR DELETION */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
            <div className="relative w-full max-w-md border-2 border-destructive bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-2.5 text-destructive mb-3">
                <Trash2 className="size-5" />
                <h3 className="font-display text-lg font-bold">
                  {deleteModal.type === 'bulk'
                    ? `Delete ${deleteModal.count} Subscribers?`
                    : 'Delete Subscriber Record?'}
                </h3>
              </div>

              <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                {deleteModal.type === 'bulk'
                  ? `Are you sure you want to permanently delete ${deleteModal.count} selected subscriber(s)? This action cannot be undone.`
                  : `Are you sure you want to delete ${deleteModal.email || 'this subscriber'} from the database? This action cannot be undone.`}
              </p>

              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setDeleteModal({ isOpen: false, type: 'single', subId: null, count: 1 })}
                  className="px-4 py-2 border border-border bg-surface font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={
                    deleteModal.type === 'bulk'
                      ? handleBulkDeleteConfirm
                      : handleDeleteSingleConfirm
                  }
                  className="px-4 py-2 bg-destructive text-white font-mono text-xs uppercase tracking-wider hover:bg-destructive/90 transition-colors cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
