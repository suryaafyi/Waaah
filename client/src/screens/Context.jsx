import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ChipGroup from '../components/ChipGroup';
import DesktopLayout from '../components/DesktopLayout';
import LoadingScreen from '../components/LoadingScreen';
import { AnimatePresence } from 'framer-motion';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import './Context.css';

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

const questionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut', delay: 0.2 + i * 0.1 }
  })
};

function DesktopContext({ baby, babyName, bg, cfgColor, selectedFed, setSelectedFed, selectedSlept, setSelectedSlept, selectedUnusual, setSelectedUnusual, handleAnalyse, loading, navigate }) {
  return (
    <DesktopLayout activeTab="home" babyName={babyName} cfgColor={cfgColor}>
      <div className="dt-panel dt-panel-left">
        <motion.img 
          src="/Tired.png" 
          className="dt-context-deco"
          initial={{ opacity: 0, rotate: -20, scale: 0.8 }}
          animate={{ opacity: 0.12, rotate: -15, scale: 1 }}
        />
      </div>

      <div className="dt-panel dt-panel-center">
        <div className="dt-context-card">
          <h1 className="dt-context-title" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, fontSize: 32, letterSpacing: '-0.5px' }}>Quick check — help us understand {babyName}</h1>
          <p className="dt-context-sub" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14 }}>3 taps is all we need. Or skip — we'll still figure it out.</p>
          
          <div className="dt-context-questions">
            <div className="dt-q-row">
              <div className="dt-q-label">When did {babyName} last eat?</div>
              <ChipGroup
                options={['Just now', '1 hour ago', '2 hours ago', '3+ hours ago']}
                selected={selectedFed}
                onSelect={setSelectedFed}
                color={cfgColor}
              />
            </div>
            <div className="dt-q-row">
              <div className="dt-q-label">When did {babyName} last sleep?</div>
              <ChipGroup
                options={['Just woke up', '1 hour ago', '2+ hours ago']}
                selected={selectedSlept}
                onSelect={setSelectedSlept}
                color={cfgColor}
              />
            </div>
            <div className="dt-q-row">
              <div className="dt-q-label">Anything unusual going on?</div>
              <ChipGroup
                options={['Teething', 'Seems sick', 'Nothing unusual']}
                selected={selectedUnusual}
                onSelect={setSelectedUnusual}
                color={cfgColor}
              />
            </div>
          </div>

          <div className="dt-context-actions">
            <button 
              className={`dt-analyse-btn ${loading ? 'loading' : ''}`}
              onClick={() => handleAnalyse(false)}
              disabled={loading}
              style={{ background: cfgColor, fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '3px' }}
            >
              {loading ? 'FIGURING IT OUT...' : 'ANALYSE NOW'}
            </button>
            <div className="dt-skip-link" onClick={() => handleAnalyse(true)} style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 12, opacity: 0.5, marginTop: 12, cursor: 'pointer', textTransform: 'uppercase' }}>
              Skip — analyse without context
            </div>
          </div>
        </div>
      </div>

      <div className="dt-panel dt-panel-right">
        <motion.img 
          src="/Gas.png" 
          className="dt-context-deco"
          initial={{ opacity: 0, rotate: 20, scale: 0.8 }}
          animate={{ opacity: 0.12, rotate: 10, scale: 1 }}
        />
      </div>
    </DesktopLayout>
  )
}

function MobileContext({ babyName, bg, selectedFed, setSelectedFed, selectedSlept, setSelectedSlept, selectedUnusual, setSelectedUnusual, handleAnalyse, loading, navigate, progress }) {
  return (
    <div className="screen-outer" style={{ backgroundColor: bg }}>
      <div className="screen-inner">
        <div className="context-inner">
        <div className="top-row">
          <motion.button className="back-btn" onClick={() => navigate('/home')} whileTap={{ scale: 0.9 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </motion.button>
          <div className="progress-track">
            <motion.div
              style={{ height: '100%', borderRadius: '50px', background: 'var(--color-hunger)' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        <motion.div className="context-header" variants={containerVariants} initial="hidden" animate="show">
          <motion.div variants={itemVariants} className="step-label" style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5 }}>Almost there</motion.div>
          <motion.h1 variants={itemVariants} className="context-title" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, fontSize: 28, letterSpacing: '-0.5px' }}>
            {babyName ? `Quick check — help us understand ${babyName}` : 'Quick check — help us understand'}
          </motion.h1>
          <motion.p variants={itemVariants} className="context-subtitle" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14 }}>3 taps is all we need. Or skip — we'll still figure it out.</motion.p>
        </motion.div>

        <div className="questions-container">
          <motion.div custom={0} variants={questionVariants} initial="hidden" animate="show">
            <div className="question-label">{babyName ? `When did ${babyName} last eat?` : 'When did your baby last eat?'}</div>
            <ChipGroup options={['Just now', '1 hour ago', '2 hours ago', '3+ hours ago']} selected={selectedFed} onSelect={setSelectedFed} color="var(--color-hunger)" />
          </motion.div>
          <motion.div custom={1} variants={questionVariants} initial="hidden" animate="show">
            <div className="question-label">{babyName ? `When did ${babyName} last sleep?` : 'When did your baby last sleep?'}</div>
            <ChipGroup options={['Just woke up', '1 hour ago', '2+ hours ago']} selected={selectedSlept} onSelect={setSelectedSlept} color="var(--color-tired)" />
          </motion.div>
          <motion.div custom={2} variants={questionVariants} initial="hidden" animate="show">
            <div className="question-label">Anything unusual going on?</div>
            <ChipGroup options={['Teething', 'Seems sick', 'Nothing unusual']} selected={selectedUnusual} onSelect={setSelectedUnusual} color="var(--color-pain)" />
          </motion.div>
        </div>

        <div style={{ flex: 1, minHeight: '32px' }} />

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.55 }} style={{ paddingBottom: '16px' }}>
          <motion.button
            className={`analyse-cta ${loading ? 'loading' : ''}`}
            onClick={() => handleAnalyse(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {loading ? 'Figuring it out...' : 'Analyse Now'}
          </motion.button>
          <button className="skip-btn" onClick={() => handleAnalyse(true)} disabled={loading}>Skip — analyse without context</button>
        </motion.div>
      </div>
      </div>
    </div>
  )
}

export default function Context() {
  const navigate = useNavigate();
  const baby     = storage.getBaby();
  const babyName = baby?.name ?? '';
  const bg       = { girl:'#FFE4EE', boy:'#DFF0FF', neutral:'#FFF3E0' }[baby?.gender] ?? '#FFF3E0';

  const [selectedFed,     setSelectedFed]     = useState(null);
  const [selectedSlept,   setSelectedSlept]   = useState(null);
  const [selectedUnusual, setSelectedUnusual] = useState(null);
  const [loading,         setLoading]         = useState(false);
  const [isDesktop,       setIsDesktop]       = useState(window.innerWidth >= 1024);

  const lastSession = useMemo(() => {
    const raw = localStorage.getItem('waaah_last_session')
    return raw ? JSON.parse(raw) : null
  }, [])
  const cfgColor = { hunger:'#FF6B6B', tired:'#FFB347', gas:'#4ECDC4', pain:'#C77DFF', comfort:'#FF9EBC' }[lastSession?.reason] || '#FF6B6B';

  useEffect(() => {
    if (!window.__waaahAudioBlob) {
      navigate('/home');
    }
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate]);

  const answered = [selectedFed, selectedSlept, selectedUnusual].filter(Boolean).length;
  const progress = 50 + (answered / 3) * 50;

  const handleAnalyse = async (skipContext = false) => {
    setLoading(true);
    const context = skipContext ? {} : {
      lastFed:   selectedFed     ?? 'unknown',
      lastSlept: selectedSlept   ?? 'unknown',
      unusual:   selectedUnusual ?? 'unknown',
    };

    try {
      const formData = new FormData();
      const audioBlob = window.__waaahAudioBlob;
      const audioMime = window.__waaahAudioMime ?? 'audio/webm';

      if (audioBlob) {
        const ext = audioMime.includes('mp4') ? 'mp4' : 'webm';
        formData.append('audio', audioBlob, `cry.${ext}`);
      }

      formData.append('context', JSON.stringify(context));
      formData.append('babyId',  baby?.babyId || '');
      formData.append('babyAge', baby?.age    ?? 'unknown');

      const result = await api.analyse(formData);
      window.__waaahResult = result;
      localStorage.setItem('waaah_last_session', JSON.stringify({
        ...result,
        createdAt: new Date().toISOString(),
      }));
      navigate('/result');
    } catch (err) {
      console.error('Analyse error:', err);
      window.__waaahResult = {
        reason: 'comfort', confidence: 50, headline: 'There there!',
        action: 'Hold your baby close and try again',
        explanation: 'We had trouble connecting. Your baby might just need some comfort.',
        alternatives: [], sessionId: null,
      };
      navigate('/result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen message={`Listening to ${babyName}...`} />}
      </AnimatePresence>

      {isDesktop ? (
        <DesktopContext 
          baby={baby} babyName={babyName} bg={bg} cfgColor={cfgColor}
          selectedFed={selectedFed} setSelectedFed={setSelectedFed}
          selectedSlept={selectedSlept} setSelectedSlept={setSelectedSlept}
          selectedUnusual={selectedUnusual} setSelectedUnusual={setSelectedUnusual}
          handleAnalyse={handleAnalyse} loading={loading} navigate={navigate}
        />
      ) : (
        <MobileContext 
          babyName={babyName} bg={bg} 
          selectedFed={selectedFed} setSelectedFed={setSelectedFed}
          selectedSlept={selectedSlept} setSelectedSlept={setSelectedSlept}
          selectedUnusual={selectedUnusual} setSelectedUnusual={setSelectedUnusual}
          handleAnalyse={handleAnalyse} loading={loading} navigate={navigate} progress={progress}
        />
      )}
    </>
  );
}
