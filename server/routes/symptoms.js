import { Router } from 'express'
import supabase from '../lib/supabase.js'
import { analyseSymptoms } from '../lib/gemini.js'

const router = Router()

// POST /api/symptoms
// Body: { symptoms: { bodySignals[], crySound, faceColor }, babyId, babyAge, context }
router.post('/', async (req, res, next) => {
  try {
    const { symptoms, babyId, babyAge, context } = req.body

    const geminiResult = await analyseSymptoms({
      symptoms,
      babyAge:  babyAge  ?? 'unknown',
      context:  context  ?? {},
    })

    // Save session
    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        baby_id:      babyId   || null,
        reason:       geminiResult.reason,
        confidence:   geminiResult.confidence,
        headline:     geminiResult.headline,
        action:       geminiResult.action,
        explanation:  geminiResult.explanation,
        alternatives: geminiResult.alternatives,
        context:      { symptoms, ...context },
      })
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
