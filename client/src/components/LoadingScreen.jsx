import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './LoadingScreen.css'

export default function LoadingScreen({ message = 'One moment...' }) {
  const [showWaitMessage, setShowWaitMessage] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowWaitMessage(true), 5000)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <img
        src="/Loading.gif"
        alt="Loading"
        className="loading-gif"
      />
      <p className="loading-message">{message}</p>
      
      {showWaitMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 12,
            color: 'var(--text-dark)',
            opacity: 0.35,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          First analysis takes a little longer — worth the wait 🍼
        </motion.p>
      )}
    </motion.div>
  )
}
