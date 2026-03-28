-- ==============================================================================
-- 1. CLEANUP: Drop existing tables, types, and triggers (Idempotent Setup)
-- ==============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS tutorial_pages CASCADE;
DROP TABLE IF EXISTS tutorial_series CASCADE;
DROP TABLE IF EXISTS blogs CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS grants CASCADE;
DROP TABLE IF EXISTS project_items CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS research_publications CASCADE;
DROP TABLE IF EXISTS ongoing_research CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS honours_and_awards CASCADE;
DROP TABLE IF EXISTS career_responsibilities CASCADE;
DROP TABLE IF EXISTS career_experiences CASCADE;
DROP TABLE IF EXISTS academic_qualifications CASCADE;
DROP TABLE IF EXISTS research_interests CASCADE;
DROP TABLE IF EXISTS members CASCADE;

DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS interest_type CASCADE;
DROP TYPE IF EXISTS career_category CASCADE;

-- ==============================================================================
-- 2. ENUMS
-- ==============================================================================
CREATE TYPE content_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED');
CREATE TYPE interest_type AS ENUM ('THEORETICAL', 'APPLIED');
CREATE TYPE career_category AS ENUM ('ACADEMIC', 'INDUSTRY', 'VOLUNTEER');

-- ==============================================================================
-- 3. TABLES
-- ==============================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- Connects to Supabase Auth
    slug VARCHAR(255) UNIQUE NOT NULL, 
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    university VARCHAR(255),
    country VARCHAR(100),
    contact_email VARCHAR(255),
    linkedin_url TEXT,
    image_url TEXT, 
    summary TEXT,
    
    status content_status DEFAULT 'DRAFT',
    role VARCHAR(50) DEFAULT 'researcher', -- 'super_admin' or 'researcher'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE research_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    category interest_type NOT NULL, 
    interest_name VARCHAR(255) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE academic_qualifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    degree VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL, 
    details TEXT, 
    display_order INT DEFAULT 0
);

CREATE TABLE career_experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    category career_category NOT NULL, 
    role VARCHAR(255) NOT NULL,
    institution VARCHAR(255) NOT NULL,
    period VARCHAR(100) NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE career_responsibilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    career_experience_id UUID REFERENCES career_experiences(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE honours_and_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    organization_name TEXT NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE ongoing_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    research_title TEXT NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE research_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    venue VARCHAR(255),
    publication_year INT,
    doi VARCHAR(255),
    link TEXT,
    abstract TEXT,
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    category VARCHAR(255) NOT NULL, 
    icon_name VARCHAR(100), 
    description TEXT,
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0
);

CREATE TABLE grants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    agency VARCHAR(255) NOT NULL,
    award_year VARCHAR(4),
    description TEXT,
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    event_type VARCHAR(255), 
    event_date VARCHAR(255), 
    description TEXT,
    link TEXT,
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, 
    title TEXT NOT NULL,
    excerpt TEXT,
    author_name VARCHAR(255), 
    published_date DATE,
    image_url TEXT, 
    tags TEXT[], 
    content TEXT NOT NULL, 
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tutorial_series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    slug VARCHAR(255) UNIQUE NOT NULL, 
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status content_status DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tutorial_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    series_id UUID REFERENCES tutorial_series(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tutorial_pages(id) ON DELETE CASCADE, 
    slug VARCHAR(255) NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    content TEXT, 
    display_order INT DEFAULT 0, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(series_id, slug) 
);

-- ==============================================================================
-- 4. AUTH.USERS TRIGGER
-- ==============================================================================

-- Create the function with SECURITY DEFINER to bypass RLS during auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.members (
    auth_user_id, 
    contact_email,
    -- Safely generate a temporary slug to prevent NOT NULL constraint failures
    slug, 
    -- Fallback name if the user metadata doesn't have one
    name
  )
  VALUES (
    new.id, 
    new.email,
    'user-' || substr(new.id::text, 1, 8),
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Researcher')
  );
  RETURN new;
END;
$$;

-- Attach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_responsibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE honours_and_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ongoing_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_pages ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POLICIES: Members Table
-- ------------------------------------------------------------------------------
-- Public can view PUBLISHED members
CREATE POLICY "Public profiles are viewable by everyone" ON members
  FOR SELECT USING (status = 'PUBLISHED');

-- Users can view and update their OWN records (even drafts)
CREATE POLICY "Users can view own profile" ON members
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON members
  FOR UPDATE USING (auth_user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- POLICIES: Child Profile Tables (Qualifications, Careers, etc.)
-- ------------------------------------------------------------------------------
-- For simplicity, public can select all child rows. The frontend will only 
-- query them for PUBLISHED parent members anyway.
CREATE POLICY "Public can view child items" ON research_interests FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON academic_qualifications FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON career_experiences FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON career_responsibilities FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON honours_and_awards FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON memberships FOR SELECT USING (true);
CREATE POLICY "Public can view child items" ON ongoing_research FOR SELECT USING (true);

-- Users can insert/update/delete child items if they own the parent member record
-- (Applied as an example to one, you can duplicate the pattern for the others)
CREATE POLICY "Users can manage own academic qualifications" ON academic_qualifications
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own career experiences" ON career_experiences
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own research interests" ON research_interests
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- POLICIES: Content Tables (Blogs, Tutorials, Projects)
-- ------------------------------------------------------------------------------
-- Public can view only PUBLISHED content
CREATE POLICY "Public can view published blogs" ON blogs
  FOR SELECT USING (status = 'PUBLISHED');
  
CREATE POLICY "Public can view published tutorials" ON tutorial_series
  FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Public can view published projects" ON projects
  FOR SELECT USING (status = 'PUBLISHED');

-- Users can manage their own content
CREATE POLICY "Users can manage own blogs" ON blogs
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own tutorials" ON tutorial_series
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own projects" ON projects
  USING (member_id IN (SELECT id FROM members WHERE auth_user_id = auth.uid()));