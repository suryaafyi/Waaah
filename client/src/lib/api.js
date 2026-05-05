const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

const get = async (path) => {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
  return res.json()
}

export const api = {
  // Baby
  createBaby: (body) => post('/api/baby', body),

  // Analyse — sends FormData, NOT JSON (has audio file)
  analyse: (formData, signal) =>
    fetch(`${BASE}/api/analyse`, {
      method: 'POST',
      body: formData,
      signal,
      // DO NOT set Content-Type header — browser sets multipart boundary automatically
    }).then(async (r) => {
      if (!r.ok) throw new Error(`API ${r.status}: ${await r.text()}`)
      return r.json()
    }),

  // Symptoms — JSON only
  symptoms: (body) => post('/api/symptoms', body),

  // History
  getHistory: (babyId) => get(`/api/history/${babyId}`),

  // Feedback
  postFeedback: (sessionId, feedback) =>
    post(`/api/feedback/${sessionId}`, { feedback }),
}
