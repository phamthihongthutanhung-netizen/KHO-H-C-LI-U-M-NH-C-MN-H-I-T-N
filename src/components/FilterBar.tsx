import React from 'react';
import {
  Filter,
  Grid,
  List,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import { AGE_GROUP_LABELS, AgeGroup, COMMON_THEMES } from '../types/material';

interface FilterBarProps {
  selectedAgeGroup: string;
  onAgeGroupChange: (age: string) => void;
  selectedTheme: string;
  onThemeChange: (theme: string) => void;
  sortBy: 'latest' | 'downloads' | 'views' | 'name';
  onSortByChange: (sort: 'latest' | 'downloads' | 'views' | 'name') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedAgeGroup,
  onAgeGroupChange,
  selectedTheme,
  onThemeChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  onResetFilters,
  hasActiveFilters,
  totalFiltered,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Bộ lọc:</span>
          </div>

          {/* Age Group */}
          <div className="relative">
            <select
              value={selectedAgeGroup}
              onChange={(e) => onAgeGroupChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors"
            >
              <option value="tat_ca">Lứa tuổi: Tất cả</option>
              {Object.entries(AGE_GROUP_LABELS)
                .filter(([k]) => k !== 'tat_ca')
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
          </div>

          {/* Theme */}
          <div className="relative">
            <select
              value={selectedTheme}
              onChange={(e) => onThemeChange(e.target.value)}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors"
            >
              {COMMON_THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {theme === 'Tất cả chủ đề' ? 'Chủ đề: Tất cả' : `Chủ đề: ${theme}`}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Xóa bộ lọc</span>
            </button>
          )}

          <div className="text-xs text-slate-500 ml-1">
            Tìm thấy <strong className="text-teal-800 font-bold">{totalFiltered}</strong> học liệu
          </div>
        </div>

        {/* Sort & View Mode */}
        <div className="flex items-center gap-3">
          {/* Sort selector */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 hidden sm:inline">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-teal-500 cursor-pointer"
            >
              <option value="latest">Mới cập nhật</option>
              <option value="downloads">Lượt tải nhiều nhất</option>
              <option value="views">Lượt xem nhiều nhất</option>
              <option value="name">Tên học liệu A-Z</option>
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onViewModeChange('grid')}
              title="Chế độ lưới"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              title="Chế độ danh sách"
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
