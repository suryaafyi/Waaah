import { Router } from 'express'
import supabase from '../lib/supabase.js'

const router = Router()

// POST /api/feedback/:sessionId
// Body: { feedback: 'helped' | 'didnt_help' }
router.post('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params
    const { feedback }  = req.body

    if (!['helped', 'didnt_help'].includes(feedback)) {
      return res.status(400).json({ error: 'feedback must be helped or didnt_help' })
    }

    const { error } = await supabase
      .from('sessions')
      .update({ feedback })
      .eq('id', sessionId)

    if (error) throw error

    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

export default router
