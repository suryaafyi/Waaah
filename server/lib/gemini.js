import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' })

// ─── Audio cry analysis ────────────────────────────────────────────────────

export async function analyseCry({ audioBase64, audioMimeType, context, babyAge }) {
  const prompt = `You are an expert pediatric nurse with 20 years of experience helping parents understand their baby's needs.

CRITICAL AUDIO ASSESSMENT — do this first before anything else:

Listen carefully to the audio. Determine:
1. Is there ANY actual crying or distress sounds present?
2. Is the audio mostly silence, ambient noise, white noise, or background sound with no baby crying?
3. Is the audio too short, too quiet, or too muffled to analyse?

If the audio contains NO clear crying — silence, ambient room noise, breathing only, music, or any non-cry sound:
Return this exact JSON and nothing else:
{
  "reason": "unclear",
  "confidence": 0,
  "headline": "No cry detected",
  "action": "Record again when your baby is actively crying",
  "explanation": "We couldn't detect any crying in this recording. For the best results, hold your phone close and record while your baby is actively crying for at least 5 seconds.",
  "alternatives": [],
  "noAudioDetected": true
}

If the audio is too short (under 3 seconds of actual crying):
Return this exact JSON:
{
  "reason": "unclear",
  "confidence": 0,
  "headline": "Too short",
  "action": "Hold the button and record for at least 5 seconds",
  "explanation": "The recording was too short to analyse. Try again and hold the button while your baby is crying — 5 to 8 seconds works best.",
  "alternatives": [],
  "noAudioDetected": true
}

Only if you can clearly hear a baby crying, proceed with the full analysis below.

Baby info:
- Age: ${babyAge ?? 'unknown'}
- Time since last feed: ${context?.lastFed ?? 'unknown'}
- Time since last sleep: ${context?.lastSlept ?? 'unknown'}
- Unusual symptoms: ${context?.unusual ?? 'none reported'}

Analyse the cry carefully:
1. Cry pattern — rhythmic and repetitive (hunger), continuous and intense (pain), whiny and intermittent (tired), strained with pauses (gas)
2. Pitch — low rhythmic (hunger), high-pitched urgent (pain), medium whiny (tired)
3. Intensity — matches the context window above?

Return ONLY valid JSON, no markdown, no backticks:

{
  "reason": "hunger" | "tired" | "gas" | "pain" | "comfort",
  "confidence": <integer 0-100>,
  "headline": "<one word + exclamation mark ONLY>",
  "action": "<one clear sentence starting with a verb, max 10 words>",
  "explanation": "<2 sentences max, warm and calm, reference cry pattern AND context>",
  "alternatives": [
    { "reason": "<second most likely>", "confidence": <integer>, "action": "<max 6 words>" },
    { "reason": "<third most likely>",  "confidence": <integer>, "action": "<max 6 words>" }
  ],
  "noAudioDetected": false
}

Rules:
- reason must be exactly one of: hunger, tired, gas, pain, comfort
- headline is ONE word + exclamation mark ONLY — nothing else
- confidence below 60 means you are genuinely unsure — say so in explanation
- Never guess hunger by default when audio is unclear — return noAudioDetected instead
- alternatives always has exactly 2 items
- Tone is warm and non-judgmental — like a trusted friend`

  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType: audioMimeType ?? 'audio/webm',
        data: audioBase64,
      },
    },
  ])

  return parseGeminiResponse(result.response.text())
}

// ─── Symptom-based analysis (no audio) ─────────────────────────────────────

export async function analyseSymptoms({ symptoms, babyAge, context }) {
  const prompt = `You are an expert pediatric nurse with 20 years of experience.

A parent is describing their baby's symptoms because they cannot record audio. Give them a clear, confident assessment.

Baby info:
- Age: ${babyAge ?? 'unknown'}
- Time since last feed: ${context?.lastFed ?? 'unknown'}
- Time since last sleep: ${context?.lastSlept ?? 'unknown'}

Observed symptoms:
- Body signals: ${symptoms?.bodySignals?.join(', ') ?? 'none reported'}
- Cry sound: ${symptoms?.crySound ?? 'unknown'}
- Face colour: ${symptoms?.faceColor ?? 'unknown'}

Return ONLY a valid JSON object. No markdown, no backticks, no explanation outside the JSON:

{
  "reason": "hunger" | "tired" | "gas" | "pain" | "comfort",
  "confidence": <integer 0-100>,
  "headline": "<one word + exclamation mark ONLY>",
  "action": "<one clear sentence starting with a verb, max 10 words>",
  "explanation": "<2 sentences max — reference the SPECIFIC symptoms they described>",
  "alternatives": [
    { "reason": "<second most likely>", "confidence": <integer>, "action": "<short action>" },
    { "reason": "<third most likely>",  "confidence": <integer>, "action": "<short action>" }
  ],
  "noAudioDetected": false
}

Rules: same as above. reason must be exactly one of: hunger, tired, gas, pain, comfort`

  const result = await model.generateContent(prompt)
  return parseGeminiResponse(result.response.text())
}

// ─── Shared parser ──────────────────────────────────────────────────────────

function parseGeminiResponse(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

  try {
    const parsed = JSON.parse(cleaned)

    // If Gemini flagged no audio — pass through directly
    if (parsed.noAudioDetected === true) return parsed

    const validReasons = ['hunger', 'tired', 'gas', 'pain', 'comfort']
    if (!validReasons.includes(parsed.reason)) parsed.reason = 'comfort'

    if (!Array.isArray(parsed.alternatives) || parsed.alternatives.length < 2) {
      parsed.alternatives = [
        { reason: 'hunger', confidence: 20, action: 'Try feeding' },
        { reason: 'tired',  confidence: 15, action: 'Try rocking' },
      ]
    }

    parsed.noAudioDetected = false
    return parsed

  } catch {
    return {
      reason:          'comfort',
      confidence:      50,
      headline:        'Try again',
      action:          'Hold your baby close and record again',
      explanation:     "We had trouble understanding this one. Try recording again with your phone closer to your baby.",
      alternatives:    [
        { reason: 'hunger', confidence: 25, action: 'Try feeding' },
        { reason: 'tired',  confidence: 20, action: 'Try rocking' },
      ],
      noAudioDetected: false,
    }
  }
}
