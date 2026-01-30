/*
  # Create Detection History Table

  1. New Tables
    - `detection_history`
      - `id` (uuid, primary key)
      - `audio_hash` (text, SHA256 hash of audio file for deduplication)
      - `language` (text)
      - `classification` (text, 'AI_GENERATED' or 'HUMAN')
      - `confidence` (numeric, 0.0 to 1.0)
      - `processing_time_ms` (integer)
      - `model_version` (text, which model version made prediction)
      - `features` (jsonb, audio features used for classification)
      - `created_at` (timestamp)

  2. Purpose
    - Store detection history for future model improvements
    - Track model performance across different audio samples
    - Enable pattern analysis and model optimization
    - Support analytics and metrics

  3. Notes
    - audio_hash prevents storing duplicate detections
    - Stores feature data to understand classification decisions
    - Can be used for model retraining and validation
*/

CREATE TABLE IF NOT EXISTS detection_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audio_hash text NOT NULL UNIQUE,
  language text NOT NULL,
  classification text NOT NULL CHECK (classification IN ('AI_GENERATED', 'HUMAN')),
  confidence numeric NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  processing_time_ms integer,
  model_version text,
  features jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_detection_history_language ON detection_history(language);
CREATE INDEX IF NOT EXISTS idx_detection_history_classification ON detection_history(classification);
CREATE INDEX IF NOT EXISTS idx_detection_history_created_at ON detection_history(created_at DESC);
