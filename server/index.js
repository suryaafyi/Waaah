import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import babyRouter    from './routes/baby.js'
import analyseRouter from './routes/analyse.js'
import symptomsRouter from './routes/symptoms.js'
import historyRouter from './routes/history.js'
import feedbackRouter from './routes/feedback.js'

const app  = express()
const PORT = process.env.PORT ?? 3001

// CORS — allow Vercel frontend + local dev
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}))

app.use(express.json())

// Health check — Render pings this to keep service alive
app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }))

// Routes
app.use('/api/baby',     babyRouter)
app.use('/api/analyse',  analyseRouter)
app.use('/api/symptoms', symptomsRouter)
app.use('/api/history',  historyRouter)
app.use('/api/feedback', feedbackRouter)

// Global error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({
    error: 'Something went wrong',
    message: err.message,
  })
})

app.listen(PORT, () => {
  console.log(`Waaah server running on port ${PORT}`)
})
