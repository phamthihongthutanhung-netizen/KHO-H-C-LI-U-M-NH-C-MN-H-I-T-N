import React from 'react';
import {
  Music,
  Cloud,
  Server,
  Upload,
  Database,
  BookOpen,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { SupabaseConfig } from '../types/material';

interface HeaderProps {
  totalCount: number;
  supabaseConfig: SupabaseConfig;
  user: User | null;
  accessToken: string | null;
  onOpenUpload: () => void;
  onOpenSupabase: () => void;
  onOpenGuide: () => void;
  onSignInGoogle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  supabaseConfig,
  user,
  accessToken,
  onOpenUpload,
  onOpenSupabase,
  onOpenGuide,
  onSignInGoogle,
}) => {
  const isDriveConnected = !!user && !!accessToken;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-amber-100 shadow-xs">
      {/* Top Banner Ribbon */}
      <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-amber-50 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium tracking-wide">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span>PHÒNG GIÁO DỤC VÀ ĐÀO TẠO · TRƯỜNG MẦM NON HẢI TÂN</span>
          </div>
          <div className="flex items-center gap-4 text-emerald-100 text-[11px]">
            <span>Năm học 2025 - 2026</span>
            <span aria-hidden="true">·</span>
            <span>Kho học liệu dùng chung mở trực tuyến</span>
            <span aria-hidden="true">·</span>
            <span className="text-amber-200 font-semibold">{totalCount} tư liệu âm nhạc</span>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-700/10">
            <Music className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-teal-900">
              ♪
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 font-['Quicksand']">
                KHO DỮ LIỆU ÂM NHẠC MẦM NON
              </h1>
            </div>
            <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              TRƯỜNG MẦM NON HẢI TÂN · HẢI PHÒNG
            </p>
          </div>
        </div>

        {/* Actions & Status */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Google Drive Primary Storage Indicator / Connect Button */}
          {isDriveConnected ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-teal-950 border border-amber-300 shadow-2xs"
              title={`Đang lưu trữ chính trên Google Drive của ${user.email}`}
            >
              <HardDrive className="w-3.5 h-3.5 text-teal-800" />
              <span>Google Drive chính</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          ) : (
            <button
              onClick={onSignInGoogle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 shadow-2xs transition-colors cursor-pointer"
              title="Nhấn để kết nối Google Drive làm nơi lưu trữ chính"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Kết nối Google Drive</span>
            </button>
          )}

          {/* Storage indicator for Supabase / Server */}
          <button
            onClick={onOpenSupabase}
            title="Nhấn để cấu hình hoặc kiểm tra kết nối Supabase"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100'
            }`}
          >
            {supabaseConfig.isConnected ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                <span>Supabase</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <>
                <Server className="w-3.5 h-3.5 text-teal-600" />
                <span>Máy chủ trường</span>
              </>
            )}
          </button>

          {/* Quick guide button */}
          <button
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-amber-50 border border-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Cẩm nang</span> Âm nhạc
          </button>

          {/* Primary Upload CTA */}
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-sm shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Tải lên học liệu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
