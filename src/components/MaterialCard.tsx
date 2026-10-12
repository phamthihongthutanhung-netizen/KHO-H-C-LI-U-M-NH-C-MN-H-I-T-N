import React from 'react';
import {
  FileText,
  Music,
  Video,
  Image,
  Gamepad2,
  Drum,
  Download,
  Eye,
  Play,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  MusicMaterial,
  CATEGORY_LABELS,
  AGE_GROUP_LABELS,
} from '../types/material';

interface MaterialCardProps {
  material: MusicMaterial;
  isPlaying?: boolean;
  onPlayAudio?: (material: MusicMaterial) => void;
  onOpenDetail: (material: MusicMaterial) => void;
  onDownload: (material: MusicMaterial) => void;
  onDelete: (material: MusicMaterial) => void;
  viewMode?: 'grid' | 'list';
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  isPlaying = false,
  onPlayAudio,
  onOpenDetail,
  onDownload,
  onDelete,
  viewMode = 'grid',
}) => {
  const catConfig = CATEGORY_LABELS[material.category] || {
    label: 'Học liệu',
    iconName: 'FileText',
    color: 'teal',
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getCategoryIcon = () => {
    switch (material.category) {
      case 'giao_an':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'am_thanh':
        return <Music className="w-5 h-5 text-teal-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-amber-600" />;
      case 'hinh_anh':
        return <Image className="w-5 h-5 text-cyan-600" />;
      case 'tro_choi':
        return <Gamepad2 className="w-5 h-5 text-sky-600" />;
      case 'nhac_cu':
        return <Drum className="w-5 h-5 text-yellow-700" />;
      default:
        return <FileText className="w-5 h-5 text-slate-600" />;
    }
  };

  const isAudio = material.category === 'am_thanh' || material.fileType.includes('audio') || material.fileName.endsWith('.mp3');

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 hover:border-teal-300 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {getCategoryIcon()}
          </div>
          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onOpenDetail(material)}
              className="text-base font-bold text-slate-900 hover:text-teal-700 cursor-pointer transition-colors truncate"
              title={material.title}
            >
              {material.title}
            </h3>
            {/* Zero-pill metadata line */}
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span className="font-semibold text-teal-800">{catConfig.label}</span>
              <span aria-hidden="true">·</span>
              <span>{AGE_GROUP_LABELS[material.ageGroup] || material.ageGroup}</span>
              <span aria-hidden="true">·</span>
              <span>Chủ đề: {material.theme}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600">{material.author}</span>
              {material.storageSource === 'drive' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-700 font-bold">Google Drive</span>
                </>
              )}
            </div>
            {material.description && (
              <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                {material.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div className="text-right text-xs text-slate-400 hidden lg:block">
            <div className="text-slate-600 font-medium">{formatFileSize(material.fileSize)}</div>
            <div>{material.downloadsCount} tải · {material.viewsCount} xem</div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAudio && onPlayAudio && (
              <button
                onClick={() => onPlayAudio(material)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isPlaying
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                }`}
                title={isPlaying ? 'Đang phát' : 'Nghe thử'}
              >
                <Play className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isPlaying ? 'Đang phát' : 'Nghe'}</span>
              </button>
            )}

            <button
              onClick={() => onOpenDetail(material)}
              className="p-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem</span>
            </button>

            <button
              onClick={() => onDownload(material)}
              className="p-2 rounded-lg text-xs font-medium text-teal-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
              title="Tải xuống tài liệu"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Tải về</span>
            </button>

            <button
              onClick={() => onDelete(material)}
              className="p-2 rounded-lg text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Xóa học liệu"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid Card View
  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-teal-300 shadow-2xs hover:shadow-md transition-all flex flex-col overflow-hidden">
      {/* Card Header Strip with quiet category branding */}
      <div className="p-4 pb-3 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {getCategoryIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-teal-800">{catConfig.label}</span>
            <span className="text-[11px] text-slate-400">{formatFileSize(material.fileSize)}</span>
          </div>
          <h3
            onClick={() => onOpenDetail(material)}
            className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-teal-700 cursor-pointer transition-colors line-clamp-2 leading-snug"
            title={material.title}
          >
            {material.title}
          </h3>
        </div>
      </div>

      {/* Card Visual Body / Preview */}
      {material.thumbnailUrl ? (
        <div className="px-4 pb-2">
          <div
            onClick={() => onOpenDetail(material)}
            className="relative h-32 rounded-xl overflow-hidden bg-slate-100 cursor-pointer group-hover:opacity-95"
          >
            <img
              src={material.thumbnailUrl}
              alt={material.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      ) : isAudio ? (
        <div className="px-4 pb-2">
          <div
            onClick={() => onPlayAudio && onPlayAudio(material)}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              isPlaying
                ? 'bg-amber-50/80 border-amber-300'
                : 'bg-teal-50/50 hover:bg-teal-50 border-teal-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isPlaying ? 'bg-amber-500 text-white animate-pulse' : 'bg-teal-600 text-white'
                }`}
              >
                <Play className="w-4 h-4 ml-0.5" />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-800">
                  {isPlaying ? 'Đang phát âm thanh...' : 'Nhấn để nghe bài hát/beat'}
                </p>
                <p className="text-[11px] text-slate-500">Âm thanh chuẩn mầm non</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-teal-700">♪</span>
          </div>
        </div>
      ) : null}

      {/* Unboxed Metadata & Excerpt */}
      <div className="px-4 py-2 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mb-2">
            <span className="text-slate-700 font-medium">
              {AGE_GROUP_LABELS[material.ageGroup] || material.ageGroup}
            </span>
            <span aria-hidden="true">·</span>
            <span>Chủ đề: {material.theme}</span>
            {material.storageSource === 'drive' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-bold">Google Drive</span>
              </>
            )}
          </div>

          {material.description && (
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
              {material.description}
            </p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[150px] font-medium text-slate-600">
            {material.author}
          </span>
          <div className="flex items-center gap-2 text-slate-400">
            <span>{material.viewsCount} xem</span>
            <span aria-hidden="true">·</span>
            <span>{material.downloadsCount} tải</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          onClick={() => onOpenDetail(material)}
          className="text-xs font-semibold text-teal-800 hover:text-teal-950 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Xem chi tiết</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onDownload(material)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-900 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300/80 transition-colors cursor-pointer"
            title="Tải tệp về máy tính / điện thoại"
          >
            <Download className="w-3.5 h-3.5 text-emerald-800" />
            <span>Tải về</span>
          </button>

          <button
            onClick={() => onDelete(material)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Xóa học liệu"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
