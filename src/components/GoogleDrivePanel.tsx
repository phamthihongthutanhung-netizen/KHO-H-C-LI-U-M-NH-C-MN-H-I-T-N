import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  HardDrive,
  FolderOpen,
  LogOut,
  UploadCloud,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { User } from 'firebase/auth';

interface GoogleDrivePanelProps {
  user: User | null;
  accessToken: string | null;
  folderName: string;
  folderUrl?: string;
  isSyncing: boolean;
  syncProgress?: string;
  onSignIn: () => void;
  onSignOut: () => void;
  onSyncAllToDrive: () => void;
  onRefreshFromDrive: () => void;
}

export const GoogleDrivePanel: React.FC<GoogleDrivePanelProps> = ({
  user,
  accessToken,
  folderName,
  folderUrl,
  isSyncing,
  syncProgress,
  onSignIn,
  onSignOut,
  onSyncAllToDrive,
  onRefreshFromDrive,
}) => {
  const isConnected = !!user && !!accessToken;

  return (
    <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl border border-teal-700/50 relative overflow-hidden">
      {/* Decorative background note */}
      <div className="absolute -right-8 -bottom-8 opacity-10 text-white select-none pointer-events-none text-9xl font-bold font-serif">
        ♪
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Side: Status & Account */}
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-400 text-teal-950 shadow-sm">
              <HardDrive className="w-3.5 h-3.5" />
              Nơi lưu trữ chính: Google Drive
            </span>

            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Đã liên kết tài khoản
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Chưa kết nối Google Drive
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white font-['Quicksand'] mb-1">
            Đồng Bộ Đám Mây Google Drive
          </h3>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed mb-3">
            Toàn bộ giáo án, bài hát MP3, video múa, trò chơi và tranh ảnh được lưu trữ an toàn trong thư mục riêng{' '}
            <strong className="text-amber-300 underline underline-offset-2">"{folderName}"</strong> trên Google Drive của tài khoản trường.
          </p>

          {/* User badge */}
          {user && (
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur px-3 py-1.5 rounded-xl border border-white/15 text-xs text-emerald-50">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-5 h-5 rounded-full border border-white/40"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-teal-600 flex items-center justify-center font-bold text-[10px]">
                  G
                </div>
              )}
              <span className="font-medium truncate max-w-[220px]">
                {user.email || user.displayName}
              </span>
              <button
                onClick={onSignOut}
                className="text-amber-200 hover:text-white underline text-[11px] ml-1 cursor-pointer"
                title="Đăng xuất khỏi tài khoản này"
              >
                Đổi tài khoản
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
          {!isConnected ? (
            /* Official Google Sign-In Button */
            <button
              onClick={onSignIn}
              className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-lg shadow-black/20 hover:shadow-xl transition-all active:scale-95 cursor-pointer border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Kết nối Google Drive</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Sync All button */}
              <button
                onClick={onSyncAllToDrive}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-teal-950 bg-amber-300 hover:bg-amber-400 active:scale-95 shadow-md transition-all cursor-pointer disabled:opacity-50"
                title="Đồng bộ tất cả học liệu hiện tại lên Google Drive"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ lên Drive'}</span>
              </button>

              {/* Refresh from Drive */}
              <button
                onClick={onRefreshFromDrive}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer disabled:opacity-50"
                title="Tải lại danh sách học liệu từ Google Drive"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>

              {/* Open Folder in Google Drive */}
              {folderUrl && (
                <a
                  href={folderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-teal-800/80 hover:bg-teal-700/80 border border-teal-500/40 transition-all"
                  title="Mở thư mục Google Drive trong tab mới"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>Mở thư mục Drive</span>
                  <ExternalLink className="w-3 h-3 text-emerald-200" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sync Status banner */}
      {syncProgress && (
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 text-xs text-amber-200 font-medium">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
          <span>{syncProgress}</span>
        </div>
      )}
    </div>
  );
};
