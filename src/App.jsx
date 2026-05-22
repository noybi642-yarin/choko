import { useState, useEffect } from 'react';
import './index.css';
import './app.css';
import './venue.css';
import { initStore, initVenueStore, getSession, getVenueSession, logout, venueLogout } from './store';
import Landing from './Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EventCreate from './pages/EventCreate';
import EventDetail from './pages/EventDetail';
import GuestRSVP from './pages/GuestRSVP';
import AIAssistant from './pages/AIAssistant';
import InviteDesign from './pages/InviteDesign';
import WhatsAppScheduler from './pages/WhatsAppScheduler';
import GuestCalculator from './pages/GuestCalculator';
import SeatingPlan from './pages/SeatingPlan';
import VenueCanvas from './pages/VenueCanvas';
import VenueLogin from './pages/VenueLogin';
import VenueDashboard from './pages/VenueDashboard';
import VenueBranding from './pages/VenueBranding';
import VenueWedding from './pages/VenueWedding';
import LiveVenueMode from './pages/LiveVenueMode';
import {
  LayoutGrid, Settings, LogOut, ChevronDown,
  Home, PlusCircle, Sparkles, Armchair, Map,
  Calendar, Users, FileText, BarChart2, Activity,
  Menu, X, ChevronLeft,
} from 'lucide-react';

initStore();
initVenueStore();

// ── Couple sidebar ────────────────────────────────────────────────────────────
function AppSidebar({ user, currentPage, navigate, onLogout }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">choko<span className="logo-dot"/></div>
      <nav className="sidebar-nav">
        <button className={`sidebar-link${currentPage==='dashboard'?' active':''}`}
          onClick={() => navigate({page:'dashboard'})}>
          <Home size={15} style={{marginLeft:6}}/> האירועים שלי
        </button>
        <button className={`sidebar-link${currentPage==='event-create'?' active':''}`}
          onClick={() => navigate({page:'event-create'})}>
          <PlusCircle size={15} style={{marginLeft:6}}/> אירוע חדש
        </button>
        <button className={`sidebar-link${currentPage==='ai-assistant'?' active':''}`}
          onClick={() => navigate({page:'ai-assistant'})}>
          <Sparkles size={15} style={{marginLeft:6}}/> חברי הטוב AI
        </button>
        <button className={`sidebar-link${currentPage==='seating-plan'?' active':''}`}
          onClick={() => navigate({page:'seating-plan',eventId:'evt-demo'})}>
          <Armchair size={15} style={{marginLeft:6}}/> הושבת מוזמנים
        </button>
        <button className={`sidebar-link${currentPage==='venue-canvas'?' active':''}`}
          onClick={() => navigate({page:'venue-canvas',eventId:'evt-demo'})}>
          <Map size={15} style={{marginLeft:6}}/> תוכנית אולם
        </button>
        <button className={`sidebar-link${currentPage==='live-venue-mode'?' active':''}`}
          onClick={() => navigate({page:'live-venue-mode', eventId:'evt-demo'})}>
          🔴 Live Mode
        </button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.name[0]}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>יציאה</button>
      </div>
    </aside>
  );
}

// ── Venue sidebar ─────────────────────────────────────────────────────────────

const VENUE_NAV_MAIN = [
  { key: 'venue-dashboard', icon: LayoutGrid, label: 'כל החתונות' },
  { key: 'calendar',        icon: Calendar,   label: 'לוח שנה',          soon: true },
  { key: 'clients',         icon: Users,      label: 'לקוחות',           soon: true },
  { key: 'proposals',       icon: FileText,   label: 'הצעות ואופציות',   soon: true },
  { key: 'reports',         icon: BarChart2,  label: 'דוחות',            soon: true },
];

const VENUE_NAV_SETTINGS = [
  { key: 'venue-branding', icon: Settings, label: 'הגדרות' },
];

function VenueSidebar({ venue, currentPage, navigate, onLogout, isOpen, onToggle }) {
  const mobileClose = () => { if (window.innerWidth < 768) onToggle(); };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`venue-sidebar-backdrop${isOpen ? ' venue-sidebar-backdrop--visible' : ''}`}
        onClick={onToggle}
      />

      <aside className={`venue-sidebar${isOpen ? ' venue-sidebar--open' : ''}`}>
        <div className="venue-sidebar-inner">

          {/* ── Brand header ── */}
          <div className="venue-sidebar-brand">
            <div
              className="venue-sidebar-logo-mark"
              style={{ background: `linear-gradient(135deg, ${venue.primaryColor || '#7C3AED'}, ${venue.secondaryColor || '#4F46E5'})` }}
            >
              {venue.logo
                ? <img src={venue.logo} style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'contain' }} alt="" />
                : (venue.name?.[0] || 'V')}
            </div>
            <div className="venue-sidebar-names">
              <div className="venue-sidebar-product">choko · venues</div>
              <div className="venue-sidebar-venue-name">{venue.name}</div>
            </div>
            <button className="venue-sidebar-close" onClick={onToggle} title="סגור">
              <X size={15} />
            </button>
          </div>

          {/* ── Main navigation ── */}
          <nav className="venue-sidebar-nav">
            <div className="venue-nav-section">ניהול</div>
            {VENUE_NAV_MAIN.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`venue-nav-link${currentPage === item.key ? ' active' : ''}${item.soon ? ' venue-nav-link--soon' : ''}`}
                  onClick={() => { if (!item.soon) { navigate({ page: item.key }); mobileClose(); } }}
                >
                  <span className="venue-nav-icon"><Icon size={15} /></span>
                  <span className="venue-nav-label">{item.label}</span>
                  {item.soon && <span className="venue-nav-soon">בקרוב</span>}
                </button>
              );
            })}

            <div className="venue-nav-section venue-nav-section--gap">הגדרות</div>
            {VENUE_NAV_SETTINGS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`venue-nav-link${currentPage === item.key ? ' active' : ''}`}
                  onClick={() => { navigate({ page: item.key }); mobileClose(); }}
                >
                  <span className="venue-nav-icon"><Icon size={15} /></span>
                  <span className="venue-nav-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Live Venue Mode — special card ── */}
          <div className="venue-live-section">
            <button
              className={`venue-live-card${currentPage === 'live-venue-mode' ? ' venue-live-card--active' : ''}`}
              onClick={() => { navigate({ page: 'live-venue-mode' }); mobileClose(); }}
            >
              <span className="venue-live-pulse-dot" />
              <Activity size={16} />
              <span className="venue-live-label">Live Venue Mode</span>
              <ChevronLeft size={13} className="venue-live-arrow" />
            </button>
          </div>

          {/* ── User / logout ── */}
          <div className="venue-sidebar-bottom">
            <div className="venue-sidebar-user">
              <div className="venue-sidebar-avatar">{venue.name?.[0] || 'V'}</div>
              <div>
                <div className="venue-sidebar-user-name">{venue.name}</div>
                <div className="venue-sidebar-user-email">{venue.email}</div>
              </div>
            </div>
            <button className="venue-logout-btn" onClick={onLogout}>
              <LogOut size={12} style={{ marginLeft: 5, verticalAlign: 'middle' }} /> יציאה
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]        = useState(() => getSession());
  const [venueUser,   setVenueUser]   = useState(() => getVenueSession());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [route,       setRoute]       = useState(() => {
    const h = window.location.hash.slice(1);
    const m = h.match(/^\/rsvp\/([^/]+)(?:\/([^/]+))?$/);
    if (m) return { page:'rsvp', eventId:m[1], guestId:m[2] };
    if (getVenueSession()) return { page:'venue-dashboard' };
    return { page: getSession() ? 'dashboard' : 'landing' };
  });

  useEffect(() => {
    if (route.page === 'rsvp') {
      window.location.hash = `/rsvp/${route.eventId}${route.guestId?'/'+route.guestId:''}`;
    } else if (route.page === 'dashboard' || route.page === 'event-create') {
      window.location.hash = '/'+route.page;
    } else if (route.page === 'event-detail') {
      window.location.hash = '/events/'+route.eventId;
    } else if (route.page.startsWith('venue-')) {
      window.location.hash = '/'+route.page;
    }
  }, [route]);

  const navigate = r => setRoute(r);

  // Couple logout
  const handleLogout = () => { logout(); setUser(null); setRoute({page:'landing'}); };

  // Venue logout
  const handleVenueLogout = () => { venueLogout(); setVenueUser(null); setRoute({page:'landing'}); };

  // Couple login
  const handleLogin = u => {
    setUser(u);
    setRoute(route.then ? {page:route.then} : {page:'dashboard'});
  };

  // Venue login
  const handleVenueLogin = v => {
    setVenueUser(v);
    setRoute({page:'venue-dashboard'});
  };

  // Venue branding update (keeps sidebar in sync)
  const handleVenueUpdate = updated => setVenueUser(updated);

  // ── Public pages ────────────────────────────────────────────────────────────
  if (route.page === 'guest-calculator') {
    return <GuestCalculator navigate={navigate} onLogin={() => setRoute({page:'login'})}/>;
  }
  if (route.page === 'rsvp') {
    return <GuestRSVP eventId={route.eventId} guestId={route.guestId}
      onBack={() => setRoute({page: user?'dashboard':venueUser?'venue-dashboard':'landing'})}/>;
  }

  // ── Live Venue Mode (full-screen, no shell) ─────────────────────────────────
  if (route.page === 'live-venue-mode') {
    return <LiveVenueMode onBack={() => navigate({page: user ? 'dashboard' : 'venue-dashboard', eventId: route.eventId})} />;
  }

  // ── Venue login page ────────────────────────────────────────────────────────
  if (route.page === 'venue-login') {
    return <VenueLogin onSuccess={handleVenueLogin} onBack={() => setRoute({page:'landing'})}/>;
  }

  // ── Venue app shell ─────────────────────────────────────────────────────────
  if (venueUser) {
    return (
      <div className="venue-shell">
        <VenueSidebar
          venue={venueUser}
          currentPage={route.page}
          navigate={navigate}
          onLogout={handleVenueLogout}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(s => !s)}
        />
        <main className="venue-main">
          {/* Hamburger toggle — top of every venue page */}
          <div className="venue-topbar">
            <button
              className={`venue-hamburger-btn${sidebarOpen ? ' venue-hamburger-btn--open' : ''}`}
              onClick={() => setSidebarOpen(s => !s)}
              title={sidebarOpen ? 'סגור תפריט' : 'פתח תפריט'}
            >
              {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>

          {route.page === 'venue-dashboard' && (
            <VenueDashboard venue={venueUser} navigate={navigate}/>
          )}
          {route.page === 'venue-branding' && (
            <VenueBranding venue={venueUser} onVenueUpdate={handleVenueUpdate}/>
          )}
          {route.page === 'venue-wedding' && (
            <VenueWedding weddingId={route.weddingId} venue={venueUser} navigate={navigate}/>
          )}
          {route.page === 'event-detail' && (
            <EventDetail eventId={route.eventId} navigate={navigate}/>
          )}
          {route.page === 'seating-plan' && (
            <SeatingPlan eventId={route.eventId} navigate={navigate}/>
          )}
          {route.page === 'venue-canvas' && (
            <VenueCanvas eventId={route.eventId} navigate={navigate}/>
          )}
          {route.page === 'whatsapp-scheduler' && (
            <WhatsAppScheduler eventId={route.eventId} navigate={navigate}/>
          )}
        </main>
      </div>
    );
  }

  // ── Couple: not logged in ───────────────────────────────────────────────────
  if (!user) {
    if (route.page === 'login') {
      return <Login onSuccess={handleLogin} onBack={() => setRoute({page:'landing'})}/>;
    }
    return <Landing
      onLogin={() => setRoute({page:'login'})}
      onAI={() => setRoute({page:'login', then:'ai-assistant'})}
      onVenue={() => setRoute({page:'venue-login'})}
      navigate={navigate}
    />;
  }

  // ── Couple: logged-in app shell ─────────────────────────────────────────────
  return (
    <div className="app-shell">
      <div className="aurora-fixed" aria-hidden="true">
        <div className="aurora-layer"/>
        <div className="aurora-layer-2"/>
      </div>
      <AppSidebar user={user} currentPage={route.page} navigate={navigate} onLogout={handleLogout}/>
      <main className="app-main">
        {route.page === 'dashboard'          && <Dashboard user={user} navigate={navigate}/>}
        {route.page === 'event-create'       && <EventCreate user={user} navigate={navigate}/>}
        {route.page === 'event-detail'       && <EventDetail eventId={route.eventId} navigate={navigate}/>}
        {route.page === 'ai-assistant'       && <AIAssistant navigate={navigate}/>}
        {route.page === 'invite-design'      && <InviteDesign eventId={route.eventId} navigate={navigate}/>}
        {route.page === 'whatsapp-scheduler' && <WhatsAppScheduler eventId={route.eventId} navigate={navigate}/>}
        {route.page === 'seating-plan'       && <SeatingPlan eventId={route.eventId} navigate={navigate}/>}
        {route.page === 'venue-canvas'       && <VenueCanvas eventId={route.eventId} navigate={navigate}/>}
      </main>
    </div>
  );
}
