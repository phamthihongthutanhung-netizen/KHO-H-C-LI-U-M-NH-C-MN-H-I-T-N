/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Music,
  Plus,
  BookOpen,
  Cloud,
  Server,
  FolderOpen,
  Filter,
  CheckCircle2,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { MusicMaterial, SupabaseConfig } from './types/material';
import {
  fetchMaterials,
  deleteMaterial,
  recordDownload,
  recordView,
} from './lib/materialsApi';
import { getStoredSupabaseConfig } from './lib/supabaseClient';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken,
} from './lib/googleAuth';
import {
  getOrCreateDriveFolder,
  saveMaterialsIndexToDrive,
  loadMaterialsIndexFromDrive,
  DRIVE_FOLDER_NAME,
} from './lib/googleDriveService';

// Components
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { GoogleDrivePanel } from './components/GoogleDrivePanel';
import { FilterBar } from './components/FilterBar';
import { MaterialCard } from './components/MaterialCard';
import { AudioPlayer } from './components/AudioPlayer';
import { DetailModal } from './components/DetailModal';
import { UploadModal } from './components/UploadModal';
import { SupabaseModal } from './components/SupabaseModal';
import { MusicHandbookModal } from './components/MusicHandbookModal';

export default function App() {
  const [materials, setMaterials] = useState<MusicMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'drive' | 'supabase' | 'server'>('server');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Drive & Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [driveFolderUrl, setDriveFolderUrl] = useState<string | undefined>(undefined);
  const [isSyncingDrive, setIsSyncingDrive] = useState<boolean>(false);
  const [syncDriveProgress, setSyncDriveProgress] = useState<string | undefined>(undefined);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('tat_ca');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('tat_ca');
  const [selectedTheme, setSelectedTheme] = useState<string>('Tất cả chủ đề');
  const [sortBy, setSortBy] = useState<'latest' | 'downloads' | 'views' | 'name'>('latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals & Active state
  const [currentAudioTrack, setCurrentAudioTrack] = useState<MusicMaterial | null>(null);
  const [detailMaterial, setDetailMaterial] = useState<MusicMaterial | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isSupabaseOpen, setIsSupabaseOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Supabase Configuration
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Initialize Google Auth and sync Drive folder on startup
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setDriveAccessToken(token);

        if (token) {
          try {
            const folder = await getOrCreateDriveFolder(token);
            setDriveFolderId(folder.id);
            setDriveFolderUrl(folder.webViewLink);

            // Try loading existing materials index from Google Drive
            const driveIndex = await loadMaterialsIndexFromDrive(token, folder.id);
            if (driveIndex && driveIndex.length > 0) {
              setMaterials(driveIndex);
              setDataSource('drive');
            }
          } catch (err) {
            console.warn('Could not auto-connect Google Drive folder:', err);
          }
        }
      },
      () => {
        setGoogleUser(null);
        setDriveAccessToken(null);
        setDriveFolderId(null);
        setDriveFolderUrl(undefined);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Fetch materials from server/database
  const loadMaterials = async () => {
    setIsLoading(true);
    try {
      // If Drive is connected and has folder, check Drive first
      if (driveAccessToken && driveFolderId) {
        const driveIndex = await loadMaterialsIndexFromDrive(driveAccessToken, driveFolderId);
        if (driveIndex && driveIndex.length > 0) {
          setMaterials(driveIndex);
          setDataSource('drive');
          setIsLoading(false);
          return;
        }
      }

      const res = await fetchMaterials();
      setMaterials(res.materials);
      setDataSource(res.source);
    } catch (err: any) {
      console.error('Failed to load materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // 3. Google Sign-In Handler
  const handleSignInGoogle = async () => {
    try {
      showToast('Đang kết nối tài khoản Google...');
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setDriveAccessToken(result.accessToken);

        // Create or get the school's music folder on Drive
        showToast('Đang chuẩn bị thư mục trên Google Drive...');
        const folder = await getOrCreateDriveFolder(result.accessToken);
        setDriveFolderId(folder.id);
        setDriveFolderUrl(folder.webViewLink);

        // Check if index already exists in Drive
        const driveMaterials = await loadMaterialsIndexFromDrive(result.accessToken, folder.id);
        if (driveMaterials && driveMaterials.length > 0) {
          setMaterials(driveMaterials);
          setDataSource('drive');
          showToast(`Đã đồng bộ ${driveMaterials.length} học liệu từ Google Drive!`);
        } else {
          // Initialize Drive with current materials
          if (materials.length > 0) {
            await saveMaterialsIndexToDrive(result.accessToken, folder.id, materials);
          }
          setDataSource('drive');
          showToast('Đã liên kết Google Drive làm nơi lưu trữ chính!');
        }
      }
    } catch (err: any) {
      console.error('Google Sign-in failed:', err);
      showToast(`Không thể kết nối Google: ${err.message || 'Thử lại'}`);
    }
  };

  // 4. Google Sign-Out Handler
  const handleSignOutGoogle = async () => {
    await googleSignOut();
    setGoogleUser(null);
    setDriveAccessToken(null);
    setDriveFolderId(null);
    setDriveFolderUrl(undefined);
    setDataSource('server');
    showToast('Đã đăng xuất Google Drive.');
  };

  // 5. Sync all current materials to Google Drive
  const handleSyncAllToDrive = async () => {
    if (!driveAccessToken || !driveFolderId) {
      await handleSignInGoogle();
      return;
    }

    setIsSyncingDrive(true);
    setSyncDriveProgress('Đang đồng bộ danh mục học liệu lên Google Drive...');

    try {
      await saveMaterialsIndexToDrive(driveAccessToken, driveFolderId, materials);
      setSyncDriveProgress(undefined);
      setIsSyncingDrive(false);
      showToast(`Đã đồng bộ ${materials.length} học liệu lên Google Drive thành công!`);
    } catch (err: any) {
      console.error('Sync to Drive error:', err);
      setSyncDriveProgress(undefined);
      setIsSyncingDrive(false);
      showToast(`Lỗi đồng bộ: ${err.message || 'Thử lại'}`);
    }
  };

  // 6. Refresh materials from Drive
  const handleRefreshFromDrive = async () => {
    if (!driveAccessToken || !driveFolderId) return;

    setIsSyncingDrive(true);
    setSyncDriveProgress('Đang tải danh sách học liệu từ Google Drive...');

    try {
      const driveMaterials = await loadMaterialsIndexFromDrive(driveAccessToken, driveFolderId);
      if (driveMaterials) {
        setMaterials(driveMaterials);
        showToast(`Đã cập nhật ${driveMaterials.length} học liệu từ Google Drive.`);
      } else {
        showToast('Chưa có học liệu nào trong chỉ mục Google Drive.');
      }
    } catch (err: any) {
      showToast('Lỗi khi tải từ Google Drive.');
    } finally {
      setIsSyncingDrive(false);
      setSyncDriveProgress(undefined);
    }
  };

  const handleConfigUpdated = () => {
    setSupabaseConfig(getStoredSupabaseConfig());
    loadMaterials();
    showToast('Đã cập nhật cấu hình Supabase thành công!');
  };

  // Filter & sort logic
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((item) => {
        // Category filter
        if (activeCategory !== 'tat_ca' && item.category !== activeCategory) {
          return false;
        }

        // Age group filter
        if (selectedAgeGroup !== 'tat_ca' && item.ageGroup !== selectedAgeGroup && item.ageGroup !== 'tat_ca') {
          return false;
        }

        // Theme filter
        if (selectedTheme !== 'Tất cả chủ đề' && item.theme !== selectedTheme) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchAuthor = item.author?.toLowerCase().includes(q);
          const matchLyrics = item.lyrics?.toLowerCase().includes(q);
          const matchFile = item.fileName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchAuthor && !matchLyrics && !matchFile) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'downloads') {
          return (b.downloadsCount || 0) - (a.downloadsCount || 0);
        }
        if (sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (sortBy === 'name') {
          return a.title.localeCompare(b.title, 'vi');
        }
        // latest default
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [materials, activeCategory, selectedAgeGroup, selectedTheme, searchQuery, sortBy]);

  // Audio Play Handler
  const handlePlayAudio = (material: MusicMaterial) => {
    setCurrentAudioTrack(material);
    recordView(material.id);
  };

  // Download Handler
  const handleDownload = (material: MusicMaterial) => {
    recordDownload(material.id);

    // Update local count immediately
    setMaterials((prev) =>
      prev.map((m) => (m.id === material.id ? { ...m, downloadsCount: (m.downloadsCount || 0) + 1 } : m))
    );

    // Trigger download
    const link = document.createElement('a');
    link.href = material.fileUrl;
    link.download = material.fileName || 'tai-lieu-am-nhac';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Đang tải về: ${material.title}`);
  };

  // Delete Handler with Mandatory Confirmation Dialog
  const handleDelete = async (material: MusicMaterial) => {
    const isDriveItem = material.storageSource === 'drive' || !!material.driveFileId;
    const confirmMessage = isDriveItem
      ? `Bạn có chắc chắn muốn xóa học liệu "${material.title}" khỏi Google Drive và hệ thống? Thao tác này không thể hoàn tác.`
      : `Bạn có chắc chắn muốn xóa học liệu "${material.title}"?`;

    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    const ok = await deleteMaterial(material.id, {
      accessToken: driveAccessToken || '',
      driveFileId: material.driveFileId,
    });

    if (ok) {
      const updatedList = materials.filter((m) => m.id !== material.id);
      setMaterials(updatedList);

      // If drive is active, also sync the updated index to Drive
      if (driveAccessToken && driveFolderId) {
        saveMaterialsIndexToDrive(driveAccessToken, driveFolderId, updatedList).catch((e) =>
          console.warn('Could not update Drive index after delete:', e)
        );
      }

      if (currentAudioTrack?.id === material.id) {
        setCurrentAudioTrack(null);
      }
      if (detailMaterial?.id === material.id) {
        setDetailMaterial(null);
      }
      showToast('Đã xóa học liệu thành công.');
    } else {
      showToast('Lỗi khi xóa học liệu. Vui lòng thử lại.');
    }
  };

  // Upload Success
  const handleUploadSuccess = (newMaterial: MusicMaterial) => {
    const updatedList = [newMaterial, ...materials];
    setMaterials(updatedList);

    // If drive is active, also sync to Drive index immediately
    if (driveAccessToken && driveFolderId) {
      saveMaterialsIndexToDrive(driveAccessToken, driveFolderId, updatedList).catch((e) =>
        console.warn('Could not auto-update Drive index:', e)
      );
    }

    showToast(`Tải lên thành công: ${newMaterial.title}`);
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedAgeGroup('tat_ca');
    setSelectedTheme('Tất cả chủ đề');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedAgeGroup !== 'tat_ca' || selectedTheme !== 'Tất cả chủ đề' || searchQuery.trim() !== '';

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/30 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-teal-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold animate-in slide-in-from-top duration-200 border border-teal-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        totalCount={materials.length}
        supabaseConfig={supabaseConfig}
        user={googleUser}
        accessToken={driveAccessToken}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSupabase={() => setIsSupabaseOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSignInGoogle={handleSignInGoogle}
      />

      {/* Hero Banner with search & categories */}
      <HeroBanner
        materials={materials}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full pb-28">
        {/* Prominent Google Drive Cloud Sync Panel on Homepage */}
        <GoogleDrivePanel
          user={googleUser}
          accessToken={driveAccessToken}
          folderName={DRIVE_FOLDER_NAME}
          folderUrl={driveFolderUrl}
          isSyncing={isSyncingDrive}
          syncProgress={syncDriveProgress}
          onSignIn={handleSignInGoogle}
          onSignOut={handleSignOutGoogle}
          onSyncAllToDrive={handleSyncAllToDrive}
          onRefreshFromDrive={handleRefreshFromDrive}
        />

        {/* Filter & View Mode Controls */}
        <FilterBar
          selectedAgeGroup={selectedAgeGroup}
          onAgeGroupChange={setSelectedAgeGroup}
          selectedTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
          totalFiltered={filteredMaterials.length}
        />

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-teal-600" />
            <p className="text-sm font-medium">Đang tải kho học liệu âm nhạc...</p>
          </div>
        ) : filteredMaterials.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-2xs">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 text-teal-600">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Không tìm thấy học liệu phù hợp
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Thử tìm kiếm với từ khóa khác, hoặc đặt lại bộ lọc độ tuổi và chủ đề để xem toàn bộ danh mục.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 transition-colors cursor-pointer"
              >
                + Tải lên tài liệu mới
              </button>
            </div>
          </div>
        ) : (
          /* Materials Grid or List */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
                : 'space-y-3'
            }
          >
            {filteredMaterials.map((material) => (
              <MaterialCard
                key={material.id}
                material={material}
                viewMode={viewMode}
                isPlaying={currentAudioTrack?.id === material.id}
                onPlayAudio={handlePlayAudio}
                onOpenDetail={(m) => {
                  setDetailMaterial(m);
                  recordView(m.id);
                }}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-sm">
              HT
            </div>
            <div>
              <p className="font-bold text-slate-800">
                TRƯỜNG MẦM NON HẢI TÂN · HẢI PHÒNG
              </p>
              <p className="text-[11px] text-slate-400">
                Hệ thống lưu trữ học liệu âm nhạc liên kết Google Drive đám mây
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1 text-teal-800 font-semibold">
              <HardDrive className="w-3.5 h-3.5" />
              Lưu trữ chính: Google Drive
            </span>
            <span aria-hidden="true">·</span>
            <span>Tự động đồng bộ</span>
            <span aria-hidden="true">·</span>
            <span>Tương thích Máy tính & Điện thoại</span>
          </div>
        </div>
      </footer>

      {/* Sticky Audio Player */}
      <AudioPlayer
        currentTrack={currentAudioTrack}
        onClose={() => setCurrentAudioTrack(null)}
        onDownload={handleDownload}
      />

      {/* Modals */}
      <DetailModal
        material={detailMaterial}
        onClose={() => setDetailMaterial(null)}
        onDownload={handleDownload}
        onPlayAudio={handlePlayAudio}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
        driveAccessToken={driveAccessToken}
        driveFolderId={driveFolderId}
      />

      <SupabaseModal
        isOpen={isSupabaseOpen}
        onClose={() => setIsSupabaseOpen(false)}
        onConfigUpdated={handleConfigUpdated}
      />

      <MusicHandbookModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
