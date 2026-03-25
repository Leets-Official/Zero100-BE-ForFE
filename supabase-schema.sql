-- Supabase SQL Editor에서 실행하세요

-- users 테이블
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  kakao_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- inquiries 테이블
CREATE TABLE inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- inquiries 조회 성능을 위한 인덱스
CREATE INDEX idx_inquiries_user_id ON inquiries(user_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- RLS 비활성화 (service role key 사용하므로)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- service role은 RLS 무시하므로 별도 policy 불필요
