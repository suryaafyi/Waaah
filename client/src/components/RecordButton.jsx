import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './RecordButton.css';

const MicIcon = () => (
  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0 0 14 0"/>
    <line x1="12" y1="17" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const Spinner = () => (
  <svg viewBox="0 0 24 24" width="14" stroke="currentColor" strokeWidth="2.5" fill="none" className="anim-spin">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83M2 12h4M18 12h4 M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>
)

export default function RecordButton({ recordingState, setRecordingState, onPermissionDenied, babyName, navigate, cfgColor }) {
  const mediaRecorderRef = useRef(null)
  const chunksRef        = useRef([])
  const streamRef        = useRef(null)
  const timerRef         = useRef(null)
  const btnRef           = useRef(null)

  const triggerHaptic = (pattern = 40) => {
    const prefs = JSON.parse(localStorage.getItem('waaah_prefs') ?? '{}')
    if (prefs.hapticFeedback !== false && navigator.vibrate) {
      try { navigator.vibrate(pattern) } catch (e) {}
    }
  }

  const [seconds, setSeconds] = useState(0)
  const [btnPos, setBtnPos] = useState({ x: 0, y: 0 })

  const startRecording = async () => {
    const granted = localStorage.getItem('waaah_mic_granted')
    if (granted === 'false') {
      onPermissionDenied()
      return
    }

    try {
      triggerHaptic(60) // stronger pulse = recording started
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mr = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        window.__waaahAudioBlob    = blob
        window.__waaahAudioMime    = mimeType
        setRecordingState('processing')
        stopStream()
        setTimeout(() => navigate('/context'), 800)
      }

      mr.start(100)
      setRecordingState('recording')
      setSeconds(0)

      timerRef.current = setInterval(() => {
        setSeconds(s => (s >= 9 ? (stopRecording(), 10) : s + 1))
      }, 1000)

    } catch (err) {
      console.error('Mic error:', err)
      onPermissionDenied()
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') {
      triggerHaptic(30) // softer pulse = recording stopped
      mediaRecorderRef.current.stop()
    }
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
  }

  const handleMouseMove = (e) => {
    if (recordingState !== 'idle' || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = (e.clientX - centerX) * 0.15
    const dy = (e.clientY - centerY) * 0.15
    setBtnPos({ x: dx, y: dy })
  }

  const handleMouseLeave = () => {
    setBtnPos({ x: 0, y: 0 })
  }

  useEffect(() => {
    // Pre-warm mic permission on mount — reduces friction on actual record
    const prewarmMic = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        localStorage.setItem('waaah_mic_granted', 'true')
        stream.getTracks().forEach(t => t.stop())
      } catch (err) {
        localStorage.setItem('waaah_mic_granted', 'false')
      }
    }

    const alreadyGranted = localStorage.getItem('waaah_mic_granted')
    if (!alreadyGranted) {
      prewarmMic()
    }

    return () => {
      clearInterval(timerRef.current)
      stopStream()
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      <div className="ripple-container">
        {[0, 0.8, 1.6].map((delay, i) => (
          <div 
            key={i} 
            className="ripple-ring" 
            style={{ 
              animationDelay: `${delay}s`,
              animationDuration: recordingState === 'recording' ? '0.6s' : '2.4s'
            }} 
          />
        ))}

        <motion.button
          ref={btnRef}
          className={`record-btn ${recordingState === 'recording' ? 'record-pulse' : ''}`}
          style={{
            width: 100, height: 100, borderRadius: '50%',
            background: `linear-gradient(145deg, ${cfgColor} 0%, ${cfgColor}cc 100%)`,
            border: '3px solid rgba(255,255,255,0.5)',
            boxShadow: `0 16px 48px ${cfgColor}55, 0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.35)`,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            x: btnPos.x, y: btnPos.y,
            zIndex: 10
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            if (recordingState === 'idle') startRecording()
          }}
          onPointerUp={(e) => {
            e.preventDefault()
            if (recordingState === 'recording') stopRecording()
          }}
          onPointerLeave={(e) => {
            e.preventDefault()
            if (recordingState === 'recording') stopRecording()
            handleMouseLeave()
          }}
          onMouseMove={handleMouseMove}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          disabled={recordingState === 'processing'}
        >
          <MicIcon />
        </motion.button>
      </div>

      <div style={{ 
        fontFamily: 'var(--font-display)', 
        fontWeight: 400, 
        fontSize: 13, 
        letterSpacing: '3px', 
        color: recordingState === 'idle' ? 'rgba(0,0,0,0.35)' : cfgColor,
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 20
      }}>
        {recordingState === 'processing' && <Spinner />}
        {recordingState === 'idle' && 'HOLD TO RECORD'}
        {recordingState === 'recording' && 'LISTENING...'}
        {recordingState === 'processing' && 'ANALYSING...'}
      </div>
    </div>
  )
}
