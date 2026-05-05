import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import BottomNav from '../components/BottomNav';
import DesktopLayout from '../components/DesktopLayout';
import LoadingScreen from '../components/LoadingScreen';
import './History.css';

const CONFIG = {
  hunger:  { color: '#FF6B6B', blob: 'Hunger.png' },
  tired:   { color: '#FFB347', blob: 'Tired.png' },
  gas:     { color: '#4ECDC4', blob: 'Gas.png' },
  pain:    { color: '#C77DFF', blob: 'Pain.png' },
  comfort: { color: '#FF9EBC', blob: 'Comfort.png' },
};

const getCfg = (reason) => CONFIG[reason] || CONFIG['comfort'];

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ImageWithFallback = ({ src, reason, className }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return (
      <div className={`${className} fallback-circle`} style={{ backgroundColor: CONFIG[reason]?.color || '#ccc', borderRadius: '50%' }} />
    );
  }

  return (
    <img 
      src={src} 
      className={className} 
      alt="" 
      onError={() => setError(true)}
    />
  );
};

function DesktopHistory({ baby, babyName, babyAge, bg, data, error, fetchData, expandedId, toggleExpand, navigate, pattern, accuracy, totalSessions }) {
  const insight = data?.insight;
  const sessions = data?.sessions || [];
  const recentReason = sessions[0]?.reason || insight?.topReason || 'comfort';
  const themeCfg = getCfg(recentReason);
  const cfgColor = themeCfg.color;

  const blobMap = {
    hunger:  '/Hunger.png',
    tired:   '/Tired.png',
    gas:     '/Gas.png',
    pain:    '/Pain.png',
    comfort: '/Comfort.png',
  };

  return (
    <DesktopLayout activeTab="history" babyName={babyName} cfgColor={cfgColor}>
      {/* LEFT PANEL: INSIGHTS */}
      <div className="dt-panel dt-panel-left">
        {pattern ? (
          <div className="pattern-card pattern-card--active">
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">{pattern}</p>
            {accuracy !== null && (
              <p className="pattern-card__accuracy">
                {accuracy}% accurate based on your feedback
              </p>
            )}
          </div>
        ) : totalSessions >= 5 ? (
          <div className="pattern-card pattern-card--pending">
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">
              No strong pattern yet — keep recording to reveal {babyName}'s signals.
            </p>
          </div>
        ) : (
          <div className="pattern-card pattern-card--locked">
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">
              Recording {5 - totalSessions} more {5 - totalSessions === 1 ? 'cry' : 'cries'} unlocks deep insights.
            </p>
          </div>
        )}

        <div className="dt-card dt-baby-card" style={{ background: 'rgba(255,255,255,0.6)', margin: 0 }}>
          <div className="dt-baby-avatar" style={{ background: cfgColor }}>
            {babyName.charAt(0).toUpperCase()}
          </div>
          <div className="dt-baby-info">
            <div className="dt-baby-name" style={{ color: 'rgba(0,0,0,0.8)' }}>{babyName}</div>
            <div className="dt-baby-meta">{babyAge} &middot; {baby?.gender}</div>
          </div>
        </div>
      </div>

      {/* CENTER PANEL: SESSIONS LIST */}
      <div className="dt-panel dt-panel-center">
        <div className="dt-greeting" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: 0, textTransform: 'uppercase' }}>{babyName.toUpperCase()}'S HISTORY</div>
        <h1 className="dt-headline" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, fontSize: 64, letterSpacing: '-2px' }}>EVERY WAAAH TELLS A STORY</h1>
        
        <div className="dt-sessions-scroll" style={{ width: '100%', height: '100%', overflowY: 'auto', padding: '0 0 40px' }}>
          <div className="sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
            {sessions.map((session, i) => {
              const sCfg = getCfg(session.reason);
              const isExpanded = expandedId === session.sessionId;

              return (
                <div
                  key={session.sessionId}
                  className="dt-card dt-history-item"
                  style={{ 
                    width: '100%',
                    maxWidth: 'none', 
                    background: 'rgba(255,255,255,0.6)', 
                    cursor: 'pointer',
                    margin: 0,
                    padding: '20px 24px'
                  }}
                  onClick={() => toggleExpand(session.sessionId)}
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <img
                      src={blobMap[session.reason] ?? '/Comfort.png'}
                      alt={session.reason}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: 'contain',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 0, gap: 12 }}>
                        <span style={{ fontSize: 18, color: sCfg.color, fontWeight: 700, fontFamily: 'var(--font-body)', letterSpacing: 0, whiteSpace: 'nowrap' }}>{session.headline}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-dark)', opacity: 0.45, fontFamily: 'var(--font-body)', fontWeight: 300, flexShrink: 0 }}>{formatTimeAgo(session.createdAt)}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 300, color: 'var(--text-dark)', opacity: 0.55, fontFamily: 'var(--font-body)', lineHeight: 1.4, marginTop: 6 }}>{session.action}</div>
                      
                      <div className="dt-conf-track" style={{ width: '100%', height: 3, background: sCfg.color + '26', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
                        <motion.div 
                          className="dt-conf-fill" 
                          style={{ background: sCfg.color, height: '100%', borderRadius: 2 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${session.confidence}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        />
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)', fontSize: 14, color: 'rgba(0,0,0,0.5)', fontWeight: 400, lineHeight: 1.6 }}>
                        {session.explanation}
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: EXTRAS */}
      <div className="dt-panel dt-panel-right">
        <div className="dt-card" style={{ background: 'rgba(255,255,255,0.6)', margin: 0, width: '100%' }}>
          <div className="dt-card-label">QUICK SUMMARY</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.5)' }}>
              <span>Total Cries</span>
              <span style={{ fontWeight: 700, color: 'rgba(0,0,0,0.8)' }}>{sessions.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 400, color: 'rgba(0,0,0,0.5)' }}>
              <span>Most Frequent</span>
              <span style={{ fontWeight: 700, color: getCfg(insight?.topReason).color }}>{insight?.topReason || 'Comfort'}</span>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}

function MobileHistory({ babyName, babyAge, bg, data, error, fetchData, expandedId, toggleExpand, navigate, pattern, accuracy, totalSessions }) {
  const insight = data?.insight;
  const sessions = data?.sessions || [];
  const recentReason = sessions[0]?.reason || insight?.topReason || 'comfort';
  const themeCfg = getCfg(recentReason);

  return (
    <div className="screen-outer" style={{ backgroundColor: bg }}>
      <div className="screen-inner">
      <div className="history-inner">
        <div className="history-header">
          <h1>{babyName}'s patterns</h1>
          {babyAge !== 'unknown' && <div className="baby-age-pill">{babyAge}</div>}
        </div>

        {error && (
          <div className="history-error" onClick={fetchData}>
            Couldn't load history — tap to retry
          </div>
        )}

        {pattern ? (
          <motion.div 
            className="pattern-card pattern-card--active"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">{pattern}</p>
            {accuracy !== null && (
              <p className="pattern-card__accuracy">
                {accuracy}% accurate based on your feedback
              </p>
            )}
          </motion.div>
        ) : totalSessions >= 5 ? (
          <div className="pattern-card pattern-card--pending">
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">
              No strong pattern yet — keep recording to reveal {babyName}'s signals.
            </p>
          </div>
        ) : (
          <div className="pattern-card pattern-card--locked">
            <p className="pattern-card__label">PATTERN DETECTED</p>
            <p className="pattern-card__text">
              Recording {5 - totalSessions} more {5 - totalSessions === 1 ? 'cry' : 'cries'} unlocks deep insights.
            </p>
          </div>
        )}

        {sessions.length > 0 && (
          <div className="recent-cries-label">RECENT CRIES</div>
        )}

        <div className="sessions-list">
          {sessions.map((session, i) => {
            const sCfg = getCfg(session.reason);
            const isExpanded = expandedId === session.sessionId;

            return (
              <motion.div
                key={session.sessionId}
                className="session-card"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => toggleExpand(session.sessionId)}
              >
                <div className="session-card-top">
                  <ImageWithFallback src={`/${sCfg.blob}`} reason={session.reason} className="session-blob" />
                  <div className="session-info">
                    <div className="session-row">
                      <h3 className="session-headline" style={{ color: sCfg.color }}>{session.headline}</h3>
                      <div className="session-time">{formatTimeAgo(session.createdAt)}</div>
                    </div>
                    <div className="session-row" style={{ marginTop: 2, alignItems: 'center' }}>
                      <p className="session-action" style={{ fontFamily: 'var(--font-body)', fontWeight: 400 }}>{session.action}</p>
                      {session.helped === true && <div className="session-helped-badge badge-yes" style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Helped</div>}
                      {session.helped === false && <div className="session-helped-badge badge-no" style={{ fontFamily: 'var(--font-body)', fontWeight: 700 }}>Didn't</div>}
                    </div>
                  </div>
                </div>
                <div className="conf-track">
                  <motion.div className="conf-fill" style={{ backgroundColor: sCfg.color }} initial={{ width: 0 }} animate={{ width: `${session.confidence}%` }} transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + (i * 0.06) }} />
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div className="session-expanded" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                      <p className="session-explanation" style={{ fontFamily: 'var(--font-body)', fontWeight: 300 }}>{session.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
      <BottomNav activeTab="history" />
      </div>
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const baby     = storage.getBaby();
  const babyName = baby?.name || 'Baby';
  const babyAge  = baby?.age || 'unknown';
  const bg       = { girl: '#FFE4EE', boy: '#DFF0FF', neutral: '#FFF3E0' }[baby?.gender] || '#FFF3E0';

  const [data, setData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pattern, setPattern] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [totalSessions, setTotalSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    if (!baby?.babyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    const timer = setTimeout(() => setShowLoading(true), 200);
    try {
      const res = await api.getHistory(baby.babyId);
      const rawSessions = res.sessions || [];
      const mapped = rawSessions.map((s, i) => ({
        ...s,
        createdAt: s.createdAt || s.created_at,
        sessionId: s.id || s.sessionId || s.session_id || `s-${i}`,
        reason: s.reason?.toLowerCase() || 'comfort'
      }));
      
      setSessions(mapped);
      setPattern(res.pattern);
      setAccuracy(res.accuracy);
      setTotalSessions(res.totalSessions || 0);
      setData(res);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setShowLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const recentReason = data?.sessions?.[0]?.reason || data?.insight?.topReason || 'comfort';
  const themeCfg = getCfg(recentReason);

  useEffect(() => {
    document.body.style.setProperty('--cfg-color', themeCfg.color);
    document.body.style.setProperty('--cfg-color-fade', themeCfg.color + '28');
    document.body.style.setProperty('--cfg-color-faint', themeCfg.color + '18');
  }, [themeCfg.color]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading && showLoading) {
    if (isDesktop) {
      return (
        <DesktopLayout activeTab="history" babyName={babyName} cfgColor="#FF6B6B">
          <LoadingScreen message="Reading the patterns..." />
        </DesktopLayout>
      );
    }
    return (
      <div className="history-screen" style={{ backgroundColor: bg }}>
        <AnimatePresence>
          <LoadingScreen message="Reading the patterns..." />
        </AnimatePresence>
        <BottomNav activeTab="history" />
      </div>
    );
  }

  if (!loading && (!data?.sessions || data.sessions.length === 0)) {
    const emptyContent = (
      <div className="history-empty">
        <motion.img src="/Hunger.png" alt="" className="empty-blob" animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
        <h2 className="empty-title">No cries logged yet</h2>
        <p className="empty-subtitle">Record your first cry to start building a picture</p>
        <button className="record-now-btn" style={{ backgroundColor: '#FF6B6B' }} onClick={() => navigate('/home')}>Record Now</button>
      </div>
    );

    if (isDesktop) {
      return (
        <DesktopLayout activeTab="history" babyName={babyName} cfgColor="#FF6B6B">
          <div className="dt-panel dt-panel-center">{emptyContent}</div>
        </DesktopLayout>
      );
    }

    return (
      <div className="history-screen" style={{ backgroundColor: bg }}>
        <div className="history-inner">{emptyContent}</div>
        <BottomNav activeTab="history" />
      </div>
    );
  }

  if (isDesktop) {
    return (
      <DesktopHistory 
        baby={baby} babyName={babyName} babyAge={babyAge} bg={bg} 
        data={data} error={error} fetchData={fetchData} 
        expandedId={expandedId} toggleExpand={toggleExpand} navigate={navigate} 
        pattern={pattern} accuracy={accuracy} totalSessions={totalSessions}
      />
    );
  }

  return (
    <MobileHistory 
      babyName={babyName} babyAge={babyAge} bg={bg} 
      data={data} error={error} fetchData={fetchData} 
      expandedId={expandedId} toggleExpand={toggleExpand} navigate={navigate} 
      pattern={pattern} accuracy={accuracy} totalSessions={totalSessions}
    />
  );
}
