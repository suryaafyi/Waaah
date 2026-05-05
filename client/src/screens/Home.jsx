import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { storage } from '../lib/storage'
import { api } from '../lib/api'
import RecordButton from '../components/RecordButton'
import BottomNav from '../components/BottomNav'
import DesktopLayout from '../components/DesktopLayout'
import './Home.css'

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return ''
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return '';
  const now = new Date()
  const diffMs = now - d
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

const colorMap = {
  hunger: '#FF6B6B',
  tired: '#FFB347',
  gas: '#4ECDC4',
  pain: '#C77DFF',
  comfort: '#FF9EBC',
}

const tips = [
  "Hold the phone close to your baby for best results",
  "5 to 8 seconds of clear crying works best",
  "Works even with background noise nearby",
  "No microphone? Use symptoms mode instead",
  "The more you use it, the smarter it gets"
]

const PremiumBackground = ({ cfgColor }) => (
  <div className="premium-bg">
    <div className="bg-orb orb-a" style={{ '--cfg-color-fade': `${cfgColor}28` }} />
    <div className="bg-orb orb-b" style={{ '--cfg-color-faint': `${cfgColor}18` }} />
    <div className="bg-orb orb-c" />
  </div>
);

const Headline = ({ name }) => {
  const words = `READY TO LISTEN TO ${name.toUpperCase()}'S NEEDS?`.split(' ');
  return (
    <h1 className="dt-headline">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="word-span"
          initial={{ opacity: 0, y: 40, rotate: 2 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{
            duration: 0.7,
            delay: 0.1 + i * 0.06,
            ease: [0.16, 1, 0.3, 1]
          }}
          style={{
            color: word.includes(name.toUpperCase()) ? 'var(--cfg-color)' : '#1a1a1a',
            fontFamily: 'var(--font-display)',
            textTransform: 'uppercase',
            fontWeight: 400,
            fontSize: 64,
            letterSpacing: '-1px'
          }}
        >
          {word}{' '}
        </motion.span>
      ))}
    </h1>
  );
};

function DesktopHome({ baby, babyName, cfgColor, navigate, recordingState, setRecordingState, setShowPermissionSheet }) {
  const [tipIndex, setTipIndex] = useState(0)
  const [recentCries, setRecentCries] = useState([])
  const lastReason = recentCries[0]?.reason || 'comfort'

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((i) => (i + 1) % tips.length)
    }, 6000)

    if (baby?.babyId) {
      api.getHistory(baby.babyId)
        .then(data => {
          const rawSessions = Array.isArray(data) ? data : (data.sessions || []);
          const mapped = rawSessions.map((s, i) => ({
            ...s,
            createdAt: s.createdAt || s.created_at,
            sessionId: s.id || s.sessionId || s.session_id || `s-${i}`,
            reason: s.reason?.toLowerCase() || 'comfort'
          }));
          setRecentCries(mapped.slice(0, 5));
        })
        .catch(console.error)
    }
    return () => clearInterval(tipInterval)
  }, [baby?.babyId])

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <PremiumBackground cfgColor={cfgColor} />

      <DesktopLayout activeTab="home" babyName={babyName} cfgColor={cfgColor}>
        {/* LEFT PANEL */}
        <motion.div className="dt-panel dt-panel-left entrance-left" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', zIndex: 2 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <motion.div
                className="dot-pulse"
                style={{ width: 6, height: 6, borderRadius: '50%', background: cfgColor }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 10, letterSpacing: '3px', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase' }}>LAST CRY</span>
            </div>
            {recentCries && recentCries.length > 0 ? (
              <>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 40, color: cfgColor, lineHeight: 1, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
                  {(recentCries[0]?.reason || 'comfort').toUpperCase()}!
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'rgba(0,0,0,0.45)' }}>{formatTimeAgo(recentCries[0]?.createdAt)}</span>
                </div>
                {recentCries[0]?.feedback && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
                    {recentCries[0].feedback === 'yes' ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg><span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: '#16a34a' }}>Resolved</span></>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg><span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, color: '#dc2626' }}>Didn't help</span></>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, color: 'rgba(0,0,0,0.1)', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>NO SESSIONS</div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '22px 24px', background: `linear-gradient(135deg, ${cfgColor}ee 0%, ${cfgColor}bb 100%)`, border: 'none', boxShadow: `0 8px 32px ${cfgColor}44, inset 0 1px 0 rgba(255,255,255,0.25)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" style={{ opacity: 0.7 }}><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" /><line x1="9" y1="18" x2="15" y2="18" /><line x1="10" y1="22" x2="14" y2="22" /></svg>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 10, letterSpacing: '3px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase' }}>TIP</span>
            </div>
            <div style={{ position: 'relative', minHeight: 60 }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tipIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35 }}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'white', fontStyle: 'italic', lineHeight: 1.65 }}
                >
                  {tips[tipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* CENTER PANEL */}
        <div className="dt-panel dt-panel-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '15vh', position: 'relative', gap: 0, zIndex: 2 }}>
          <motion.div
            style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 11, color: cfgColor, opacity: 0.6, letterSpacing: 0, textTransform: 'uppercase', marginBottom: 10 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.6 }}
          >
            GOOD AFTERNOON, {babyName.toUpperCase()}'S MOM
          </motion.div>

          <Headline name={babyName} />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, marginTop: 90 }}>

            <div className="record-area">
              <RecordButton
                recordingState={recordingState}
                setRecordingState={setRecordingState}
                onPermissionDenied={() => setShowPermissionSheet(true)}
                babyName={babyName}
                navigate={navigate}
                cfgColor={cfgColor}
              />
            </div>

            <div
              className="dt-skip-link"
              onClick={() => navigate('/symptoms')}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              No microphone - describe symptoms instead
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <motion.div className="dt-panel dt-panel-right entrance-right" style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', zIndex: 2 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 10, letterSpacing: '3px', color: 'rgba(0,0,0,0.35)', textTransform: 'uppercase' }}>RECENT CRIES</span>
              <span
                onClick={() => navigate('/history')}
                style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 11, color: cfgColor, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '3px', textTransform: 'uppercase' }}
              >
                See all <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </span>
            </div>
            <div className="dt-recent-list">
              {recentCries.slice(1, 4).map((s, i) => (
                <div key={s.sessionId} className="dt-recent-row" style={{ padding: '10px 0', borderBottom: i === 2 ? 'none' : '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: colorMap[s.reason] || '#ccc', boxShadow: `0 0 8px ${colorMap[s.reason]}88` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 16, color: '#1a1a1a' }}>{s.headline}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 11, color: 'rgba(0,0,0,0.4)' }}>{formatTimeAgo(s.createdAt)}</div>
                  </div>
                  {s.feedback && (
                    s.feedback === 'yes' ?
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  )}
                </div>
              ))}
              {recentCries.length <= 1 && <div style={{ fontSize: 13, opacity: 0.3, padding: '20px 0' }}>No other recent logs</div>}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${cfgColor} 0%, ${cfgColor}aa 100%)`, boxShadow: `0 4px 16px ${cfgColor}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 26, color: 'white' }}>
              {babyName.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: '#1a1a1a', letterSpacing: 0 }}>{babyName}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>{baby?.age} · {baby?.gender}</div>
              <div
                onClick={() => navigate('/settings?focus=profile')}
                style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: cfgColor, opacity: 0.6, cursor: 'pointer' }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                <span style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 11 }}>edit profile</span>
              </div>
            </div>
          </div>
        </motion.div>
      </DesktopLayout>
    </div>
  )
}

function MobileHome({ bg, babyName, lastSession, recordingState, setRecordingState, setShowPermissionSheet, navigate }) {
  const cfgColor = colorMap[lastSession?.reason] || '#FF6B6B'
  
  const recentSessions = useMemo(() => {
    const raw = localStorage.getItem('waaah_recent_sessions')
    return raw ? JSON.parse(raw) : []
  }, [])

  const hour = new Date().getHours()
  const tip =
    hour >= 6  && hour < 12 ? "Morning cries are often hunger. Check feed timing first." :
    hour >= 12 && hour < 18 ? "5 to 8 seconds of clear crying works best for analysis." :
    hour >= 18 && hour < 22 ? "Evening fussiness is common. Overstimulation is likely." :
    "Night cries are usually hunger or discomfort. Trust your gut."

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  return (
    <div className="screen-outer home-screen-outer" style={{ backgroundColor: bg, height: '100dvh', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <PremiumBackground cfgColor={cfgColor} />
      
      {/* A — Top bar */}
      <div className="home-topbar" style={{ height: 'auto', padding: 'env(safe-area-inset-top) 20px 0', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, color: cfgColor, letterSpacing: '-0.5px', textTransform: 'uppercase' }}>
          Waaah
        </div>
        <motion.button 
          whileTap={{ scale: 0.9 }} 
          onClick={() => navigate('/history')}
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </motion.button>
      </div>

      <div className="mobile-home-content screen-content" style={{ paddingTop: 'max(80px, calc(env(safe-area-inset-top) + 64px))', position: 'relative', zIndex: 10 }}>
        {/* B — Greeting + headline */}
        <div className="greeting-block" style={{ padding: '0 20px', marginBottom: 40 }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 11, letterSpacing: '0.08em', color: '#1a1a1a', opacity: 0.5, textTransform: 'uppercase' }}>
            GOOD {hour < 12 ? 'MORNING' : hour < 18 ? 'AFTERNOON' : 'EVENING'}, {babyName.toUpperCase()}'S MOM
          </div>
          <h2 style={{ fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: 28, color: '#1a1a1a', lineHeight: 1.1, marginTop: 8 }}>
            WHAT IS {babyName.toUpperCase()} TELLING YOU?
          </h2>
        </div>

        {/* C — Record button area */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '0 20px', marginBottom: 80 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <RecordButton 
              recordingState={recordingState} 
              setRecordingState={setRecordingState} 
              onPermissionDenied={() => setShowPermissionSheet(true)} 
              babyName={babyName} 
              navigate={navigate} 
              cfgColor={cfgColor} 
            />
          </motion.div>

          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <button
              onClick={() => navigate('/symptoms')}
              style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'rgba(0,0,0,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Or describe symptoms instead →
            </button>
          </div>
        </div>

        {/* D — Info cards row */}
        <motion.div 
          style={{ padding: '0 20px 120px', display: 'flex', flexDirection: 'column', gap: 16, position: 'relative', zIndex: 20 }}
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Card 1 — Last Cry */}
          <motion.div 
            className="mobile-card" 
            variants={cardVariants}
            style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
          >
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 11, letterSpacing: '3px', color: 'rgba(0,0,0,0.4)', marginBottom: 12 }}>
              LAST CRY
            </div>
            {lastSession ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorMap[lastSession.reason] }} />
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 20, color: colorMap[lastSession.reason] }}>
                    {lastSession.headline || lastSession.reason}!
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, opacity: 0.5, marginLeft: 'auto' }}>
                    {formatTimeAgo(lastSession.createdAt)}
                  </span>
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, opacity: 0.55, marginTop: 8, lineHeight: 1.5 }}>
                  {lastSession.action || 'Check for immediate needs and comfort.'}
                </div>
                <div style={{ height: 4, borderRadius: 2, width: '100%', background: `${colorMap[lastSession.reason]}22`, marginTop: 16, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(lastSession.confidence || 0.8) * 100}%`, background: colorMap[lastSession.reason] }} />
                </div>
              </>
            ) : (
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, opacity: 0.4, fontStyle: 'italic' }}>
                  No cries recorded yet
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, opacity: 0.3, marginTop: 4 }}>
                  Record your first cry to start
                </div>
              </div>
            )}
          </motion.div>

          {/* Card 2 — Tip */}
          <motion.div 
            className="mobile-card tip-card-mobile" 
            variants={cardVariants}
            style={{ background: '#FFB347', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(255,179,71,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ opacity: 0.85 }}>
                <path d="M9.663 17h4.674M12 3v1m8.66 8.66l-.707-.707M12 21v-1M4.047 12.66l-.707.707M18.728 5.272l-.707.707M5.979 18.021l-.707.707" strokeLinecap="round"/><path d="M12 17c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5c0 1.261-.466 2.412-1.235 3.291l-.265.304c-.334.384-.5 1.001-.5 1.405V17z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 11, letterSpacing: '3px', color: 'white', opacity: 0.85 }}>
                TIP
              </div>
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, fontStyle: 'italic', color: 'white', lineHeight: 1.6 }}>
              {tip}
            </div>
          </motion.div>

          {/* Card 3 — Recent Cries */}
          {recentSessions.length >= 2 && (
            <motion.div 
              className="mobile-card" 
              variants={cardVariants}
              style={{ background: '#ffffff', borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 11, letterSpacing: '3px', color: 'rgba(0,0,0,0.4)' }}>
                  RECENT CRIES
                </div>
                <div 
                  onClick={() => navigate('/history')}
                  style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 11, color: '#FF6B6B', cursor: 'pointer' }}
                >
                  SEE ALL →
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recentSessions.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: i < recentSessions.length - 1 ? 12 : 0, borderBottom: i < recentSessions.length - 1 ? '1px solid rgba(45,45,45,0.06)' : 'none' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: colorMap[s.reason] }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: colorMap[s.reason] }}>
                      {s.headline || s.reason}!
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, opacity: 0.45, marginLeft: 'auto' }}>
                      {formatTimeAgo(s.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        <BottomNav activeTab="home" />
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const baby = storage.getBaby()
  const babyName = baby?.name ?? ''
  const bg = { girl: '#FFE4EE', boy: '#DFF0FF', neutral: '#FFF3E0' }[baby?.gender] ?? '#FFF3E0'

  const [recordingState, setRecordingState] = useState('idle')
  const [showPermissionSheet, setShowPermissionSheet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    if (!baby?.babyId) {
      navigate('/');
      return;
    }
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const lastSession = useMemo(() => {
    const raw = localStorage.getItem('waaah_last_session')
    return raw ? JSON.parse(raw) : null
  }, [])

  const cfgColor = colorMap[lastSession?.reason] || '#FF6B6B'

  useEffect(() => {
    document.body.style.setProperty('--cfg-bg', bg);
    document.body.style.setProperty('--cfg-color', cfgColor);
    document.body.style.setProperty('--cfg-color-fade', cfgColor + '28');
    document.body.style.setProperty('--cfg-color-faint', cfgColor + '18');
  }, [bg, cfgColor]);

  if (isDesktop) {
    return (
      <DesktopHome
        baby={baby}
        babyName={babyName}
        bg={bg}
        cfgColor={cfgColor}
        navigate={navigate}
        recordingState={recordingState}
        setRecordingState={setRecordingState}
        setShowPermissionSheet={setShowPermissionSheet}
      />
    )
  }

  return (
    <MobileHome
      bg={bg}
      babyName={babyName}
      lastSession={lastSession}
      recordingState={recordingState}
      setRecordingState={setRecordingState}
      setShowPermissionSheet={setShowPermissionSheet}
      navigate={navigate}
    />
  )
}
