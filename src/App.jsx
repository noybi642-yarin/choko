import { useState, useEffect } from 'react';
import './index.css';
import './app.css';
import { initStore, getSession, logout } from './store';
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

initStore();

// ── Tiny state-based router (no hashchange dependency) ────────────────────────
// route: { page, eventId?, guestId? }

function AppSidebar({ user, currentPage, navigate, onLogout }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        choko<span className="logo-dot"></span>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate({ page: 'dashboard' })}
        >🏠 האירועים שלי</button>
        <button
          className={`sidebar-link ${currentPage === 'event-create' ? 'active' : ''}`}
          onClick={() => navigate({ page: 'event-create' })}
        >➕ אירוע חדש</button>
        <button
          className={`sidebar-link ${currentPage === 'ai-assistant' ? 'active' : ''}`}
          onClick={() => navigate({ page: 'ai-assistant' })}
        >✨ חברי הטוב AI</button>
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{user.name[0]}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user.name}</div>
            <div className="sidebar-user-email">{user.email}</div>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout}>🚪 התנתקות</button>
      </div>
    </aside>
  );
}

export default function App() {
  const [user, setUser]   = useState(() => getSession());
  const [route, setRoute] = useState(() => {
    // Support direct RSVP links via URL hash on first load
    const h = window.location.hash.slice(1);
    const m = h.match(/^\/rsvp\/([^/]+)(?:\/([^/]+))?$/);
    if (m) return { page: 'rsvp', eventId: m[1], guestId: m[2] };
    return { page: user ? 'dashboard' : 'landing' };
  });

  // Keep URL hash in sync so RSVP links remain shareable
  useEffect(() => {
    if (route.page === 'rsvp') {
      window.location.hash = `/rsvp/${route.eventId}${route.guestId ? '/' + route.guestId : ''}`;
    } else if (route.page === 'dashboard' || route.page === 'event-create') {
      window.location.hash = '/' + route.page;
    } else if (route.page === 'event-detail') {
      window.location.hash = '/events/' + route.eventId;
    }
  }, [route]);

  const navigate = (r) => setRoute(r);

  const handleLogout = () => {
    logout();
    setUser(null);
    setRoute({ page: 'landing' });
  };

  const handleLogin = (u) => {
    setUser(u);
    setRoute(route.then ? { page: route.then } : { page: 'dashboard' });
  };

  // ── Public calculator (no auth required) ───────────────────────────────────
  if (route.page === 'guest-calculator') {
    return <GuestCalculator
      navigate={navigate}
      onLogin={() => setRoute({ page: 'login' })}
    />;
  }

  // ── Public RSVP page (no auth) ──────────────────────────────────────────────
  if (route.page === 'rsvp') {
    return <GuestRSVP
      eventId={route.eventId}
      guestId={route.guestId}
      onBack={() => setRoute({ page: user ? 'dashboard' : 'landing' })}
    />;
  }

  // ── Not logged in ───────────────────────────────────────────────────────────
  if (!user) {
    if (route.page === 'login') {
      return <Login onSuccess={handleLogin} onBack={() => setRoute({ page: 'landing' })} />;
    }
    return <Landing onLogin={() => setRoute({ page: 'login' })} onAI={() => setRoute({ page: 'login', then: 'ai-assistant' })} navigate={navigate} />;
  }

  // ── Logged-in app shell ─────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <AppSidebar user={user} currentPage={route.page} navigate={navigate} onLogout={handleLogout} />
      <main className="app-main">
        {route.page === 'dashboard' && (
          <Dashboard user={user} navigate={navigate} />
        )}
        {route.page === 'event-create' && (
          <EventCreate user={user} navigate={navigate} />
        )}
        {route.page === 'event-detail' && (
          <EventDetail eventId={route.eventId} navigate={navigate} />
        )}
        {route.page === 'ai-assistant' && (
          <AIAssistant navigate={navigate} />
        )}
        {route.page === 'invite-design' && (
          <InviteDesign eventId={route.eventId} navigate={navigate} />
        )}
        {route.page === 'whatsapp-scheduler' && (
          <WhatsAppScheduler eventId={route.eventId} navigate={navigate} />
        )}
      </main>
    </div>
  );
}
