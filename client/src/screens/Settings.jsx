import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ChipGroup from '../components/ChipGroup'
import DesktopLayout from '../components/DesktopLayout'
import BottomNav from '../components/BottomNav'
import { storage } from '../lib/storage'
import { api } from '../lib/api'
import './Settings.css'

function Toggle({ value, onChange }) {
  return (
    <motion.button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 50,
        background: value ? 'var(--color-hunger)' : 'rgba(45,45,45,0.15)',
        border: 'none',
        cursor: 'pointer',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
      animate={{ backgroundColor: value ? '#FF6B6B' : 'rgba(45,45,45,0.15)' }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }}
        animate={{ x: value ? 22 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const savedBaby = storage.getBaby()
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Gender display map (storage value → chip label)
  const genderDisplayMap = {
    girl: 'Girl 🌸',
    boy: 'Boy 🩵',
    neutral: 'Prefer not to say',
  }
  const genderBgMap = {
    'Girl 🌸': '#FFE4EE',
    'Boy 🩵': '#DFF0FF',
    'Prefer not to say': '#FFF3E0',
  }

  // Form state — mirrors baby profile
  const [formData, setFormData] = useState({
    name: savedBaby?.name ?? '',
    age: savedBaby?.age ?? null,
    gender: genderDisplayMap[savedBaby?.gender] ?? 'Prefer not to say',
  })

  // Prefs state
  const [prefs, setPrefs] = useState(() => {
    const raw = localStorage.getItem('waaah_prefs')
    return raw ? JSON.parse(raw) : { darkRoomMode: false, hapticFeedback: true }
  })

  const [showToast, setShowToast] = useState(false)
  const [showResetSheet, setShowResetSheet] = useState(false)

  const currentBg = genderBgMap[formData.gender] ?? '#FFF3E0'

  const isDirty =
    formData.name !== savedBaby?.name ||
    formData.age !== savedBaby?.age ||
    formData.gender !== genderDisplayMap[savedBaby?.gender]

  // Scroll to profile section if focus=profile
  useEffect(() => {
    if (searchParams.get('focus') === 'profile') {
      setTimeout(() => {
        const el = document.getElementById('profile-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          el.classList.add('profile-pulse')
          setTimeout(() => el.classList.remove('profile-pulse'), 700)
        }
      }, 400)
    }
  }, [searchParams])

  const updatePref = (key, val) => {
    const updated = { ...prefs, [key]: val }
    setPrefs(updated)
    localStorage.setItem('waaah_prefs', JSON.stringify(updated))
    if (key === 'hapticFeedback' && val) {
      navigator.vibrate?.(40)
    }
  }

  const handleSave = async () => {
    const genderCleanMap = {
      'Girl 🌸': 'girl',
      'Boy 🩵': 'boy',
      'Prefer not to say': 'neutral',
    }

    const updated = {
      ...savedBaby,
      name: formData.name.trim(),
      age: formData.age,
      gender: genderCleanMap[formData.gender] ?? savedBaby.gender,
    }

    // Save locally first
    storage.setBaby(updated)

    // Sync to backend
    api.createBaby({ ...updated, deviceId: updated.deviceId }).catch(console.error)

    // Show success toast
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleReset = () => {
    localStorage.clear()
    setShowResetSheet(false)
    navigate('/')
  }

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  const genderColorMap = {
    'Girl 🌸': 'var(--color-hunger)',
    'Boy 🩵': 'var(--color-gas)',
    'Prefer not to say': 'var(--color-tired)',
  }

  const renderSettingsContent = () => (
    <>
      <motion.header className="settings-header" variants={itemVariants}>
        <span className="eyebrow">SETTINGS</span>
        <h1 className="settings-title">YOUR WAAAH</h1>
        <p className="settings-subtitle">Personalise your experience</p>
      </motion.header>

      {/* SECTION 1: Baby Profile */}
      <div className="section-label">BABY PROFILE</div>
      <motion.div className="settings-card" id="profile-section" variants={itemVariants}>
        <div className="baby-avatar" style={{ background: genderColorMap[formData.gender] }}>
          {formData.name ? (
            <span className="avatar-letter">{formData.name.charAt(0)}</span>
          ) : (
            <span className="avatar-fallback">?</span>
          )}
        </div>

        <div style={{ marginBottom: 32 }}>
          <label className="field-label">BABY'S NAME</label>
          <input
            type="text"
            className="name-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter name"
            style={{ caretColor: genderColorMap[formData.gender] }}
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label className="field-label">HOW OLD?</label>
          <ChipGroup
            options={['0–3 months', '3–6 months', '6–12 months', '12+ months']}
            selected={formData.age}
            onSelect={(val) => setFormData({ ...formData, age: val })}
            color="var(--color-hunger)"
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label className="field-label">GENDER</label>
          <span className="field-sublabel">Changes the app's colour theme</span>
          <ChipGroup
            options={['Girl 🌸', 'Boy 🩵', 'Prefer not to say']}
            selected={formData.gender}
            onSelect={(val) => setFormData({ ...formData, gender: val })}
            color="var(--color-comfort)"
          />
        </div>

        <motion.button
          className="save-btn"
          onClick={handleSave}
          style={{
            background: genderColorMap[formData.gender],
            opacity: isDirty ? 1 : 0.35,
            pointerEvents: isDirty ? 'auto' : 'none'
          }}
          whileHover={isDirty ? { scale: 1.02 } : {}}
          whileTap={isDirty ? { scale: 0.97 } : {}}
        >
          SAVE CHANGES
        </motion.button>
      </motion.div>

      {/* SECTION 2: Preferences */}
      <div className="section-label">PREFERENCES</div>
      <motion.div className="settings-card" variants={itemVariants}>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">Dark room mode</div>
            <div className="toggle-desc">Dims the screen automatically between 10pm–6am. Easier on everyone's eyes.</div>
          </div>
          <Toggle value={prefs.darkRoomMode} onChange={(val) => updatePref('darkRoomMode', val)} />
        </div>
        <div className="toggle-row">
          <div className="toggle-info">
            <div className="toggle-label">Haptic feedback</div>
            <div className="toggle-desc">Subtle vibration when recording starts and stops.</div>
          </div>
          <Toggle value={prefs.hapticFeedback} onChange={(val) => updatePref('hapticFeedback', val)} />
        </div>
      </motion.div>

      {/* SECTION 3: About */}
      <div className="section-label">ABOUT</div>
      <motion.div className="settings-card about-card" variants={itemVariants}>
        <div className="about-logo">WAAAH</div>
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
            <path
              d="M14 24C14 24 2 16 2 8C2 5 4.5 2.5 7.5 2.5C10 2.5 12.5 4.5 14 7C15.5 4.5 18 2.5 20.5 2.5C23.5 2.5 26 5 26 8C26 16 14 24 14 24Z"
              fill="#FF6B6B"
              stroke="#FF6B6B"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <p className="about-warm-text">
          Made with love for every mom who's ever Googled 'why is my baby crying' at 3am.
        </p>
        <div className="about-divider" />
        <div className="about-contest">Built for the Nori Mother's Day Challenge</div>
        <div className="about-version">Version 1.0.0 · May 2026</div>
      </motion.div>

      {/* SECTION 4: Reset */}
      <div className="section-label">DANGER ZONE</div>
      <motion.div className="settings-card" variants={itemVariants}>
        <button className="reset-btn" onClick={() => setShowResetSheet(true)}>
          START FRESH — RESET EVERYTHING
        </button>
      </motion.div>
    </>
  )

  return (
    <motion.div
      className="screen-outer"
      animate={{ backgroundColor: currentBg }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      style={{ minHeight: '100dvh', overflowY: 'auto' }}
    >
      <div className="screen-inner settings-screen">
        {isDesktop ? (
          <DesktopLayout activeTab="settings" babyName={savedBaby?.name || ''} cfgColor={genderColorMap[formData.gender]}>
            <div className="settings-desktop-content">
              <motion.div
                className="settings-content-inner"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {renderSettingsContent()}
              </motion.div>
            </div>
          </DesktopLayout>
        ) : (
          <div className="mobile-settings">
            <div className="mobile-header">
              <motion.button
                onClick={() => navigate('/home')}
                whileTap={{ scale: 0.9 }}
                className="back-btn"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </motion.button>
              <div className="mobile-wordmark">WAAAH</div>
            </div>
            <div className="mobile-settings-content">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {renderSettingsContent()}
              </motion.div>
            </div>
            <BottomNav activeTab="settings" activeColor={genderColorMap[formData.gender]} />
          </div>
        )}
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
          >
            Saved ✓
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showResetSheet && (
          <>
            <motion.div
              className="sheet-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetSheet(false)}
            />
            <motion.div
              className="reset-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="sheet-handle" />
              <h2 className="sheet-title">RESET EVERYTHING?</h2>
              <p className="sheet-body">
                This deletes {savedBaby?.name || 'the baby'}'s profile and all cry history.
                You'll start fresh from onboarding.
              </p>
              <motion.button
                className="sheet-confirm"
                onClick={handleReset}
                whileTap={{ scale: 0.97 }}
              >
                YES, RESET
              </motion.button>
              <button
                className="sheet-dismiss"
                onClick={() => setShowResetSheet(false)}
              >
                Keep everything
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
