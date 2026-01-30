/*
  # Create Model Parameters Table

  1. New Tables
    - `model_parameters`
      - `id` (uuid, primary key)
      - `model_version` (text, identifies which model version)
      - `entropy_weight` (numeric)
      - `zero_crossing_rate_weight` (numeric)
      - `spectral_centroid_weight` (numeric)
      - `spectral_rolloff_weight` (numeric)
      - `duration_weight` (numeric)
      - `mfcc_weights` (jsonb array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_active` (boolean)

  2. Purpose
    - Store dynamically adjustable model weights for AI voice detection
    - Support multiple model versions for A/B testing
    - Track parameter evolution over time

  3. Notes
    - Stores model parameters that can be updated without code deployment
    - Allows the system to evolve and improve without hard-coded values
    - is_active flag allows switching between different model versions
*/

CREATE TABLE IF NOT EXISTS model_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  model_version text NOT NULL UNIQUE,
  entropy_weight numeric DEFAULT 0.25,
  zero_crossing_rate_weight numeric DEFAULT 0.20,
  spectral_centroid_weight numeric DEFAULT 0.15,
  spectral_rolloff_weight numeric DEFAULT 0.15,
  duration_weight numeric DEFAULT 0.10,
  mfcc_weights jsonb DEFAULT '[0.05, 0.05, 0.05]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT false
);

INSERT INTO model_parameters (
  model_version, 
  entropy_weight, 
  zero_crossing_rate_weight, 
  spectral_centroid_weight, 
  spectral_rolloff_weight, 
  duration_weight, 
  mfcc_weights,
  is_active
) VALUES (
  'v1.0',
  0.25,
  0.20,
  0.15,
  0.15,
  0.10,
  '[0.05, 0.05, 0.05]'::jsonb,
  true
) ON CONFLICT (model_version) DO NOTHING;
