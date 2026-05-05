-- Supabase Schema for Waaah App

-- Babies table
CREATE TABLE babies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age TEXT NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions (Audio recordings and results)
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  baby_id UUID REFERENCES babies(id) ON DELETE CASCADE,
  audio_url TEXT,
  context_tags JSONB, -- Array of selected chips
  ai_reason TEXT NOT NULL, -- Hunger, Tired, Gas, Pain, Comfort
  ai_description TEXT,
  feedback TEXT, -- true/false/null (was the AI right?)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
