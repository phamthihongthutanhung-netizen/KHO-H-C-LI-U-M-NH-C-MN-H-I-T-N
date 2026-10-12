import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Gamepad2,
  Drum,
  Check,
  AlertCircle,
  Loader2,
  Cloud,
  HardDrive,
  Server,
} from 'lucide-react';
import {
  MaterialCategory,
  AgeGroup,
  MusicMaterial,
  CATEGORY_LABELS,
  AGE_GROUP_LABELS,
  COMMON_THEMES,
} from '../types/material';
import { uploadMaterialFile, saveMaterial } from '../lib/materialsApi';
import { getStoredSupabaseConfig } from '../lib/supabaseClient';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMaterial: MusicMaterial) => void;
  driveAccessToken?: string | null;
  driveFolderId?: string | null;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  driveAccessToken,
  driveFolderId,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaterialCategory>('giao_an');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('tat_ca');
  const [theme, setTheme] = useState('Trường mầm non');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [gameRules, setGameRules] = useState('');
  const [instrumentGuide, setInstrumentGuide] = useState('');
  const [externalLink, setExternalLink] = useState('');

  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const supabaseConfig = getStoredSupabaseConfig();

  if (!isOpen) return null;

  // Auto detect category from file type/extension
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage('');

    // Auto set title if empty
    if (!title) {
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanName = nameWithoutExt.replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Auto detect category
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (file.type.includes('audio') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext || '')) {
      setCategory('am_thanh');
    } else if (file.type.includes('video') || ['mp4', 'mov', 'webm', 'avi'].includes(ext || '')) {
      setCategory('video');
    } else if (file.type.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext || '')) {
      setCategory('hinh_anh');
    } else if (['pdf', 'docx', 'doc', 'pptx', 'ppt'].includes(ext || '')) {
      setCategory('giao_an');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tên học liệu');
      return;
    }

    if (!selectedFile && !externalLink.trim()) {
      setErrorMessage('Vui lòng chọn một tệp để tải lên hoặc nhập liên kết xem ngoài');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      let fileUrl = '';
      let fileName = '';
      let fileSize = 0;
      let fileType = '';
      let storageSource: 'drive' | 'supabase' | 'server' | 'external' = 'server';
      let driveFileId: string | undefined = undefined;

      if (selectedFile) {
        if (driveAccessToken && driveFolderId) {
          setUploadProgressText('Đang tải tệp trực tiếp lên Google Drive của trường...');
          const uploadResult = await uploadMaterialFile(selectedFile, {
            accessToken: driveAccessToken,
            folderId: driveFolderId,
          });
          fileUrl = uploadResult.fileUrl;
          fileName = uploadResult.fileName;
          fileSize = uploadResult.fileSize;
          fileType = uploadResult.fileType;
          storageSource = uploadResult.storageSource;
          driveFileId = uploadResult.driveFileId;
        } else {
          setUploadProgressText(
            supabaseConfig.isConnected
              ? 'Đang tải tệp lên Supabase Storage trực tuyến...'
              : 'Đang tải tệp lên máy chủ Trường MN Hải Tân...'
          );

          const uploadResult = await uploadMaterialFile(selectedFile);
          fileUrl = uploadResult.fileUrl;
          fileName = uploadResult.fileName;
          fileSize = uploadResult.fileSize;
          fileType = uploadResult.fileType;
          storageSource = uploadResult.storageSource;
        }
      } else {
        fileUrl = externalLink.trim();
        fileName = title.trim();
        fileSize = 0;
        fileType = 'text/html';
        storageSource = 'external';
      }

      setUploadProgressText('Đang lưu thông tin học liệu...');

      const newMaterial: MusicMaterial = {
        id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        category,
        ageGroup,
        theme,
        description: description.trim(),
        lyrics: category === 'am_thanh' ? lyrics.trim() : undefined,
        gameRules: category === 'tro_choi' ? gameRules.trim() : undefined,
        instrumentGuide: category === 'nhac_cu' ? instrumentGuide.trim() : undefined,
        author: author.trim() || 'Giáo viên Trường MN Hải Tân',
        fileUrl,
        fileName,
        fileSize,
        fileType,
        externalLink: externalLink.trim() || undefined,
        storageSource,
        driveFileId,
        downloadsCount: 0,
        viewsCount: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const saved = await saveMaterial(newMaterial);
      setIsUploading(false);
      onSuccess(saved);
      onClose();
    } catch (err: any) {
      console.error('Upload error:', err);
      setIsUploading(false);
      setErrorMessage(err.message || 'Có lỗi xảy ra khi tải lên học liệu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Tải lên Học Liệu Âm Nhạc Mới
              </h3>
              <p className="text-xs text-emerald-100">
                Chia sẻ cùng đồng nghiệp Trường Mầm non Hải Tân
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Storage Destination Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              {driveAccessToken && driveFolderId ? (
                <>
                  <HardDrive className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-800">
                    Lưu trữ chính: Google Drive (Đám mây trường MN Hải Tân)
                  </span>
                </>
              ) : supabaseConfig.isConnected ? (
                <>
                  <Cloud className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">
                    Lưu trữ trực tuyến: Supabase Database & Storage
                  </span>
                </>
              ) : (
                <>
                  <Server className="w-4 h-4 text-teal-600" />
                  <span className="font-semibold text-slate-800">
                    Lưu trữ trực tiếp: Máy chủ Trường MN Hải Tân (Dùng chung)
                  </span>
                </>
              )}
            </div>
            <span className="text-[11px] text-teal-800 font-bold">
              {driveAccessToken ? 'Google Drive chính' : 'Tự động đồng bộ'}
            </span>
          </div>

          {/* File Picker Drag & Drop */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Chọn tệp học liệu (Âm thanh, Video, Giáo án, Tranh ảnh, Nhạc cụ)
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-emerald-400 bg-emerald-50/50'
                  : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="audio/*,video/*,image/*,.pdf,.docx,.doc,.pptx,.ppt"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3 text-emerald-800">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm truncate max-w-sm">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Nhấn để đổi tệp khác
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-slate-500">
                  <Upload className="w-7 h-7 text-teal-600" />
                  <p className="font-semibold text-slate-700">
                    Kéo thả tệp vào đây hoặc <span className="text-teal-700 underline">bấm để chọn</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hỗ trợ MP3, WAV, MP4, PDF, Word, PowerPoint, PNG, JPG (tối đa 150MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Tiêu đề học liệu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="VD: Giáo án: Dạy hát Cháu yêu bà (3-4 tuổi), Beat Trường chúng cháu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Category & Age Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Danh mục học liệu</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaterialCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Lứa tuổi áp dụng</label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                {Object.entries(AGE_GROUP_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chủ đề giáo dục</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                {COMMON_THEMES.filter((t) => t !== 'Tất cả chủ đề').map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Giáo viên biên soạn / Tác giả
              </label>
              <input
                type="text"
                placeholder="VD: Cô Nguyễn Thị Lan - Khối Mẫu giáo Bé"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Mô tả tóm tắt & Mục tiêu sư phạm
            </label>
            <textarea
              rows={2}
              placeholder="Ghi chú về tiết dạy, phương pháp, kỹ năng rèn luyện cho trẻ..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Category specific fields */}
          {category === 'am_thanh' && (
            <div>
              <label className="block font-bold text-teal-800 mb-1">
                Lời bài hát (để cô và trò cùng xem khi hát)
              </label>
              <textarea
                rows={3}
                placeholder="Nhập ca từ của bài hát..."
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-teal-200 bg-teal-50/20 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          )}

          {category === 'tro_choi' && (
            <div>
              <label className="block font-bold text-sky-800 mb-1">
                Hướng dẫn luật chơi & Cách tổ chức cho lớp
              </label>
              <textarea
                rows={3}
                placeholder="1. Mục đích - 2. Chuẩn bị - 3. Cách chơi & luật chơi..."
                value={gameRules}
                onChange={(e) => setGameRules(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-sky-200 bg-sky-50/20 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          )}

          {category === 'nhac_cu' && (
            <div>
              <label className="block font-bold text-amber-800 mb-1">
                Kỹ thuật gõ & Cách hướng dẫn trẻ sử dụng nhạc cụ
              </label>
              <textarea
                rows={3}
                placeholder="Hướng dẫn cầm phách/xắc xô, cách gõ theo tiết tấu chậm/nhanh..."
                value={instrumentGuide}
                onChange={(e) => setInstrumentGuide(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-amber-50/20 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800"
              />
            </div>
          )}

          {/* External link fallback */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Liên kết ngoài (Tùy chọn: YouTube, Google Drive, Canva)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{uploadProgressText || 'Đang xử lý tải lên...'}</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Hoàn tất & Tải lên</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
