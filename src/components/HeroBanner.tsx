import React from 'react';
import {
  FileText,
  Music,
  Video,
  Image,
  Gamepad2,
  Drum,
  Search,
  Sparkles,
} from 'lucide-react';
import { MaterialCategory, MusicMaterial } from '../types/material';

interface HeroBannerProps {
  materials: MusicMaterial[];
  activeCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  materials,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  const countByCategory = (cat: MaterialCategory) => {
    return materials.filter((m) => m.category === cat).length;
  };

  const categories = [
    { id: 'tat_ca', label: 'Tất cả học liệu', count: materials.length, icon: Sparkles, color: 'text-teal-700 bg-teal-50' },
    { id: 'giao_an', label: 'Giáo án điện tử', count: countByCategory('giao_an'), icon: FileText, color: 'text-emerald-700 bg-emerald-50' },
    { id: 'am_thanh', label: 'Bài hát & Beat nhạc', count: countByCategory('am_thanh'), icon: Music, color: 'text-teal-700 bg-teal-50' },
    { id: 'video', label: 'Video ca múa', count: countByCategory('video'), icon: Video, color: 'text-amber-700 bg-amber-50' },
    { id: 'tro_choi', label: 'Trò chơi âm nhạc', count: countByCategory('tro_choi'), icon: Gamepad2, color: 'text-sky-700 bg-sky-50' },
    { id: 'nhac_cu', label: 'Học liệu Nhạc cụ', count: countByCategory('nhac_cu'), icon: Drum, color: 'text-yellow-800 bg-yellow-50' },
    { id: 'hinh_anh', label: 'Hình ảnh & Tranh vẽ', count: countByCategory('hinh_anh'), icon: Image, color: 'text-cyan-700 bg-cyan-50' },
  ];

  return (
    <div className="bg-gradient-to-b from-teal-50/70 via-emerald-50/40 to-transparent pt-6 pb-4 border-b border-amber-100/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Intro Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 tracking-wide uppercase mb-1.5">
              <span>Học tập qua giai điệu</span>
              <span aria-hidden="true">·</span>
              <span>Giáo dục thẩm mỹ mầm non</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-['Quicksand']">
              Kho Học Liệu Âm Nhạc Trực Tuyến
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              Hệ thống lưu trữ dùng chung cho toàn thể cán bộ, giáo viên Trường Mầm non Hải Tân.
              Dễ dàng tải lên, tra cứu, xem trước bài giảng, mở nhạc beat và tải tài liệu về máy tính, điện thoại bất cứ lúc nào.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full lg:w-96">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm bài hát, giáo án, trò chơi, nhạc cụ..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-xs text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-1"
                >
                  Xóa
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 overflow-x-auto whitespace-nowrap">
              <span className="font-medium text-teal-800">Gợi ý tìm kiếm:</span>
              {['Cháu yêu bà', 'Phách tre', 'Vũ điệu hóa đá', 'Inh lả ơi', 'Beat mầm non'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(tag)}
                  className="hover:text-teal-700 underline underline-offset-2 transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Segmented Bar - Strict zero-pill adherence */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-900/10'
                    : 'bg-white hover:bg-teal-50/70 text-slate-700 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-200' : 'text-teal-600'}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-teal-800/80 text-amber-200' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
