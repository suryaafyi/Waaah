import { Router } from 'express'
import multer from 'multer'
import supabase from '../lib/supabase.js'
import { analyseCry } from '../lib/gemini.js'

const router  = Router()
const storage = multer.memoryStorage() // store in RAM, not disk
const upload  = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
})

// POST /api/analyse
// Accepts: multipart/form-data with audio file + context JSON + babyId
router.post('/', upload.single('audio'), async (req, res, next) => {
  try {
    const { context: contextRaw, babyId, babyAge } = req.body
    const context = contextRaw ? JSON.parse(contextRaw) : {}

    let geminiResult

    if (req.file) {
      // Convert audio buffer to base64
      const audioBase64   = req.file.buffer.toString('base64')
      const audioMimeType = req.file.mimetype ?? 'audio/webm'

      geminiResult = await analyseCry({
        audioBase64,
        audioMimeType,
        context,
        babyAge: babyAge ?? 'unknown',
      })
    } else {
      // No audio — analyse context only (shouldn't happen but handle gracefully)
      geminiResult = await analyseCry({
        audioBase64:   null,
        audioMimeType: null,
        context,
        babyAge:       babyAge ?? 'unknown',
      })
    }

    // Save session to Supabase
    const sessionData = {
      baby_id:      babyId   || null,
      reason:       geminiResult.reason,
      confidence:   geminiResult.confidence,
      headline:     geminiResult.headline,
      action:       geminiResult.action,
      explanation:  geminiResult.explanation,
      alternatives: geminiResult.alternatives,
      context:      context,
    }

    const { data: session, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select('id')
      .single()

    if (error) console.error('Supabase insert error:', error)

    res.json({
      sessionId: session?.id ?? null,
      ...geminiResult,
    })
  } catch (err) {
    next(err)
  }
})

export default router
