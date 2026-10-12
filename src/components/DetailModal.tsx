import React from 'react';
import {
  X,
  Download,
  Eye,
  FileText,
  Music,
  Video,
  Image as ImageIcon,
  Gamepad2,
  Drum,
  User,
  Calendar,
  Layers,
  HardDrive,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  MusicMaterial,
  CATEGORY_LABELS,
  AGE_GROUP_LABELS,
} from '../types/material';

interface DetailModalProps {
  material: MusicMaterial | null;
  onClose: () => void;
  onDownload: (material: MusicMaterial) => void;
  onPlayAudio?: (material: MusicMaterial) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  material,
  onClose,
  onDownload,
  onPlayAudio,
}) => {
  if (!material) return null;

  const catConfig = CATEGORY_LABELS[material.category] || {
    label: 'Học liệu',
    iconName: 'FileText',
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return 'Không rõ';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isAudio = material.category === 'am_thanh' || material.fileType.includes('audio') || material.fileName.endsWith('.mp3');
  const isVideo = material.category === 'video' || material.fileType.includes('video') || material.fileName.endsWith('.mp4');
  const isImage = material.category === 'hinh_anh' || material.fileType.includes('image') || material.fileName.match(/\.(png|jpg|jpeg|webp)$/i);
  const isPDF = material.fileName.endsWith('.pdf') || material.fileType.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 text-white p-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200 uppercase tracking-wider mb-1">
              <span>{catConfig.label}</span>
              <span aria-hidden="true">·</span>
              <span>{AGE_GROUP_LABELS[material.ageGroup]}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white leading-snug">
              {material.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Media Player Area */}
          {isVideo ? (
            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center shadow-inner">
              <video
                src={material.fileUrl}
                controls
                className="w-full h-full object-contain"
              >
                Trình duyệt của bạn không hỗ trợ phát video HTML5.
              </video>
            </div>
          ) : isAudio ? (
            <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                  Trình phát âm thanh trực tuyến
                </span>
                <span className="text-xs text-teal-700 font-medium">MN Hải Tân</span>
              </div>
              <audio src={material.fileUrl} controls className="w-full" />
            </div>
          ) : isImage ? (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-96 flex items-center justify-center border border-slate-200">
              <img
                src={material.fileUrl}
                alt={material.title}
                className="w-full h-full object-contain max-h-96"
              />
            </div>
          ) : isPDF ? (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{material.fileName}</h4>
                  <p className="text-xs text-slate-500">Tài liệu giáo án / văn bản PDF mầm non</p>
                </div>
              </div>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-800 bg-white border border-teal-200 hover:bg-teal-50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Mở xem PDF</span>
              </a>
            </div>
          ) : null}

          {/* Description Section */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Giới thiệu & Mục tiêu sư phạm
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {material.description || 'Chưa có thông tin giới thiệu bổ sung cho học liệu này.'}
            </p>
          </div>

          {/* Lyrics (if Song) */}
          {material.lyrics && (
            <div>
              <h4 className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-teal-600" />
                <span>Lời bài hát & Ca từ</span>
              </h4>
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed italic font-serif">
                {material.lyrics}
              </div>
            </div>
          )}

          {/* Game Rules (if Musical Game) */}
          {material.gameRules && (
            <div>
              <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Gamepad2 className="w-4 h-4 text-sky-600" />
                <span>Hướng dẫn luật chơi & Cách tổ chức</span>
              </h4>
              <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {material.gameRules}
              </div>
            </div>
          )}

          {/* Instrument Guide (if Instrument) */}
          {material.instrumentGuide && (
            <div>
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Drum className="w-4 h-4 text-amber-600" />
                <span>Hướng dẫn kỹ thuật gõ & Sử dụng nhạc cụ</span>
              </h4>
              <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {material.instrumentGuide}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Giáo viên / Nguồn:</span>
              <strong className="text-slate-800 font-semibold truncate block">{material.author}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Chủ đề giáo dục:</span>
              <strong className="text-slate-800 font-semibold truncate block">{material.theme}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Dung lượng tệp:</span>
              <strong className="text-slate-800 font-semibold block">{formatFileSize(material.fileSize)}</strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-0.5">Lưu trữ tại:</span>
              <strong className="text-teal-800 font-semibold block uppercase">
                {material.storageSource === 'drive'
                  ? 'Google Drive (Chính)'
                  : material.storageSource === 'supabase'
                  ? 'Supabase Storage'
                  : 'Bộ nhớ MN Hải Tân'}
              </strong>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            <span>{material.viewsCount} lượt xem</span>
            <span aria-hidden="true" className="mx-1.5">·</span>
            <span>{material.downloadsCount} lượt tải về</span>
          </div>

          <div className="flex items-center gap-2">
            {material.externalLink && (
              <a
                href={material.externalLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở link ngoài</span>
              </a>
            )}

            <button
              onClick={() => onDownload(material)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-sm cursor-pointer transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Tải xuống tệp gốc</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
