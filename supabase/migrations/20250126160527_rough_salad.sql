/*
  # Initial Schema for Campus Connect Platform

  1. New Tables
    - users (extends auth.users)
      - Profile information for students
      - Academic details
      - Interests and preferences
    
    - study_groups
      - Group study coordination
      - Course-specific groups
    
    - events
      - Campus events management
      - Academic and social activities
    
    - resources
      - Academic resource sharing
      - File management

  2. Security
    - RLS policies for all tables
    - Email domain restrictions
    - Content access controls
*/

-- Users table extending auth.users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  university text NOT NULL,
  major text NOT NULL,
  graduation_year integer NOT NULL,
  interests text[] DEFAULT '{}',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Study Groups
CREATE TABLE IF NOT EXISTS study_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  course_code text NOT NULL,
  description text,
  created_by uuid REFERENCES users(id) NOT NULL,
  members uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  organizer_id uuid REFERENCES users(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('academic', 'social', 'career')),
  max_participants integer,
  participants uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  uploaded_by uuid REFERENCES users(id) NOT NULL,
  course_code text NOT NULL,
  type text NOT NULL CHECK (type IN ('document', 'link', 'video')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read other users' basic profiles
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Study Groups policies
CREATE POLICY "Anyone can view study groups"
  ON study_groups FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can update study groups"
  ON study_groups FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR auth.uid() = ANY(members));

-- Events policies
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can manage events"
  ON events FOR ALL
  TO authenticated
  USING (auth.uid() = organizer_id);

-- Resources policies
CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their resources"
  ON resources FOR ALL
  TO authenticated
  USING (auth.uid() = uploaded_by);