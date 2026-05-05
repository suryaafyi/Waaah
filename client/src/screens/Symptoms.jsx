import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../lib/storage';
import { api } from '../lib/api';
import DesktopLayout from '../components/DesktopLayout';
import LoadingScreen from '../components/LoadingScreen';
import './Symptoms.css';

const SECTIONS = [
  {
    label: 'CRYING PATTERN',
    chips: [
      { id: 'wont_stop', label: "Won't stop" },
      { id: 'intermittent', label: 'On and off' },
      { id: 'just_started', label: 'Just started' },
      { id: 'winding_down', label: 'Winding down' }
    ]
  },
  {
    label: 'BODY SIGNALS',
    chips: [
      { id: 'legs_pulled_up', label: 'Legs pulled up' },
      { id: 'face_red', label: 'Face is red' },
      { id: 'fists_clenched', label: 'Fists clenched' },
      { id: 'arching_back', label: 'Arching back' },
      { id: 'mouth_open', label: 'Mouth open' },
      { id: 'sucking_motions', label: 'Sucking motions' }
    ]
  },
  {
    label: 'TIMING',
    chips: [
      { id: 'just_fed', label: 'Just fed (<30 min)' },
      { id: 'feed_overdue', label: 'Feed overdue (2h+)' },
      { id: 'skipped_nap', label: 'Skipped nap' },
      { id: 'past_bedtime', label: 'Past bedtime' }
    ]
  },
  {
    label: 'RECENT EVENTS',
    chips: [
      { id: 'post_vaccine', label: 'Had vaccines today' },
      { id: 'seems_unwell', label: 'Seems unwell' },
      { id: 'long_car_ride', label: 'Long car ride' },
      { id: 'overstimulated', label: 'Lots of visitors' }
    ]
  }
];

function DesktopSymptoms({ babyName, babyAge, cfgColor, selected, toggleChip, handleAnalyse, loading, navigate }) {
  return (
    <DesktopLayout activeTab="home" babyName={babyName} cfgColor={cfgColor}>
      <div className="dt-panel dt-panel-left">
        <div className="dt-card">
          <div className="dt-card-label" style={{ color: cfgColor }}>GUIDE</div>
          <p className="dt-tip-text" style={{ height: 'auto' }}>
            Describing symptoms helps the AI refine its prediction based on common pediatric markers like "legs pulled up" (colic) or "sucking motions" (hunger).
          </p>
        </div>
      </div>

      <div className="dt-panel dt-panel-center">
        <div className="dt-greeting" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: 0, textTransform: 'uppercase' }}>STEP 2: DESCRIBE SYMPTOMS</div>
        <h1 className="dt-headline" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, fontSize: 56, letterSpacing: '-1px' }}>WHAT DO YOU SEE?</h1>

        <div className="dt-symptoms-scroll" style={{ width: '100%', overflowY: 'auto', padding: '0 20px 40px' }}>
          <div className="dt-symptoms-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {SECTIONS.map((sec) => (
              <div key={sec.label} className="dt-card" style={{ maxWidth: 'none', margin: 0 }}>
                <div className="dt-card-label" style={{ marginBottom: 12 }}>{sec.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {sec.chips.map((chip) => {
                    const isSelected = selected.has(chip.id);
                    return (
                      <button
                        key={chip.id}
                        className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                        style={isSelected ? { backgroundColor: cfgColor, color: 'white' } : {}}
                        onClick={() => toggleChip(chip.id)}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dt-context-actions" style={{ position: 'sticky', bottom: 0, width: '100%', background: 'var(--cfg-bg)', paddingTop: 20 }}>
          <button 
            className={`dt-analyse-btn ${loading ? 'loading' : ''}`}
            onClick={handleAnalyse}
            disabled={loading || selected.size === 0}
            style={{ background: cfgColor, width: '100%', maxWidth: 400 }}
          >
            {loading ? 'READING THE SIGNS...' : `ANALYSE (${selected.size} SELECTED)`}
          </button>
        </div>
      </div>

      <div className="dt-panel dt-panel-right">
        <div className="dt-card dt-baby-card">
          <div className="dt-baby-avatar" style={{ background: cfgColor }}>
            {babyName.charAt(0).toUpperCase()}
          </div>
          <div className="dt-baby-info">
            <div className="dt-baby-name">{babyName}</div>
            <div className="dt-baby-meta">{babyAge}</div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  );
}

function MobileSymptoms({ babyName, babyAge, cfgColor, cfgBg, selected, toggleChip, handleAnalyse, loading, error, setError, navigate }) {
  return (
    <div className="screen-outer" style={{ backgroundColor: cfgBg }}>
      <div className="screen-inner">
      <div className="symptoms-inner">
        <div className="symptoms-header">
          <motion.button className="back-btn" whileTap={{ scale: 0.9 }} onClick={() => navigate('/home')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </motion.button>
          <div className="symptoms-title-group">
            <h1 className="symptoms-title" style={{ color: cfgColor }}>What do you see?</h1>
            <p className="symptoms-subtitle">Pick everything that applies</p>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div className="error-banner" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <span>{error}</span>
              <button className="error-dismiss" onClick={() => setError(null)}>✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {babyName && (
          <div className="baby-context-bar">
            <div className="baby-avatar" style={{ backgroundColor: cfgColor }}>{babyName.charAt(0).toUpperCase()}</div>
            <div className="baby-info">{babyName} &middot; {babyAge}</div>
          </div>
        )}

        {SECTIONS.map((sec, secIdx) => (
          <div key={sec.label} className="symptoms-section">
            <div className="symptoms-section-label">{sec.label}</div>
            <div className="chips-grid">
              {sec.chips.map((chip, chipIdx) => {
                const isSelected = selected.has(chip.id);
                const flatIndex = secIdx * 4 + chipIdx; 
                return (
                  <motion.button
                    key={chip.id}
                    className={`symptom-chip ${isSelected ? 'selected' : ''}`}
                    style={isSelected ? { backgroundColor: cfgColor } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: flatIndex * 0.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleChip(chip.id)}
                  >
                    {isSelected && <span style={{ marginRight: 2 }}>✓</span>}
                    {chip.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        <div style={{ flex: 1, minHeight: '40px' }} />
        <div className="sticky-cta-container" style={{ background: `linear-gradient(to bottom, transparent, ${cfgBg} 30%)` }}>
          <button className="analyse-btn" style={{ backgroundColor: cfgColor }} disabled={selected.size === 0 || loading} onClick={handleAnalyse}>
            {loading ? 'Reading the signs…' : `Analyse (${selected.size} selected)`}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

export default function Symptoms() {
  const navigate = useNavigate();
  const baby     = storage.getBaby();
  const babyName = baby?.name ?? '';
  const babyAge  = baby?.age ?? 'unknown';

  const cfgColor = { girl: '#FF9EBC', boy: '#4ECDC4', neutral: '#FFB347' }[baby?.gender] ?? '#FFB347';
  const cfgBg    = { girl: '#FFE4EE', boy: '#DFF0FF', neutral: '#FFF3E0' }[baby?.gender] ?? '#FFF3E0';

  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleChip = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAnalyse = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setError(null);

    const symptomsList = Array.from(selected);
    let lastFed = 'unknown';
    if (symptomsList.includes('just_fed')) lastFed = 'Just now';
    if (symptomsList.includes('feed_overdue')) lastFed = '3+ hours ago';

    let recentEvents = [];
    if (symptomsList.includes('post_vaccine')) recentEvents.push('vaccines');
    if (symptomsList.includes('seems_unwell')) recentEvents.push('sick');
    if (symptomsList.includes('long_car_ride')) recentEvents.push('car ride');
    if (symptomsList.includes('overstimulated')) recentEvents.push('visitors');

    try {
      const payload = {
        symptoms: {
          bodySignals: symptomsList,
          crySound: 'unknown',
          faceColor: 'unknown'
        },
        babyId: baby?.babyId,
        babyAge: babyAge,
        context: { lastFed, recentEvents }
      };
      const result = await api.symptoms(payload);
      window.__waaahResult = result;
      localStorage.setItem('waaah_last_session', JSON.stringify({
        ...result,
        createdAt: new Date().toISOString()
      }));
      navigate('/result');
    } catch (err) {
      console.error(err);
      setError('Something went wrong — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen message="Reading the symptoms..." />}
      </AnimatePresence>

      {isDesktop ? (
        <DesktopSymptoms 
          babyName={babyName} babyAge={babyAge} cfgColor={cfgColor}
          selected={selected} toggleChip={toggleChip} 
          handleAnalyse={handleAnalyse} loading={loading} navigate={navigate}
        />
      ) : (
        <MobileSymptoms 
          babyName={babyName} babyAge={babyAge} cfgColor={cfgColor} cfgBg={cfgBg}
          selected={selected} toggleChip={toggleChip} 
          handleAnalyse={handleAnalyse} loading={loading} error={error} setError={setError} navigate={navigate}
        />
      )}
    </>
  );
}
