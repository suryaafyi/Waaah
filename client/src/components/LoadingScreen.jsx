import { motion } from 'framer-motion'
import './LoadingScreen.css'

export default function LoadingScreen({ message = 'One moment...' }) {
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
    </motion.div>
  )
}
