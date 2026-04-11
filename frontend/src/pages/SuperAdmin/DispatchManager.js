import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Truck,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Loader2,
  Navigation,
  RefreshCw,
  Search,
  Phone,
  Mail,
  Building2,
  Home,
  ExternalLink,
  Radio,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/api';
import '../../styles/Admin.css';

const VISIT_FILTERS = [
  { value: 'all', label: 'All types' },
  { value: 'home', label: 'Home draw' },
  { value: 'lab', label: 'Lab visit' },
];

function coordsToLatLng(coordinates) {
  const c = coordinates?.coordinates;
  if (!c || c.length < 2) return null;
  const [lng, lat] = c;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return { lat, lng };
}

function buildEmbedSrc(booking) {
  const ll = booking ? coordsToLatLng(booking.coordinates) : null;
  if (ll) {
    return `https://www.google.com/maps?q=${ll.lat},${ll.lng}&z=14&output=embed`;
  }
  return 'https://www.google.com/maps?q=New+York%2C+NY&z=11&output=embed';
}

function buildExternalMapsUrl(booking) {
  const ll = coordsToLatLng(booking?.coordinates);
  if (ll) {
    return `https://www.google.com/maps/search/?api=1&query=${ll.lat},${ll.lng}`;
  }
  const q = encodeURIComponent(booking?.address || 'New York, NY');
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function formatCreatedAt(createdAt) {
  if (!createdAt) return null;
  try {
    const d = new Date(createdAt);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
}

/** Readable message from axios / API failures (avoids generic "check the API"). */
function dispatchLoadErrorMessage(err) {
  if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return 'Cannot reach the backend API. Start Django on port 8000 (and ensure the React proxy points to it).';
  }
  const status = err?.response?.status;
  const d = err?.response?.data;
  if (typeof d === 'string') {
    const s = d.replace(/<[^>]+>/g, ' ').trim();
    return s.length > 220 ? `${s.slice(0, 220)}…` : s || `HTTP ${status || 'error'}`;
  }
  if (d && typeof d === 'object') {
    const hint = [d.hint, d.detail, d.error, d.message].filter(Boolean).join(' — ');
    if (hint) return hint;
  }
  if (status === 503) {
    return 'Database unavailable (MongoDB). Start MongoDB or enable mock fallback in backend settings.';
  }
  if (status) {
    return `Request failed (HTTP ${status}).`;
  }
  return err?.message || 'Unable to load the dispatch queue.';
}

const DispatchManager = () => {
  const [pendingBookings, setPendingBookings] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [visitFilter, setVisitFilter] = useState('all');
  const [mapFocusId, setMapFocusId] = useState(null);
  const [manualSpecialistIds, setManualSpecialistIds] = useState({}); // { bookingId: specId }

  const loadData = useCallback(async ({ silent } = {}) => {
    if (silent) setRefreshing(true);
    else {
      setLoading(true);
      setFetchError(null);
    }
    try {
      const [bookingsResult, fleetResult] = await Promise.allSettled([
        api.get('/api/superadmin/bookings/pending/'),
        api.get('/api/superadmin/fleet/'),
      ]);

      if (bookingsResult.status !== 'fulfilled') {
        throw bookingsResult.reason;
      }
      const bookingsData = bookingsResult.value.data;
      if (!Array.isArray(bookingsData)) {
        setFetchError(
          (bookingsData && (bookingsData.hint || bookingsData.detail || bookingsData.error)) ||
            'Dispatch API returned an unexpected response (expected a list).'
        );
        setPendingBookings([]);
        setFleet([]);
        return;
      }
      setPendingBookings(bookingsData);

      if (fleetResult.status === 'fulfilled') {
        const fleetData = fleetResult.value.data;
        setFleet(Array.isArray(fleetData) ? fleetData : []);
      } else {
        setFleet([]);
      }
      setFetchError(null);
    } catch (err) {
      console.error('Dispatch queue load failed', err);
      setFetchError(dispatchLoadErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!notification) return undefined;
    const t = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(t);
  }, [notification]);

  const onlineSpecialists = useMemo(
    () => fleet.filter((m) => m.is_online).length,
    [fleet]
  );

  const filteredBookings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return pendingBookings.filter((b) => {
      if (visitFilter !== 'all' && (b.visit_type || '') !== visitFilter) {
        return false;
      }
      if (!q) return true;
      const hay = [
        b.full_name,
        b.address,
        b.email,
        b.phone,
        b.alt_phone,
        b.test_name,
        b.test_id,
        b.id,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [pendingBookings, search, visitFilter]);

  const mapBooking = useMemo(() => {
    if (mapFocusId) {
      const hit = filteredBookings.find((b) => b.id === mapFocusId);
      if (hit) return hit;
    }
    const withCoords = filteredBookings.find(
      (b) => b.visit_type === 'home' && coordsToLatLng(b.coordinates)
    );
    return withCoords || filteredBookings[0] || null;
  }, [filteredBookings, mapFocusId]);

  useEffect(() => {
    if (
      mapFocusId &&
      !filteredBookings.some((b) => b.id === mapFocusId)
    ) {
      setMapFocusId(null);
    }
  }, [filteredBookings, mapFocusId]);

  const stats = useMemo(() => {
    const home = pendingBookings.filter((b) => b.visit_type === 'home').length;
    const lab = pendingBookings.filter((b) => b.visit_type === 'lab').length;
    const needsGeo = pendingBookings.filter(
      (b) => b.visit_type === 'home' && !coordsToLatLng(b.coordinates)
    ).length;
    return { home, lab, needsGeo, total: pendingBookings.length };
  }, [pendingBookings]);

  const handleGeocode = async (bookingId) => {
    setActionLoading(`geo-${bookingId}`);
    try {
      await api.post(`/api/superadmin/bookings/${bookingId}/geocode/`);
      setNotification({ type: 'success', message: 'Geocoding successful. Map updated.' });
      await loadData({ silent: true });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Geocoding failed. Try a simpler address.'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (booking, manualSpecId = null) => {
    const id = booking.id;
    setActionLoading(id);
    try {
      const payload = manualSpecId ? { specialist_id: manualSpecId } : {};
      const res = await api.post(`/api/superadmin/bookings/${id}/approve/`, payload);
      const base = res.data?.message || 'Request updated.';
      const spec = res.data?.specialist?.name;
      setNotification({
        type: 'success',
        message: spec ? `${base} (${spec})` : base,
      });
      await loadData({ silent: true });
    } catch (err) {
      setNotification({
        type: 'error',
        message:
          err.response?.data?.error ||
          'Action failed. Ensure a specialist is online and within range, or assign manually.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <Loader2
          className="animate-spin"
          size={44}
          strokeWidth={2}
          style={{ color: 'var(--admin-accent)' }}
        />
        <p>Loading dispatch queue…</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="dispatch-center">
        <div className="admin-module dispatch-center__error-panel">
          <div className="module-body dispatch-center__error-body">
            <AlertCircle size={40} className="dispatch-center__error-icon" />
            <h2 className="dispatch-center__error-title">Could not load dispatch data</h2>
            <p className="dispatch-center__error-text">{fetchError}</p>
            <button
              type="button"
              className="btn-primary dispatch-center__retry"
              onClick={() => loadData()}
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dispatch-center">
      <div className="admin-header-main dispatch-center__header">
        <div>
          <h1 className="admin-page-title">Dispatch center</h1>
          <p className="admin-page-subtitle">
            Approve bookings and assign mobile phlebotomy for home draws
          </p>
        </div>
        <div className="dispatch-center__header-actions">
          <button
            type="button"
            className="dispatch-center__refresh"
            onClick={() => loadData({ silent: true })}
            disabled={refreshing}
            aria-label="Refresh queue"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="admin-glass dispatch-center__status-pill">
            <span className="dispatch-center__status-label">Fleet online</span>
            <span className="dispatch-center__status-value">
              <Radio size={14} className="dispatch-center__pulse" />
              {onlineSpecialists} specialist{onlineSpecialists !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="dispatch-center__kpi-row">
        <div className="dispatch-center__kpi">
          <span className="dispatch-center__kpi-label">Pending</span>
          <span className="dispatch-center__kpi-value">{stats.total}</span>
        </div>
        <div className="dispatch-center__kpi">
          <span className="dispatch-center__kpi-label">Home draws</span>
          <span className="dispatch-center__kpi-value">{stats.home}</span>
        </div>
        <div className="dispatch-center__kpi">
          <span className="dispatch-center__kpi-label">Lab visits</span>
          <span className="dispatch-center__kpi-value">{stats.lab}</span>
        </div>
        {stats.needsGeo > 0 && (
          <div className="dispatch-center__kpi dispatch-center__kpi--warn">
            <span className="dispatch-center__kpi-label">Missing map data</span>
            <span className="dispatch-center__kpi-value">{stats.needsGeo}</span>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {notification && (
          <motion.div
            key={notification.message}
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`dispatch-center__toast ${
              notification.type === 'success'
                ? 'dispatch-center__toast--ok'
                : 'dispatch-center__toast--err'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="dispatch-center__layout">
        <div className="dispatch-center__queue">
          <div className="admin-module">
            <div className="module-header dispatch-center__module-head">
              <div>
                <h2 className="module-title">Queue</h2>
                <p className="dispatch-center__module-meta">
                  {filteredBookings.length} shown
                  {filteredBookings.length !== stats.total
                    ? ` of ${stats.total}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="module-body dispatch-center__panel">
              <div className="dispatch-center__toolbar">
                <div className="dispatch-center__search-wrap">
                  <Search size={18} className="dispatch-center__search-icon" aria-hidden />
                  <input
                    type="search"
                    className="dispatch-center__search-input"
                    placeholder="Search name, address, email, phone…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Filter queue"
                  />
                </div>
                <select
                  className="dispatch-center__select"
                  value={visitFilter}
                  onChange={(e) => setVisitFilter(e.target.value)}
                  aria-label="Visit type"
                >
                  {VISIT_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dispatch-center__list-body">
              {filteredBookings.length === 0 ? (
                <div className="dispatch-center__empty">
                  <div className="dispatch-center__empty-icon">
                    <Truck size={28} />
                  </div>
                  <h3 className="dispatch-center__empty-title">
                    {stats.total === 0 ? 'Queue is clear' : 'No matches'}
                  </h3>
                  <p className="dispatch-center__empty-text">
                    {stats.total === 0
                      ? 'New booking requests will appear here for review.'
                      : 'Try another search or reset the visit type filter.'}
                  </p>
                </div>
              ) : (
                <ul className="dispatch-center__list">
                  {filteredBookings.map((booking) => {
                    const isHome = booking.visit_type === 'home';
                    const hasGeo = !!coordsToLatLng(booking.coordinates);
                    const created = formatCreatedAt(booking.created_at);
                    const isMapActive = mapBooking?.id === booking.id;

                    return (
                      <motion.li
                        key={booking.id}
                        layout
                        className={`dispatch-center__card ${
                          isMapActive ? 'dispatch-center__card--focus' : ''
                        }`}
                      >
                        <div className="dispatch-center__card-main">
                          <div className="dispatch-center__avatar">
                            <User size={22} />
                          </div>
                          <div className="dispatch-center__card-info">
                            <div className="dispatch-center__card-title-row">
                              <h3 className="dispatch-center__patient">
                                {booking.full_name || 'Unnamed patient'}
                              </h3>
                              <span
                                className={`dispatch-center__badge ${
                                  isHome
                                    ? 'dispatch-center__badge--home'
                                    : 'dispatch-center__badge--lab'
                                }`}
                              >
                                {isHome ? (
                                  <>
                                    <Home size={12} /> Home draw
                                  </>
                                ) : (
                                  <>
                                    <Building2 size={12} /> Lab visit
                                  </>
                                )}
                              </span>
                            </div>
                            <div className="dispatch-center__meta">
                              <span className="dispatch-center__meta-item">
                                <MapPin size={12} />
                                {booking.address || (isHome ? 'Address required' : '—')}
                              </span>
                              <span className="dispatch-center__meta-item">
                                <Clock size={12} />
                                {booking.preferred_date || '—'} ·{' '}
                                {booking.preferred_time || '—'}
                              </span>
                            </div>
                            {(booking.email || booking.phone) && (
                              <div className="dispatch-center__contact">
                                {booking.phone && (
                                  <a href={`tel:${booking.phone}`} className="dispatch-center__link">
                                    <Phone size={12} />
                                    {booking.phone}
                                  </a>
                                )}
                                {booking.alt_phone && (
                                  <span className="dispatch-center__link opacity-80">
                                    <Phone size={12} className="text-secondary" />
                                    {booking.alt_phone} (Alt)
                                  </span>
                                )}
                                {booking.email && (
                                  <a
                                    href={`mailto:${booking.email}`}
                                    className="dispatch-center__link"
                                  >
                                    <Mail size={12} />
                                    {booking.email}
                                  </a>
                                )}
                              </div>
                            )}
                            {booking.test_name && (
                              <p className="dispatch-center__test-id">
                                Analysis: <strong>{booking.test_name}</strong>
                              </p>
                            )}
                            {created && (
                              <p className="dispatch-center__subtle">Requested {created}</p>
                            )}
                            {isHome && !hasGeo && (
                              <div className="dispatch-center__warn-block">
                                <p className="dispatch-center__warn-inline">
                                  <AlertCircle size={14} />
                                  No coordinates — auto-dispatch unavailable.
                                </p>
                                <button 
                                  className="dispatch-center__retry-geo-btn"
                                  onClick={() => handleGeocode(booking.id)}
                                  disabled={actionLoading === `geo-${booking.id}`}
                                >
                                  {actionLoading === `geo-${booking.id}` ? (
                                    <Loader2 className="animate-spin" size={12} />
                                  ) : (
                                    <RefreshCw size={12} />
                                  )}
                                  Retry geocode
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="dispatch-center__card-actions">
                          {isHome && (
                            <div className="dispatch-center__manual-assign flex items-center gap-2">
                              <select 
                                className="dispatch-center__select dispatch-center__select--compact"
                                value={manualSpecialistIds[booking.id] || ''}
                                onChange={(e) => setManualSpecialistIds({
                                  ...manualSpecialistIds,
                                  [booking.id]: e.target.value
                                })}
                                aria-label="Manual Specialist Selection"
                              >
                                <option value="">Auto-Assign (Nearest)</option>
                                {fleet.filter(f => f.is_online).map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          {isHome && hasGeo && (
                            <button
                              type="button"
                              className="dispatch-center__ghost-btn"
                              onClick={() =>
                                setMapFocusId(
                                  mapFocusId === booking.id ? null : booking.id
                                )
                              }
                            >
                              <MapPin size={14} />
                              {mapFocusId === booking.id
                                ? 'Clear map focus'
                                : 'Show on map'}
                            </button>
                          )}
                          <a
                            className="dispatch-center__ghost-btn"
                            href={buildExternalMapsUrl(booking)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink size={14} />
                            Maps
                          </a>
                            <button
                            type="button"
                            className="btn-primary dispatch-center__approve"
                            disabled={actionLoading === booking.id || (isHome && !hasGeo && !manualSpecialistIds[booking.id])}
                            onClick={() => handleApprove(booking, manualSpecialistIds[booking.id])}
                          >
                            {actionLoading === booking.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Navigation size={14} />
                            )}
                            {isHome ? 'Approve & dispatch' : 'Approve visit'}
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-module dispatch-center__map-module">
          <div className="module-header dispatch-center__map-head">
            <div>
              <h2 className="module-title">Area preview</h2>
              <p className="dispatch-center__module-meta">
                {mapBooking
                  ? mapBooking.address || 'Selected request'
                  : 'Default region'}
              </p>
            </div>
            <a
              className="dispatch-center__ghost-btn dispatch-center__ghost-btn--compact"
              href={buildExternalMapsUrl(mapBooking)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} />
              Open in Google Maps
            </a>
          </div>
          <div className="dispatch-center__map-frame">
            <iframe
              title="Dispatch map preview"
              className="dispatch-center__iframe"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={buildEmbedSrc(mapBooking)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchManager;
