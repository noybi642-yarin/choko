import { useMemo, useEffect, useRef, useState } from 'react';
import { getEvents, getGuests } from '../store';
import {
  Users, UserCheck, Clock, HelpCircle,
  MessageCircle, TrendingUp, Gem, BarChart3,
} from 'lucide-react';

// ── Count-up animation ──────────────────────────────────────────────────────
function useCountUp(target, duration = 950) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!target) { setVal(0); return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(Math.round(eased * target));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return val;
}

// ── SVG progress ring ────────────────────────────────────────────────────────
function Ring({ pct, size = 52 }) {
  const r = (size - 7) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.max(0, Math.min(pct / 100, 1)) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="5" />
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.1s cubic-bezier(.4,0,.2,1)' }} />
    </svg>
  );
}

// ── Hero KPI card (colored gradient bg) ──────────────────────────────────────
function HeroCard({ icon: Icon, label, sub, value, gradient, pct, ringLabel }) {
  const count = useCountUp(value);
  const showRing = pct !== undefined;
  return (
    <div className="kpi-hero" style={{ background: gradient }}>
      <div className="kpi-hero-shimmer" />
      <div className="kpi-hero-top">
        <div className="kpi-hero-icon-wrap">
          <Icon size={20} strokeWidth={1.8} />
        </div>
        {showRing && (
          <div className="kpi-hero-ring-wrap">
            <Ring pct={pct} />
            <span className="kpi-hero-ring-label">{ringLabel}</span>
          </div>
        )}
      </div>
      <div className="kpi-hero-val">{count.toLocaleString('he-IL')}</div>
      <div className="kpi-hero-label">{label}</div>
      {sub && <div className="kpi-hero-sub">{sub}</div>}
    </div>
  );
}

// ── Small metric card ────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, suffix, chip, chipVariant = 'neutral' }) {
  const isNum = typeof value === 'number';
  const count = useCountUp(isNum ? value : 0);
  return (
    <div className="kpi-metric">
      <div className="kpi-metric-icon-wrap">
        <Icon size={18} strokeWidth={1.8} />
      </div>
      <div className="kpi-metric-body">
        <div className="kpi-metric-val">
          {isNum ? count.toLocaleString('he-IL') : value}
          {suffix && <span className="kpi-metric-suffix">{suffix}</span>}
        </div>
        <div className="kpi-metric-label">{label}</div>
      </div>
      {chip && <div className={`kpi-chip kpi-chip--${chipVariant}`}>{chip}</div>}
    </div>
  );
}

// ── Stacked bar breakdown ────────────────────────────────────────────────────
function BreakdownBar({ confirmed, maybe, pending, declined }) {
  const total = confirmed + maybe + pending + declined || 1;
  const pConfirmed = (confirmed / total) * 100;
  const pMaybe     = (maybe     / total) * 100;
  const pPending   = (pending   / total) * 100;
  const pDeclined  = (declined  / total) * 100;
  return (
    <div className="kpi-breakdown">
      <div className="kpi-breakdown-header">
        <span className="kpi-breakdown-title">פילוח תגובות</span>
      </div>
      <div className="kpi-breakdown-bar">
        {pConfirmed > 0 && <div className="kpi-bar-seg seg--confirmed" style={{ width: `${pConfirmed}%` }} title={`אישרו: ${confirmed}`} />}
        {pMaybe     > 0 && <div className="kpi-bar-seg seg--maybe"     style={{ width: `${pMaybe}%`     }} title={`אולי: ${maybe}`} />}
        {pPending   > 0 && <div className="kpi-bar-seg seg--pending"   style={{ width: `${pPending}%`   }} title={`ממתינים: ${pending}`} />}
        {pDeclined  > 0 && <div className="kpi-bar-seg seg--declined"  style={{ width: `${pDeclined}%`  }} title={`לא מגיעים: ${declined}`} />}
      </div>
      <div className="kpi-breakdown-legend">
        <div className="kpi-legend-item"><div className="kpi-legend-dot dot--confirmed"/><span>{confirmed} אישרו</span></div>
        <div className="kpi-legend-item"><div className="kpi-legend-dot dot--maybe"    /><span>{maybe} אולי</span></div>
        <div className="kpi-legend-item"><div className="kpi-legend-dot dot--pending"  /><span>{pending} ממתינים</span></div>
        <div className="kpi-legend-item"><div className="kpi-legend-dot dot--declined" /><span>{declined} לא מגיעים</span></div>
      </div>
    </div>
  );
}

// ── Package tier helper ──────────────────────────────────────────────────────
function packageTier(total) {
  if (total <= 100) return { name: 'Basic', price: '₪199', variant: 'basic' };
  if (total <= 300) return { name: 'Pro',   price: '₪349', variant: 'pro'   };
  return                   { name: 'Premium', price: '₪599', variant: 'premium' };
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function KPISection({ userId }) {
  const stats = useMemo(() => {
    const events = getEvents(userId);
    let total = 0, confirmed = 0, pending = 0, maybe = 0, declined = 0, expectedHeads = 0;
    for (const ev of events) {
      const guests = getGuests(ev.id);
      total     += guests.length;
      confirmed += guests.filter(g => g.status === 'coming').length;
      pending   += guests.filter(g => g.status === 'pending').length;
      maybe     += guests.filter(g => g.status === 'maybe').length;
      declined  += guests.filter(g => g.status === 'no').length;
      expectedHeads += guests.filter(g => g.status === 'coming').reduce((s, g) => s + (g.guests || 1), 0);
    }
    const responded   = confirmed + maybe + declined;
    const responseRate = total ? Math.round((responded / total) * 100) : 0;
    const whatsappSent = total;
    const pkg          = packageTier(total);
    return { total, confirmed, pending, maybe, declined, expectedHeads, responseRate, whatsappSent, pkg };
  }, [userId]);

  return (
    <section className="kpi-section">
      <div className="kpi-section-header">
        <div className="kpi-section-title-wrap">
          <BarChart3 size={20} strokeWidth={2} className="kpi-section-icon" />
          <h2 className="kpi-section-title">סקירה כללית</h2>
        </div>
        <div className="kpi-section-badge">עדכני</div>
      </div>

      {/* Hero row — 3 big cards */}
      <div className="kpi-hero-row">
        <HeroCard
          icon={Users}
          label="סה״כ מוזמנים"
          sub={`${stats.total} רשומים`}
          value={stats.total}
          gradient="linear-gradient(135deg, oklch(0.62 0.2 30) 0%, oklch(0.52 0.22 15) 100%)"
        />
        <HeroCard
          icon={UserCheck}
          label="אישרו הגעה"
          sub={`${stats.confirmed} משפחות`}
          value={stats.confirmed}
          gradient="linear-gradient(135deg, oklch(0.52 0.16 155) 0%, oklch(0.42 0.18 165) 100%)"
        />
        <HeroCard
          icon={TrendingUp}
          label="שיעור מענה"
          sub="מתוך כלל המוזמנים"
          value={stats.responseRate}
          gradient="linear-gradient(135deg, oklch(0.55 0.22 295) 0%, oklch(0.45 0.24 280) 100%)"
          pct={stats.responseRate}
          ringLabel={`${stats.responseRate}%`}
        />
      </div>

      {/* Metrics row — 4 smaller cards */}
      <div className="kpi-metrics-row">
        <MetricCard
          icon={Clock}
          label="ממתינים לתשובה"
          value={stats.pending}
          chip="טעון מעקב"
          chipVariant={stats.pending > 0 ? 'warn' : 'ok'}
        />
        <MetricCard
          icon={HelpCircle}
          label="אולי מגיעים"
          value={stats.maybe}
          chip="לא ודאי"
          chipVariant="neutral"
        />
        <MetricCard
          icon={Users}
          label="צפי הגעה"
          value={stats.expectedHeads}
          suffix=" איש"
          chip="סה״כ אנשים"
          chipVariant="success"
        />
        <MetricCard
          icon={MessageCircle}
          label="הזמנות נשלחו"
          value={stats.whatsappSent}
          chip="WhatsApp"
          chipVariant="wa"
        />
      </div>

      {/* Bottom row — breakdown bar + package card */}
      <div className="kpi-bottom-row">
        <BreakdownBar
          confirmed={stats.confirmed}
          maybe={stats.maybe}
          pending={stats.pending}
          declined={stats.declined}
        />
        <div className="kpi-package">
          <div className="kpi-package-icon-wrap">
            <Gem size={22} strokeWidth={1.6} />
          </div>
          <div className="kpi-package-body">
            <div className="kpi-package-name">{stats.pkg.name}</div>
            <div className="kpi-package-label">חבילה נבחרת</div>
          </div>
          <div className={`kpi-package-price kpi-pkg--${stats.pkg.variant}`}>
            {stats.pkg.price}
            <span>/חודש</span>
          </div>
        </div>
      </div>
    </section>
  );
}
