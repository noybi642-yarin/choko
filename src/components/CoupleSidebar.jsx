import '../couple.css';
import {
  Home, Users, MailCheck, Armchair, Map,
  CheckSquare, Milestone, MessageCircle, Sparkles, LogOut,
} from 'lucide-react';

const NAV = [
  {
    section: 'החתונה שלנו',
    items: [
      { key: 'dashboard', label: 'הדשבורד שלי', Icon: Home, route: { page: 'dashboard' } },
    ],
  },
  {
    section: 'ניהול',
    items: [
      { key: 'guests', label: 'מוזמנים', Icon: Users, soon: true },
      { key: 'rsvp-manage', label: 'RSVP', Icon: MailCheck, soon: true },
      { key: 'seating-plan', label: 'סידורי הושבה', Icon: Armchair, route: { page: 'seating-plan', eventId: 'evt-demo' } },
      { key: 'venue-canvas', label: 'עיצוב אולם', Icon: Map, route: { page: 'venue-canvas', eventId: 'evt-demo' } },
    ],
  },
  {
    section: 'תכנון',
    items: [
      { key: 'tasks', label: 'משימות', Icon: CheckSquare, soon: true },
      { key: 'timeline', label: 'ציר זמן', Icon: Milestone, soon: true },
    ],
  },
  {
    section: 'תקשורת',
    items: [
      { key: 'messages', label: 'הודעות מהאולם', Icon: MessageCircle, soon: true, badge: '2' },
    ],
  },
];

export default function CoupleSidebar({ user, currentPage, navigate, onLogout }) {
  const coupleNames = user?.coupleName || user?.name || '';

  const go = (item) => {
    if (item.soon) return;
    navigate(item.route || { page: item.key });
  };

  return (
    <>
      <div className="cs-spacer" aria-hidden="true" />

      <aside className="cs-rail">
        <div className="cs-inner">

          {/* Brand */}
          <div className="cs-brand">
            <div className="cs-brand-mark">
              <div className="cs-brand-mark-inner">c</div>
            </div>
            <div className="cs-label">
              <div className="cs-brand-word">choko<span className="cs-dot">.</span></div>
              {coupleNames && <div className="cs-brand-couple">{coupleNames}</div>}
            </div>
          </div>

          {/* Nav */}
          <nav className="cs-nav">
            {NAV.map(group => (
              <div key={group.section}>
                <div className="cs-section">
                  <span className="cs-section-label cs-label">{group.section}</span>
                </div>
                {group.items.map(item => (
                  <button
                    key={item.key}
                    className={`cs-link${currentPage === item.key ? ' active' : ''}${item.soon ? ' soon' : ''}`}
                    onClick={() => go(item)}
                    title={item.label}
                  >
                    <span className="cs-ico">
                      <item.Icon size={16} />
                      {item.badge && <span className="cs-badge">{item.badge}</span>}
                    </span>
                    <span className="cs-label">{item.label}</span>
                    {item.soon && <span className="cs-soon-pill">בקרוב</span>}
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* AI companion card */}
          <div className="cs-ai-wrap">
            <button className="cs-ai" onClick={() => navigate({ page: 'ai-assistant' })}>
              <span className="cs-ico"><Sparkles size={17} /></span>
              <span className="cs-label cs-ai-text">
                <span className="cs-ai-title">חברי הטוב AI</span>
                <span className="cs-ai-sub" style={{ display: 'block' }}>העוזר האישי לחתונה</span>
              </span>
            </button>
          </div>

          {/* User + logout */}
          <div className="cs-bottom">
            <div className="cs-user">
              <div className="cs-avatar-cell">
                <div className="cs-avatar">{user?.name?.[0] || '♥'}</div>
              </div>
              <div className="cs-label">
                <div className="cs-user-name">{user?.name}</div>
                <div className="cs-user-email">{user?.email}</div>
              </div>
            </div>
            <button className="cs-logout" onClick={onLogout}>
              <span className="cs-ico"><LogOut size={14} /></span>
              <span className="cs-label">יציאה</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="cs-mobilebar">
        <button
          className={`cs-mtab${currentPage === 'dashboard' ? ' active' : ''}`}
          onClick={() => navigate({ page: 'dashboard' })}
        >
          <Home size={18} /><span>דשבורד</span>
        </button>
        <button
          className={`cs-mtab${currentPage === 'seating-plan' ? ' active' : ''}`}
          onClick={() => navigate({ page: 'seating-plan', eventId: 'evt-demo' })}
        >
          <Armchair size={18} /><span>הושבה</span>
        </button>
        <button
          className={`cs-mtab cs-mtab-ai${currentPage === 'ai-assistant' ? ' active' : ''}`}
          onClick={() => navigate({ page: 'ai-assistant' })}
        >
          <Sparkles size={18} /><span>AI</span>
        </button>
        <button
          className={`cs-mtab${currentPage === 'venue-canvas' ? ' active' : ''}`}
          onClick={() => navigate({ page: 'venue-canvas', eventId: 'evt-demo' })}
        >
          <Map size={18} /><span>אולם</span>
        </button>
        <button className="cs-mtab" onClick={onLogout}>
          <LogOut size={18} /><span>יציאה</span>
        </button>
      </nav>
    </>
  );
}
