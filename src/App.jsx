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

initStore();

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const handler = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);
  return hash;
}

function navigate(path) {
  window.location.hash = path;
}

function parseRoute(hash) {
  const parts = hash.split('/').filter(Boolean);
  if (!parts.length)           return { page: 'landing' };
  if (parts[0] === 'login')    return { page: 'login' };
  if (parts[0] === 'dashboard')return { page: 'dashboard' };
  if (parts[0] === 'events' && parts[1] === 'new') return { page: 'event-create' };
  if (parts[0] === 'events' && parts[1]) return { page: 'event-detail', eventId: parts[1] };
  if (parts[0] === 'rsvp' && parts[1])   return { page: 'rsvp', eventId: parts[1], guestId: parts[2] };
  return { page: 'landing' };
}

function AppSidebar({ user, currentPage }) {
  const handleLogout = () => { logout(); navigate('/'); };
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        choko<span className="logo-dot"></span>
      </div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          🏠 האירועים שלי
        </button>
        <button
          className={`sidebar-link ${currentPage === 'event-create' ? 'active' : ''}`}
          onClick={() => navigate('/events/new')}
        >
          ➕ אירוע חדש
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
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 התנתקות
        </button>
      </div>
    </aside>
  );
}

export default function App() {
  const hash = useHash();
  const [user, setUser] = useState(() => getSession());
  const route = parseRoute(hash);
  const currentUser = user || getSession();

  // RSVP page is always public — no auth needed
  if (route.page === 'rsvp') {
    return <GuestRSVP eventId={route.eventId} guestId={route.guestId} />;
  }

  // Landing page
  if (route.page === 'landing') {
    if (user) { navigate('/dashboard'); return null; }
    return <Landing onLogin={() => navigate('/login')} />;
  }

  // Login page
  if (route.page === 'login') {
    if (currentUser) { navigate('/dashboard'); return null; }
    return <Login onSuccess={(u) => { setUser(u); navigate('/dashboard'); }} />;
  }

  // Auth guard
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // App shell with sidebar
  return (
    <div className="app-shell">
      <AppSidebar user={currentUser} currentPage={route.page} />
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
      </main>
    </div>
  );
}
