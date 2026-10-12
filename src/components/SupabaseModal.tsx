import React, { useState } from 'react';
import {
  X,
  Database,
  Cloud,
  Check,
  Copy,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveStoredSupabaseConfig,
  clearStoredSupabaseConfig,
  getSupabaseInitSQL,
  DEFAULT_BUCKET_NAME,
} from '../lib/supabaseClient';
import {
  testSupabaseConnection,
  syncAllToSupabase,
} from '../lib/materialsApi';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.supabaseUrl);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.supabaseAnonKey);
  const [bucketName, setBucketName] = useState(currentConfig.bucketName || DEFAULT_BUCKET_NAME);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    tableReady: boolean;
    bucketReady: boolean;
  } | null>(null);

  const [copiedSQL, setCopiedSQL] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({
        success: false,
        message: 'Vui lòng nhập cả Supabase URL và Anon Key để kiểm tra',
        tableReady: false,
        bucketReady: false,
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey, bucketName);
    setIsTesting(false);
    setTestResult(result);
  };

  const handleSave = () => {
    if (supabaseUrl.trim() && supabaseAnonKey.trim()) {
      saveStoredSupabaseConfig({
        supabaseUrl,
        supabaseAnonKey,
        bucketName,
      });
    } else {
      clearStoredSupabaseConfig();
    }
    onConfigUpdated();
    onClose();
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    onConfigUpdated();
  };

  const handleCopySQL = () => {
    const sql = getSupabaseInitSQL();
    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await syncAllToSupabase();
      if (res.error) {
        setSyncStatus(`Lỗi: ${res.error}`);
      } else {
        setSyncStatus(`Đã đồng bộ thành công ${res.count} học liệu lên Supabase!`);
      }
    } catch (err: any) {
      setSyncStatus(`Lỗi: ${err.message || 'Không thể đồng bộ'}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-emerald-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Cài đặt Supabase Database & Storage
              </h3>
              <p className="text-xs text-emerald-200">
                Kho học liệu trực tuyến Trường Mầm non Hải Tân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Explanation Box */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-slate-700 leading-relaxed">
            <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Lưu trữ vĩnh viễn trên Supabase Cloud
            </h4>
            <p className="text-xs text-slate-600 mb-2">
              Website đã được thiết kế sẵn sàng cho Supabase. Khi cấu hình xong, thông tin học liệu
              được lưu tại bảng <code className="font-mono text-teal-800 font-bold bg-white px-1 py-0.5 rounded border border-amber-200">music_materials</code>{' '}
              và tệp âm thanh, giáo án, video được tải trực tiếp lên Supabase Storage bucket{' '}
              <code className="font-mono text-teal-800 font-bold bg-white px-1 py-0.5 rounded border border-amber-200">music_files</code>.
            </p>
            <p className="text-xs text-slate-500 italic">
              * Nếu chưa cấu hình Supabase, hệ thống tự động lưu trên máy chủ của trường để đảm bảo giáo viên luôn sử dụng bình thường không bị gián đoạn.
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-xs text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-xs text-slate-800 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tên Storage Bucket (Mặc định: music_files)
              </label>
              <input
                type="text"
                placeholder="music_files"
                value={bucketName}
                onChange={(e) => setBucketName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Actions: Test connection */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-teal-900 bg-teal-100 hover:bg-teal-200 border border-teal-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối Supabase'}</span>
            </button>

            {currentConfig.isConnected && (
              <button
                onClick={handleSyncToSupabase}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ học liệu lên Supabase'}</span>
              </button>
            )}

            {currentConfig.isConnected && (
              <button
                onClick={handleClear}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                Hủy kết nối
              </button>
            )}
          </div>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">{testResult.message}</p>
                {testResult.tableReady && (
                  <p className="text-emerald-700 mt-1">✓ Bảng music_materials đã có thể đọc và ghi.</p>
                )}
                {testResult.bucketReady && (
                  <p className="text-emerald-700">✓ Storage bucket '{bucketName}' đã sẵn sàng lưu tệp.</p>
                )}
              </div>
            </div>
          )}

          {syncStatus && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
              {syncStatus}
            </div>
          )}

          {/* 1-Click SQL Setup Script */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm">
                  Mã SQL khởi tạo Supabase (Chạy trong 10 giây)
                </h5>
                <p className="text-[11px] text-slate-500">
                  Tự động tạo bảng <code className="font-mono">music_materials</code>, thiết lập quyền truy cập công khai và tạo bucket <code className="font-mono">music_files</code>.
                </p>
              </div>
              <button
                onClick={handleCopySQL}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  copiedSQL
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-100 text-teal-800 border border-teal-300'
                }`}
              >
                {copiedSQL ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép mã SQL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900"
          >
            <span>Mở Bảng điều khiển Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md cursor-pointer"
            >
              Lưu cấu hình
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
