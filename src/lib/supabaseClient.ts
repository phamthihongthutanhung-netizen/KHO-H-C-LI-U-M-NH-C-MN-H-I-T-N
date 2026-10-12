import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MusicMaterial, SupabaseConfig } from '../types/material';

const STORAGE_CONFIG_KEY = 'mn_haitan_supabase_config';
export const DEFAULT_BUCKET_NAME = 'music_files';
export const DEFAULT_TABLE_NAME = 'music_materials';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.supabaseUrl && parsed.supabaseAnonKey) {
        return {
          supabaseUrl: parsed.supabaseUrl.trim(),
          supabaseAnonKey: parsed.supabaseAnonKey.trim(),
          bucketName: parsed.bucketName?.trim() || DEFAULT_BUCKET_NAME,
          tableName: DEFAULT_TABLE_NAME,
          isConnected: true,
        };
      }
    }
  } catch (e) {
    console.error('Error reading stored Supabase config:', e);
  }

  // Check Vite env
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return {
      supabaseUrl: envUrl.trim(),
      supabaseAnonKey: envKey.trim(),
      bucketName: (import.meta as any).env?.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET_NAME,
      tableName: DEFAULT_TABLE_NAME,
      isConnected: true,
    };
  }

  return {
    supabaseUrl: '',
    supabaseAnonKey: '',
    bucketName: DEFAULT_BUCKET_NAME,
    tableName: DEFAULT_TABLE_NAME,
    isConnected: false,
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigUrl = '';
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  if (
    cachedClient &&
    cachedConfigUrl === config.supabaseUrl &&
    cachedConfigKey === config.supabaseAnonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
    cachedConfigUrl = config.supabaseUrl;
    cachedConfigKey = config.supabaseAnonKey;
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export function saveStoredSupabaseConfig(config: {
  supabaseUrl: string;
  supabaseAnonKey: string;
  bucketName?: string;
}) {
  localStorage.setItem(
    STORAGE_CONFIG_KEY,
    JSON.stringify({
      supabaseUrl: config.supabaseUrl.trim(),
      supabaseAnonKey: config.supabaseAnonKey.trim(),
      bucketName: (config.bucketName || DEFAULT_BUCKET_NAME).trim(),
    })
  );
  cachedClient = null;
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(STORAGE_CONFIG_KEY);
  cachedClient = null;
}

// SQL Script generator for teachers to run in Supabase SQL Editor
export function getSupabaseInitSQL(): string {
  return `-- ============================================================
-- SCRIPT KHỞI TẠO SUPABASE - TRƯỜNG MẦM NON HẢI TÂN
-- Chạy script này trong tab "SQL Editor" của dự án Supabase của bạn
-- ============================================================

-- 1. Bảng lưu trữ học liệu âm nhạc
CREATE TABLE IF NOT EXISTS public.music_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    age_group TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT DEFAULT '',
    lyrics TEXT,
    game_rules TEXT,
    instrument_guide TEXT,
    author TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type TEXT DEFAULT '',
    thumbnail_url TEXT,
    external_link TEXT,
    storage_source TEXT DEFAULT 'supabase',
    downloads_count INT DEFAULT 0,
    views_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chỉ mục tìm kiếm
CREATE INDEX IF NOT EXISTS idx_materials_category ON public.music_materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_age_group ON public.music_materials(age_group);
CREATE INDEX IF NOT EXISTS idx_materials_theme ON public.music_materials(theme);

-- 3. Bật RLS và cho phép mọi giáo viên đọc/ghi công khai (không cần đăng nhập)
ALTER TABLE public.music_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public select materials" ON public.music_materials;
CREATE POLICY "Public select materials" ON public.music_materials
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public insert materials" ON public.music_materials;
CREATE POLICY "Public insert materials" ON public.music_materials
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public update materials" ON public.music_materials;
CREATE POLICY "Public update materials" ON public.music_materials
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public delete materials" ON public.music_materials;
CREATE POLICY "Public delete materials" ON public.music_materials
    FOR DELETE USING (true);

-- 4. Tạo Storage Bucket lưu tệp công khai 'music_files'
INSERT INTO storage.buckets (id, name, public)
VALUES ('music_files', 'music_files', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép upload/download công khai trong bucket music_files
DROP POLICY IF EXISTS "Public select music_files" ON storage.objects;
CREATE POLICY "Public select music_files" ON storage.objects
    FOR SELECT USING (bucket_id = 'music_files');

DROP POLICY IF EXISTS "Public insert music_files" ON storage.objects;
CREATE POLICY "Public insert music_files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'music_files');

DROP POLICY IF EXISTS "Public update music_files" ON storage.objects;
CREATE POLICY "Public update music_files" ON storage.objects
    FOR UPDATE USING (bucket_id = 'music_files');

DROP POLICY IF EXISTS "Public delete music_files" ON storage.objects;
CREATE POLICY "Public delete music_files" ON storage.objects
    FOR DELETE USING (bucket_id = 'music_files');
`;
}
