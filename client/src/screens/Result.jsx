import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import DesktopLayout from '../components/DesktopLayout';
import LoadingScreen from '../components/LoadingScreen';
import './Result.css';

const CONFIG = {
  hunger: { color: '#FF6B6B', bg: '#FFE4EE', blob: 'Hunger.png', headline: 'Hungry!' },
  tired: { color: '#FFB347', bg: '#FFF3E0', blob: 'Tired.png', headline: 'Sleepy!' },
  gas: { color: '#4ECDC4', bg: '#DFF0FF', blob: 'Gas.png', headline: 'Gassy!' },
  pain: { color: '#C77DFF', bg: '#F3E0FF', blob: 'Pain.png', headline: 'Ouchy!' },
  comfort: { color: '#FF9EBC', bg: '#FFE4EE', blob: 'Comfort.png', headline: 'Lonely!' },
};

const getCfg = (reason) => CONFIG[reason] || CONFIG['comfort'];

const ImageWithFallback = ({ src, reason, className, style, initial, animate, transition }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <motion.div
        className={`${className} fallback-circle`}
        style={{ ...style, backgroundColor: CONFIG[reason]?.color || '#ccc', borderRadius: '50%' }}
        initial={initial}
        animate={animate}
        transition={transition}
      />
    );
  }

  return (
    <motion.img
      src={src}
      className={className}
      style={style}
      initial={initial}
      animate={animate}
      transition={transition}
      alt=""
      onError={() => setError(true)}
    />
  );
};

export default function Result() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('black');
  const [feedbackState, setFeedbackState] = useState(null);
  const [history, setHistory] = useState([]);
  const baby = storage.getBaby();
  const babyName = baby?.name || 'Baby';
  const babyAge = baby?.age || 'unknown';
  const babyGender = baby?.gender || 'neutral';

  const bg = { girl: '#FFE4EE', boy: '#DFF0FF', neutral: '#FFF3E0' }[baby?.gender] || '#FFF3E0';

  const lastStoredSession = useMemo(() => {
    const raw = localStorage.getItem('waaah_last_session');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const result = window.__waaahResult;
    if (!result) {
      navigate('/home');
      return;
    }
    setData(result);

    const fetchHistory = async () => {
      if (baby?.babyId) {
        try {
          const res = await api.getHistory(baby.babyId);
          const raw = Array.isArray(res) ? res : (res.sessions || []);
          const mapped = raw.map(s => ({
            ...s,
            createdAt: s.createdAt || s.created_at
          }));
          setHistory(mapped);
        } catch (err) {
          console.error('History fetch error', err);
        }
      }
    };
    fetchHistory();

    const t1 = setTimeout(() => setPhase('bg'), 200);
    const t2 = setTimeout(() => setPhase('blob'), 700);
    const t3 = setTimeout(() => setPhase('headline'), 1200);
    const t4 = setTimeout(() => setPhase('card'), 1600);
    const t5 = setTimeout(() => setPhase('idle'), 2000);
    const t6 = setTimeout(() => setPhase('alts'), 2200);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      clearTimeout(t4); clearTimeout(t5); clearTimeout(t6);
    };
  }, [navigate, baby?.babyId]);

  const cfg = useMemo(() => getCfg(data?.reason), [data?.reason]);

  useEffect(() => {
    if (data && data.reason) {
      const raw = localStorage.getItem('waaah_recent_sessions')
      const existing = raw ? JSON.parse(raw) : []

      // Prevent duplicates by checking sessionId if available, or timestamp
      const isDuplicate = existing.some(s =>
        (s.sessionId && s.sessionId === data.sessionId) ||
        (s.reason === data.reason && Math.abs(new Date(s.createdAt) - new Date()) < 5000)
      )

      if (!isDuplicate) {
        const newSession = {
          sessionId: data.sessionId,
          reason: data.reason,
          headline: data.headline || cfg.headline,
          createdAt: new Date().toISOString(),
          confidence: data.confidence || 0.85,
          action: data.action || cfg.action,
        }
        const updated = [newSession, ...existing].slice(0, 3)
        localStorage.setItem('waaah_recent_sessions', JSON.stringify(updated))
      }
    }
  }, [data, cfg]);

  if (!data) {
    return (
      <div className="screen-outer" style={{ backgroundColor: bg }}>
        <AnimatePresence>
          <LoadingScreen message="Figuring it out..." />
        </AnimatePresence>
      </div>
    );
  }

  if (data?.noAudioDetected && !data?.reason || data?.reason === 'unclear') {
    const noCryContent = (
      <div className="no-cry-screen">
        <img
          src="/Loading.gif"
          alt="No cry detected"
          style={{ width: 100, height: 100, objectFit: 'contain' }}
        />
        <p className="no-cry-headline">{data.headline}</p>
        <p className="no-cry-body">{data.explanation}</p>
        <motion.button
          className="no-cry-btn"
          onClick={() => navigate('/home')}
          whileTap={{ scale: 0.97 }}
        >
          TRY AGAIN
        </motion.button>
      </div>
    );

    if (isDesktop) {
      return (
        <DesktopLayout activeTab="home" babyName={babyName} cfgColor="#FF6B6B">
          <div className="dt-panel dt-panel-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {noCryContent}
          </div>
        </DesktopLayout>
      );
    }

    return (
      <motion.div
        className="screen-outer"
        style={{ backgroundColor: bg }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {noCryContent}
      </motion.div>
    );
  }

  const handleFeedback = async (helped) => {
    setFeedbackState(helped ? 'yes' : 'no');
    if (helped) {
      localStorage.setItem('waaah_last_session', JSON.stringify({
        reason: data.reason,
        headline: data.headline || cfg.headline,
        confidence: data.confidence,
        createdAt: new Date().toISOString()
      }));
    }
    try {
      if (data.sessionId) {
        await api.postFeedback(data.sessionId, helped ? 'yes' : 'no');
      }
    } catch (err) {
      console.error('Feedback error', err);
    }
  };

  const resultContext = data?.context || window.__waaahResult?.context || {};

  if (isDesktop) {
    return (
      <DesktopLayout activeTab="home" babyName={babyName} cfgColor={cfg.color}>
        {/* LEFT PANEL */}
        <div className="dt-panel dt-panel-left" style={{ overflowY: 'auto' }}>
          <div className="dt-card">
            <div className="dt-card-label" style={{ color: cfg.color }}>LAST SESSION</div>
            {lastStoredSession ? (
              <div className="dt-last-card" style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="dt-dot" style={{ background: getCfg(lastStoredSession.reason).color }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{lastStoredSession.headline}</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>{new Date(lastStoredSession.createdAt).toLocaleTimeString()}</div>
              </div>
            ) : (
              <div className="dt-empty-text">No previous sessions</div>
            )}
          </div>

          <div className="dt-card">
            <div className="dt-card-label" style={{ color: cfg.color }}>CONTEXT</div>
            <div className="dt-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {resultContext.lastFed && <div className="dt-chip" style={{ background: cfg.color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>Fed: {resultContext.lastFed}</div>}
              {resultContext.lastSlept && <div className="dt-chip" style={{ background: cfg.color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>Slept: {resultContext.lastSlept}</div>}
              {resultContext.unusual && <div className="dt-chip" style={{ background: cfg.color, color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12 }}>{resultContext.unusual}</div>}
            </div>
          </div>

          <div className="dt-card">
            <div className="dt-card-label" style={{ color: cfg.color }}>AI CONFIDENCE</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <div className="dt-conf-percent" style={{ color: cfg.color, fontSize: 32, fontFamily: 'var(--font-body)', fontWeight: 800 }}>{data.confidence}%</div>
            </div>
            <div className="dt-conf-track" style={{ height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <motion.div
                className="dt-conf-fill"
                style={{ background: cfg.color, height: '100%' }}
                initial={{ width: 0 }}
                animate={{ width: `${data.confidence}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
          </div>
        </div>

        {/* CENTER PANEL */}
        <div className="dt-panel dt-panel-center" style={{
          background: cfg.color,
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflow: 'hidden',
          padding: '32px 24px 80px',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="dt-hero-texture" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }} />

          {/* Child 1 — Blob (top) */}
          <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 16, width: '100%', position: 'relative', zIndex: 1 }}>
            <motion.img
              src={`/${cfg.blob}`}
              className="dt-blob"
              style={{ maxHeight: '35vh', width: 'auto', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))' }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Child 2 — Text block (middle, centered) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 16px', width: '100%', position: 'relative', zIndex: 1 }}>
            <h1 className="dt-headline" style={{ color: 'white', fontSize: 72, fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '-2px', textAlign: 'center', margin: 0 }}>{data.headline || cfg.headline}</h1>
            <p className="dt-tip-text" style={{ color: 'white', height: 'auto', textAlign: 'center', maxWidth: 420, margin: '0 auto', fontSize: 16, lineHeight: 1.6 }}>{data.explanation}</p>
          </div>

          {/* Child 3 — Done button (bottom) */}
          <div style={{ flexShrink: 0, width: '100%', maxWidth: 420, display: 'flex', justifyContent: 'center', marginTop: 'auto', position: 'relative', zIndex: 1 }}>
            <button
              className="dt-analyse-btn"
              style={{ background: 'white', color: cfg.color, width: '100%', padding: '16px 48px', fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 18, letterSpacing: '3px', textTransform: 'uppercase', borderRadius: 12, border: 'none' }}
              onClick={() => navigate('/home')}
            >
              DONE
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="dt-panel dt-panel-right" style={{ overflowY: 'auto' }}>
          <div className="dt-card">
            <div className="dt-card-label" style={{ color: cfg.color }}>TODAY</div>
            <div className="dt-recent-list" style={{ marginTop: 12 }}>
              {history.slice(0, 5).map((s, i) => {
                const date = new Date(s.createdAt);
                const timeStr = isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={i} className="dt-recent-row">
                    <div className="dt-dot" style={{ background: getCfg(s.reason).color }} />
                    <div className="dt-recent-info">
                      <div className="dt-recent-main">{s.headline}</div>
                      <div className="dt-recent-sub">{timeStr}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dt-card">
            <button
              className="dt-analyse-btn"
              style={{ background: 'rgba(0,0,0,0.05)', color: 'black', width: '100%', borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase' }}
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Waaah Report', url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }
              }}
            >
              SHARE REPORT
            </button>
          </div>
        </div>
      </DesktopLayout>
    );
  }

  return (
    <div className={`screen-outer result-screen-outer phase-${phase}`} style={{ backgroundColor: phase === 'black' ? '#000' : cfg.color, height: '100dvh', overflow: 'hidden' }}>
      <div className="screen-inner screen-content" style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 24px',
        textAlign: 'center',
        minHeight: '100dvh'
      }}>
        <AnimatePresence>
          {phase === 'black' && (
            <motion.div
              className="black-overlay"
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#000', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="black-overlay-text" style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '3px', fontWeight: 400, textTransform: 'uppercase' }}>ANALYSING...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Child 1 — Blob (top) */}
        <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'center', paddingTop: 16, width: '100%' }}>
          <ImageWithFallback
            src={`/${cfg.blob}`}
            reason={data.reason}
            className="result-blob"
            style={{ maxHeight: '40vw', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: phase === 'black' ? 0.5 : 1, opacity: phase === 'black' ? 0 : 1 }}
            transition={{ type: 'spring', damping: 15 }}
          />
        </div>

        {/* Child 2 — Text block (middle, centered) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center', padding: '0 16px', width: '100%' }}>
          <motion.h1
            className="result-headline"
            style={{ color: 'white', fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontSize: 48, fontWeight: 400, letterSpacing: '-1px', textAlign: 'center', margin: 0 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: (phase !== 'black' && phase !== 'bg' && phase !== 'blob') ? 0 : 20, opacity: (phase !== 'black' && phase !== 'bg' && phase !== 'blob') ? 1 : 0 }}
          >
            {data.headline || cfg.headline}
          </motion.h1>

          {/* CONFIDENCE PILL (Mobile) */}
          <motion.div 
            className="confidence-pill"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', marginTop: 8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: phase === 'idle' ? 1 : 0, scale: phase === 'idle' ? 1 : 0.8 }}
          >
            <span className="confidence-text">{data.confidence}% CONFIDENCE</span>
          </motion.div>
          <motion.p
            className="result-explanation"
            style={{ color: 'white', textAlign: 'center', maxWidth: 420, margin: '0 auto', opacity: 0.9, fontSize: 15, lineHeight: 1.5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: (phase === 'idle' || phase === 'alts') ? 1 : 0 }}
          >
            {data.explanation}
          </motion.p>
        </div>

        {/* Child 3 — Done button (bottom) */}
        <div style={{ flexShrink: 0, width: '100%', maxWidth: 420, paddingBottom: 'max(16px, env(safe-area-inset-bottom))', marginTop: 'auto' }}>
          <motion.button
            className="done-btn"
            style={{ backgroundColor: 'white', color: cfg.color, width: '100%', fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase', height: 56, borderRadius: 12, border: 'none' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: (phase === 'idle' || phase === 'alts') ? 1 : 0 }}
            onClick={() => navigate('/home')}
          >
            DONE
          </motion.button>
        </div>
      </div>
    </div>
  );
}
