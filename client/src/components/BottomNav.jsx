import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = ({ activeTab, activeColor = 'var(--color-hunger)' }) => {
  const navigate = useNavigate();

  const handleNav = (tab) => {
    if (activeTab === tab) return;
    navigate(`/${tab}`);
  };

  const getClassName = (tab) => 
    `nav-tab ${activeTab === tab ? 'nav-tab--active' : 'nav-tab--inactive'}`;

  return (
    <div className="bottom-nav">
      {/* HOME TAB */}
      <button 
        className={getClassName('home')} 
        onClick={() => handleNav('home')}
        style={activeTab === 'home' ? { '--color-hunger': activeColor } : {}}
      >
        <div className="nav-tab__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill={activeTab === 'home' ? 'currentColor' : 'none'}>
            {activeTab === 'home' ? (
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            ) : (
              <>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </div>
        <span className="nav-tab__label">Home</span>
      </button>

      {/* HISTORY TAB */}
      <button 
        className={getClassName('history')} 
        onClick={() => handleNav('history')}
        style={activeTab === 'history' ? { '--color-hunger': activeColor } : {}}
      >
        <div className="nav-tab__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <span className="nav-tab__label">History</span>
      </button>

      {/* SETTINGS TAB */}
      <button 
        className={getClassName('settings')} 
        onClick={() => handleNav('settings')}
        style={activeTab === 'settings' ? { '--color-hunger': activeColor } : {}}
      >
        <div className="nav-tab__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <span className="nav-tab__label">Settings</span>
      </button>
    </div>
  );
};

export default BottomNav;
