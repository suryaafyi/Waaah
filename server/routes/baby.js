import { Router } from 'express'
import supabase from '../lib/supabase.js'

const router = Router()

// POST /api/baby
// Create or upsert baby profile
router.post('/', async (req, res, next) => {
  try {
    const { name, age, gender, deviceId } = req.body

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' })
    }

    // Upsert by deviceId — one device = one baby profile
    const { data, error } = await supabase
      .from('babies')
      .upsert(
        {
          device_id: deviceId,
          name:      name    ?? 'Baby',
          age_range: age     ?? 'unknown',
          gender:    gender  ?? 'neutral',
        },
        { onConflict: 'device_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (error) throw error

    res.json({ babyId: data.id })
  } catch (err) {
    next(err)
  }
})

export default router
