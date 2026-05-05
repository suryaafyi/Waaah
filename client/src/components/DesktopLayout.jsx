import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HouseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 -2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82 l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

export default function DesktopLayout({ children, activeTab, babyName, cfgColor }) {
  const navigate = useNavigate();
  
  return (
    <div className="dt-bento-grid" style={{ zIndex: 10 }}>
      {/* SIDE NAV */}
      <div className="dt-side-nav">
        <div style={{ marginBottom: 20, color: cfgColor }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        <NavItem active={activeTab === 'home'} label="HOME" icon={<HouseIcon />} color={cfgColor} onClick={() => navigate('/home')} />
        <NavItem active={activeTab === 'history'} label="HISTORY" icon={<ClockIcon />} color={cfgColor} onClick={() => navigate('/history')} />
        <NavItem active={activeTab === 'settings'} label="SETTINGS" icon={<GearIcon />} color={cfgColor} onClick={() => navigate('/settings')} />
      </div>

      {/* TOP BAR */}
      <div className="dt-home-topbar" style={{ height: 72, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(24px) saturate(200%)', borderBottom: '1px solid rgba(255,255,255,0.7)', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div 
          className="dt-logo" 
          style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 28, color: cfgColor, letterSpacing: '3px', cursor: 'pointer', position: 'relative', textTransform: 'uppercase' }}
          onClick={() => navigate('/home')}
        >
          Waaah
        </div>

        <div style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.85)', borderRadius: 40, padding: '5px 16px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <div className="live-indicator-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 13, color: 'rgba(0,0,0,0.5)' }}>
            {babyName.toUpperCase()}'S MONITOR
          </span>
        </div>

        <div className="dt-top-history" onClick={() => navigate('/history')} style={{ cursor: 'pointer', color: 'rgba(0,0,0,0.35)', transition: 'all 0.2s ease' }}>
          <ClockIcon />
        </div>
      </div>

      {children}


      <style>{`
        .live-indicator-dot {
          animation: livePulse 2s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%     { box-shadow: 0 0 0 6px rgba(34,197,94,0); }
        }
        .dt-logo:hover::after {
          width: 100%;
        }
        .dt-logo::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: ${cfgColor};
          transition: width 0.3s ease;
        }
        .dt-top-history:hover {
          color: rgba(0,0,0,0.7);
          transform: rotate(15deg);
        }
      `}</style>
    </div>
  );
}

function NavItem({ active, label, icon, color, onClick }) {
  return (
    <motion.div 
      className="dt-nav-item"
      onClick={onClick}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', color: active ? color : 'rgba(0,0,0,0.3)', transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      whileHover={{ y: -4 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 10, letterSpacing: '3px', textTransform: 'uppercase' }}>
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="nav-dot"
          className="active-dot" 
          style={{ width: 4, height: 4, borderRadius: 2, background: color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      )}
    </motion.div>
  );
}
