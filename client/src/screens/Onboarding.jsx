import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ChipGroup from '../components/ChipGroup';
import { api } from '../lib/api';
import { storage } from '../lib/storage';
import './Onboarding.css';

const bgMap = {
  'Girl':           'var(--bg-girl)',
  'Boy':            'var(--bg-boy)',
  'Prefer not to say': 'var(--bg-neutral)',
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [babyName, setBabyName]         = useState('');
  const [selectedAge, setSelectedAge]   = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading]           = useState(false);

  const currentBg = bgMap[selectedGender] ?? 'var(--bg-neutral)';
  const canSubmit = babyName.trim().length > 0 && !loading;

  useEffect(() => {
    // Prevent body scroll per spec
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async () => {
    if (!babyName.trim()) return;
    setLoading(true);

    let deviceId = storage.getDeviceId();

    const genderMap = {
      'Girl': 'girl',
      'Boy': 'boy',
      'Prefer not to say': 'neutral',
    };

    const profile = {
      name: babyName.trim(),
      age: selectedAge ?? 'unknown',
      gender: genderMap[selectedGender] ?? 'neutral',
      deviceId,
    };

    try {
      const { babyId } = await api.createBaby(profile);
      profile.babyId = babyId;

      storage.setBaby(profile);
      navigate('/home');
    } catch (err) {
      console.error(err);
      // Save locally anyway — don't block user
      storage.setBaby(profile);
      navigate('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="screen-outer"
      animate={{ backgroundColor: currentBg }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="screen-inner">
        <motion.div
          className="onboarding-inner"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
        <motion.h1 variants={itemVariants} className="logo-wordmark" style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '-0.5px' }}>Waaah</motion.h1>
        <motion.p variants={itemVariants} className="tagline" style={{ fontFamily: 'var(--font-body)', fontWeight: 500, opacity: 0.6 }}>What's your baby telling you?</motion.p>
        
        <div style={{ flex: 1, minHeight: '32px' }} />

        <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
          <div className="section-label">Your baby's name</div>
          <input
            type="text"
            className="name-input"
            placeholder="e.g. Mia"
            value={babyName}
            onChange={(e) => setBabyName(e.target.value)}
          />
        </motion.div>

        <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
          <div className="section-label">How old is your baby?</div>
          <ChipGroup
            options={['0–3 months', '3–6 months', '6–12 months', '12+ months']}
            selected={selectedAge}
            onSelect={setSelectedAge}
            color="var(--color-hunger)"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="section-label" style={{ marginTop: '0' }}>Baby's gender</div>
          <div className="sub-label">Changes the app's color theme — just for fun</div>
          <ChipGroup
            options={['Girl', 'Boy', 'Prefer not to say']}
            selected={selectedGender}
            onSelect={setSelectedGender}
            color="var(--color-comfort)"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.button 
            className={`onboarding-cta ${loading ? 'loading' : ''}`}
            disabled={!canSubmit}
            onClick={handleSubmit}
            whileHover={canSubmit ? { scale: 1.02 } : {}}
            whileTap={canSubmit ? { scale: 0.97 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', fontWeight: 400, letterSpacing: '3px' }}
          >
            {loading ? 'One sec...' : "Let's go!"}
          </motion.button>
          <div className="skip-note">Age and gender are totally optional</div>
        </motion.div>

      </motion.div>

        <motion.img
          src="/blobs/Hunger.png"
          alt=""
          aria-hidden="true"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            bottom: '-40px',
            right: '-40px',
            width: '200px',
            opacity: 0.08,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />
      </div>
    </motion.div>
  );
}
