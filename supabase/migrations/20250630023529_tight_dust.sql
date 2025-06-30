/*
  # Initial Database Schema for CommUnity

  1. New Tables
    - `users` - User profiles and settings
    - `conversations` - Chat conversations (direct, group, emergency)
    - `conversation_participants` - Many-to-many relationship for conversation members
    - `messages` - Chat messages with multi-format support
    - `learning_categories` - Learning content categories
    - `learning_lessons` - Individual lessons and tutorials
    - `user_lesson_progress` - User progress tracking
    - `sign_recognition_sessions` - Sign language recognition sessions
    - `sign_recognition_results` - Individual recognition results

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure user data access

  3. Indexes
    - Performance optimization for common queries
    - Full-text search capabilities
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile_picture_url TEXT,
    accessibility_settings JSONB DEFAULT '{}',
    emergency_contacts JSONB DEFAULT '[]',
    preferred_language VARCHAR(10) DEFAULT 'en',
    sign_language_preference VARCHAR(10) DEFAULT 'asl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group', 'emergency')),
    name VARCHAR(255),
    description TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    settings JSONB DEFAULT '{}'
);

-- Conversation participants table
CREATE TABLE IF NOT EXISTS conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'sign', 'image', 'video', 'file')),
    original_language VARCHAR(10),
    translations JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    is_edited BOOLEAN DEFAULT false
);

-- Learning categories table
CREATE TABLE IF NOT EXISTS learning_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning lessons table
CREATE TABLE IF NOT EXISTS learning_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES learning_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content JSONB NOT NULL,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_duration INTEGER, -- in minutes
    video_url TEXT,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User lesson progress table
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent INTEGER DEFAULT 0, -- in seconds
    attempts INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Sign recognition sessions table
CREATE TABLE IF NOT EXISTS sign_recognition_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_gestures INTEGER DEFAULT 0,
    accuracy_score DECIMAL(5,2),
    session_metadata JSONB DEFAULT '{}'
);

-- Sign recognition results table
CREATE TABLE IF NOT EXISTS sign_recognition_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sign_recognition_sessions(id) ON DELETE CASCADE,
    gesture_detected VARCHAR(100),
    confidence_score DECIMAL(5,4),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    bounding_box JSONB,
    processing_time_ms INTEGER
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user_id ON user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson_id ON user_lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_sign_recognition_results_session_id ON sign_recognition_results(session_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_recognition_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sign_recognition_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE TO authenticated
    USING (auth.uid() = id);

-- RLS Policies for conversations table
CREATE POLICY "Users can read conversations they participate in" ON conversations
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT TO authenticated
    WITH CHECK (created_by = auth.uid());

-- RLS Policies for conversation_participants table
CREATE POLICY "Users can read conversation participants" ON conversation_participants
    FOR SELECT TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for messages table
CREATE POLICY "Users can read messages from their conversations" ON messages
    FOR SELECT TO authenticated
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON messages
    FOR INSERT TO authenticated
    WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT conversation_id FROM conversation_participants 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE TO authenticated
    USING (sender_id = auth.uid());

-- RLS Policies for learning content (public read access)
CREATE POLICY "Anyone can read learning categories" ON learning_categories
    FOR SELECT TO authenticated
    USING (is_active = true);

CREATE POLICY "Anyone can read published lessons" ON learning_lessons
    FOR SELECT TO authenticated
    USING (is_published = true);

-- RLS Policies for user progress
CREATE POLICY "Users can read own progress" ON user_lesson_progress
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON user_lesson_progress
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can modify own progress" ON user_lesson_progress
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid());

-- RLS Policies for sign recognition
CREATE POLICY "Users can read own recognition sessions" ON sign_recognition_sessions
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create recognition sessions" ON sign_recognition_sessions
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own recognition results" ON sign_recognition_results
    FOR SELECT TO authenticated
    USING (
        session_id IN (
            SELECT id FROM sign_recognition_sessions 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create recognition results" ON sign_recognition_results
    FOR INSERT TO authenticated
    WITH CHECK (
        session_id IN (
            SELECT id FROM sign_recognition_sessions 
            WHERE user_id = auth.uid()
        )
    );

-- Insert sample learning categories
INSERT INTO learning_categories (name, description, icon, sort_order) VALUES
    ('Basics', 'Fundamental sign language concepts', 'hand', 1),
    ('Alphabet', 'Sign language alphabet and fingerspelling', 'abc', 2),
    ('Numbers', 'Counting and numerical signs', '123', 3),
    ('Common Phrases', 'Everyday communication phrases', 'message', 4),
    ('Emotions', 'Expressing feelings and emotions', 'heart', 5),
    ('Family', 'Family members and relationships', 'users', 6)
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO learning_lessons (category_id, title, description, content, difficulty_level, estimated_duration, is_published, sort_order) VALUES
    (
        (SELECT id FROM learning_categories WHERE name = 'Basics' LIMIT 1),
        'Hello & Goodbye',
        'Learn basic greetings in sign language',
        '{"steps": [{"title": "Hello", "description": "Wave your hand with palm facing forward"}, {"title": "Goodbye", "description": "Wave your hand side to side"}]}',
        'beginner',
        5,
        true,
        1
    ),
    (
        (SELECT id FROM learning_categories WHERE name = 'Basics' LIMIT 1),
        'Please & Thank You',
        'Essential polite expressions',
        '{"steps": [{"title": "Please", "description": "Place flat hand on chest and move in circular motion"}, {"title": "Thank You", "description": "Touch fingers to chin and move hand forward"}]}',
        'beginner',
        7,
        true,
        2
    )
ON CONFLICT DO NOTHING;