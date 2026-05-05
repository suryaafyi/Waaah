import { Router } from 'express'
import supabase from '../lib/supabase.js'

const router = Router()

// GET /api/history/:babyId
router.get('/:babyId', async (req, res, next) => {
  try {
    const { babyId } = req.params

    // Fetch last 30 sessions
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, reason, confidence, headline, action, explanation, feedback, created_at')
      .eq('baby_id', babyId)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) throw error

    // Pattern detection
    let pattern = null

    if (sessions.length >= 5) {
      // Count frequency of each reason across ALL sessions
      const reasonCounts = sessions.reduce((acc, s) => {
        acc[s.reason] = (acc[s.reason] ?? 0) + 1
        return acc
      }, {})

      // Find the dominant reason
      const sorted = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])
      const [topReason, topCount] = sorted[0]
      const totalSessions = sessions.length
      const percentage = Math.round((topCount / totalSessions) * 100)

      // Only surface a pattern if one reason is dominant (40%+ of sessions)
      if (percentage >= 40) {
        const reasonLabels = {
          hunger:  'hungry',
          tired:   'overtired',
          gas:     'gassy',
          pain:    'in pain',
          comfort: 'needing comfort',
        }

        // Time-of-day pattern detection (bonus — if 3+ sessions in same time window)
        const timeWindows = {
          night:     sessions.filter(s => { const h = new Date(s.created_at).getHours(); return h >= 0  && h < 6  }).length,
          morning:   sessions.filter(s => { const h = new Date(s.created_at).getHours(); return h >= 6  && h < 12 }).length,
          afternoon: sessions.filter(s => { const h = new Date(s.created_at).getHours(); return h >= 12 && h < 18 }).length,
          evening:   sessions.filter(s => { const h = new Date(s.created_at).getHours(); return h >= 18 && h < 24 }).length,
        }
        const dominantWindow = Object.entries(timeWindows).sort((a, b) => b[1] - a[1])[0]
        const windowLabels = {
          night: 'at night', morning: 'in the morning',
          afternoon: 'in the afternoon', evening: 'in the evening',
        }

        const hasTimePattern = dominantWindow[1] >= 3

        pattern = hasTimePattern
          ? `Usually ${reasonLabels[topReason] ?? topReason} ${windowLabels[dominantWindow[0]]} · ${percentage}% of cries`
          : `Most cries are ${reasonLabels[topReason] ?? topReason} · ${percentage}% of sessions`
      }

      // Secondary pattern — alternating gas/hunger (common in young babies)
      if (!pattern && sorted.length >= 2) {
        const [topReason2, topCount2] = sorted[0]; // redefine for secondary
        const [secondReason, secondCount] = sorted[1];
        
        const reasonLabels = {
          hunger:  'hungry',
          tired:   'overtired',
          gas:     'gassy',
          pain:    'in pain',
          comfort: 'needing comfort',
        }

        const combined = ((topCount2 + secondCount) / totalSessions) * 100
        if (combined >= 70) {
          pattern = `Mostly ${reasonLabels[topReason2] ?? topReason2} and ${reasonLabels[secondReason] ?? secondReason} · ${totalSessions} sessions analysed`
        }
      }
    }

    // Accuracy — % of sessions with 'helped' feedback
    const withFeedback = sessions.filter(s => s.feedback)
    const accuracy = withFeedback.length > 0
      ? Math.round(
          (withFeedback.filter(s => s.feedback === 'helped').length / withFeedback.length) * 100
        )
      : null

    res.json({
      sessions,
      pattern,        // string | null
      accuracy,       // integer | null
      totalSessions: sessions.length,
    })
  } catch (err) {
    next(err)
  }
})

export default router
