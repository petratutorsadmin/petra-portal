-- 1. Create topic_categories
CREATE TABLE IF NOT EXISTS public.topic_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL, -- P2, P3, P4
  label TEXT NOT NULL
);

-- Seed topic categories
INSERT INTO public.topic_categories (code, label) VALUES
  ('P2', 'Basic School Support'),
  ('P3', 'Practical Language'),
  ('P4', 'Academic Language')
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label;

-- 2. Create topics
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category_code TEXT REFERENCES public.topic_categories(code),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed specific topics from the spec
INSERT INTO public.topics (name, category_code) VALUES
  ('Homework Help', 'P2'),
  ('Basic Grammar', 'P2'),
  ('Reading Practice', 'P2'),
  ('Vocabulary Building', 'P2'),
  ('School English Support', 'P2'),
  ('Conversation', 'P3'),
  ('Pronunciation', 'P3'),
  ('Listening Skills', 'P3'),
  ('Travel English', 'P3'),
  ('Cultural Discussion', 'P3'),
  ('Fluency Practice', 'P3'),
  ('Idioms & Expressions', 'P3'),
  ('Essay Writing', 'P4'),
  ('Academic Vocabulary', 'P4'),
  ('Presentation Skills', 'P4'),
  ('Research Skills', 'P4'),
  ('Critical Reading', 'P4'),
  ('Argument Writing', 'P4'),
  ('Academic Grammar', 'P4'),
  ('Summary Writing', 'P4')
ON CONFLICT (name) DO UPDATE SET category_code = EXCLUDED.category_code;

-- 3. Link quotes to topics
CREATE TABLE IF NOT EXISTS public.pricing_quote_topics (
  quote_id UUID REFERENCES public.pricing_quotes(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  PRIMARY KEY (quote_id, topic_id)
);

-- RLS for topics
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'topics' AND policyname = 'Anyone can view topics') THEN
    CREATE POLICY "Anyone can view topics" ON public.topics FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'topic_categories' AND policyname = 'Anyone can view topic categories') THEN
    CREATE POLICY "Anyone can view topic categories" ON public.topic_categories FOR SELECT USING (true);
  END IF;
END $$;
