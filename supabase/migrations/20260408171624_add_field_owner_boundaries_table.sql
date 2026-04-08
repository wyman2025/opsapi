/*
  # Add field_owner_boundaries table

  ## Purpose
  Supports the new financial analysis workflow where a single physical field
  can have multiple owners, each assigned to a specific boundary (active or inactive).
  This allows production and application data to be attributed correctly per owner.

  ## New Tables
  - `field_owner_boundaries`
    - `id` (uuid, primary key)
    - `user_id` (uuid, FK → auth.users, cascade delete)
    - `field_id` (uuid, FK → fields, cascade delete)
    - `jd_field_id` (text) — John Deere field ID for easy lookup
    - `jd_boundary_id` (text) — John Deere boundary ID being assigned
    - `owner_id` (text) — identifier for the owner (could be client_id or custom)
    - `owner_name` (text, nullable) — display name of the owner
    - `boundary_geojson` (jsonb, nullable) — GeoJSON of the assigned boundary
    - `area_value` (double precision, nullable)
    - `area_unit` (text, nullable)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - UNIQUE(field_id, owner_id) — one boundary per owner per field

  ## Security
  - RLS enabled; authenticated users can only access their own records
*/

CREATE TABLE IF NOT EXISTS field_owner_boundaries (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id          uuid NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  jd_field_id       text NOT NULL,
  jd_boundary_id    text NOT NULL,
  owner_id          text NOT NULL,
  owner_name        text,
  boundary_geojson  jsonb,
  area_value        double precision,
  area_unit         text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE(field_id, owner_id)
);

ALTER TABLE field_owner_boundaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own owner boundaries"
  ON field_owner_boundaries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own owner boundaries"
  ON field_owner_boundaries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own owner boundaries"
  ON field_owner_boundaries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own owner boundaries"
  ON field_owner_boundaries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS field_owner_boundaries_user_id_idx ON field_owner_boundaries(user_id);
CREATE INDEX IF NOT EXISTS field_owner_boundaries_field_id_idx ON field_owner_boundaries(field_id);
CREATE INDEX IF NOT EXISTS field_owner_boundaries_jd_field_id_idx ON field_owner_boundaries(jd_field_id);
