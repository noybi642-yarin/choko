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
function VenueSidebar({ venue, currentPage, navigate, onLogout, onVenueUpdate }) {
  return (
    <aside className="venue-sidebar">
      <div className="venue-sidebar-brand">
        <div className="venue-sidebar-logo-mark" style={{ background: venue.primaryColor }}>
          {venue.logo
            ? <img src={venue.logo} style={{width:26,height:26,borderRadius:6,objectFit:'contain'}} alt=""/>
            : (venue.name?.[0] || 'V')}
        </div>
        <div className="venue-sidebar-names">
          <div className="venue-sidebar-product">choko · venues</div>
          <div className="venue-sidebar-venue-name">{venue.name}</div>
        </div>
      </div>

      <nav className="venue-sidebar-nav">
        <div className="venue-nav-section">ניהול</div>
        <button
          className={`venue-nav-link${currentPage==='venue-dashboard'?' active':''}`}
          onClick={() => navigate({page:'venue-dashboard'})}
        >
          <span className="venue-nav-icon"><LayoutGrid size={15}/></span>
          כל החתונות
        </button>

        <button
          className={`venue-nav-link${currentPage==='live-venue-mode'?' active':''}`}
          onClick={() => navigate({page:'live-venue-mode'})}
        >
          <span className="venue-nav-icon">🔴</span>
          Live Venue Mode
        </button>

        <div className="venue-nav-section">הגדרות</div>
        <button
          className={`venue-nav-link${currentPage==='venue-branding'?' active':''}`}
          onClick={() => navigate({page:'venue-branding'})}
        >
          <span className="venue-nav-icon"><Settings size={15}/></span>
          מיתוג האולם
        </button>
      </nav>

      <div className="venue-sidebar-bottom">
        <div className="venue-sidebar-user">
          <div className="venue-sidebar-avatar">
            {venue.name?.[0] || 'V'}
          </div>
          <div>
            <div className="venue-sidebar-user-name">{venue.name}</div>
            <div className="venue-sidebar-user-email">{venue.email}</div>
          </div>
        </div>
        <button className="venue-logout-btn" onClick={onLogout}>
          <LogOut size={12} style={{marginLeft:5, verticalAlign:'middle'}}/> יציאה
        </button>
      </div>
    </aside>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user,      setUser]      = useState(() => getSession());
  const [venueUser, setVenueUser] = useState(() => getVenueSession());
  const [route,     setRoute]     = useState(() => {
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
          onVenueUpdate={handleVenueUpdate}
        />
        <main className="venue-main">
          {route.page === 'venue-dashboard' && (
            <VenueDashboard venue={venueUser} navigate={navigate}/>
          )}
          {route.page === 'venue-branding' && (
            <VenueBranding venue={venueUser} onVenueUpdate={handleVenueUpdate}/>
          )}
          {route.page === 'venue-wedding' && (
            <VenueWedding weddingId={route.weddingId} venue={venueUser} navigate={navigate}/>
          )}
          {/* Venue admins can access the existing tools for a specific wedding */}
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
