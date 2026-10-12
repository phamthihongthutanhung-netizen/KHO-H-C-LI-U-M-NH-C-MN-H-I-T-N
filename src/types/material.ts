export type MaterialCategory =
  | 'giao_an'
  | 'am_thanh'
  | 'video'
  | 'hinh_anh'
  | 'tro_choi'
  | 'nhac_cu';

export type AgeGroup =
  | 'tat_ca'
  | 'nha_tre_24_36'
  | 'mam_3_4'
  | 'choi_4_5'
  | 'la_5_6';

export interface MusicMaterial {
  id: string;
  title: string;
  category: MaterialCategory;
  ageGroup: AgeGroup;
  theme: string;
  description: string;
  lyrics?: string; // Lời bài hát nếu là âm thanh/bài hát
  gameRules?: string; // Luật chơi nếu là trò chơi âm nhạc
  instrumentGuide?: string; // Hướng dẫn gõ phách/sử dụng nếu là nhạc cụ
  author: string; // Tên giáo viên hoặc tác giả (vd: Cô Mai - Lớp Lá 1)
  fileUrl: string; // URL tải/xem tệp
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // mime hoặc extension
  thumbnailUrl?: string;
  externalLink?: string; // Youtube hoặc link bổ trợ
  storageSource: 'drive' | 'supabase' | 'server' | 'external';
  driveFileId?: string;
  downloadsCount: number;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  bucketName: string;
  tableName: string;
  isConnected: boolean;
}

export const CATEGORY_LABELS: Record<MaterialCategory, { label: string; iconName: string; color: string; desc: string }> = {
  giao_an: {
    label: 'Giáo án âm nhạc',
    iconName: 'FileText',
    color: 'emerald',
    desc: 'Kế hoạch bài dạy, giáo án điện tử mẫu giáo',
  },
  am_thanh: {
    label: 'Âm thanh & Bài hát',
    iconName: 'Music',
    color: 'teal',
    desc: 'Nhạc có lời, beat không lời, nhạc hiệu mầm non',
  },
  video: {
    label: 'Video ca múa',
    iconName: 'Video',
    color: 'amber',
    desc: 'Video dạy múa, vận động minh họa, tiết dạy mẫu',
  },
  hinh_anh: {
    label: 'Hình ảnh & Tranh vẽ',
    iconName: 'Image',
    color: 'cyan',
    desc: 'Tranh minh họa bài hát, thẻ flashcard nốt nhạc',
  },
  tro_choi: {
    label: 'Trò chơi âm nhạc',
    iconName: 'Gamepad2',
    color: 'sky',
    desc: 'Luật chơi, trò chơi thính giác, vận động theo nhạc',
  },
  nhac_cu: {
    label: 'Học liệu Nhạc cụ',
    iconName: 'Drum',
    color: 'yellow',
    desc: 'Phách tre, xắc xô, trống lắc, cách gõ tiết tấu',
  },
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  tat_ca: 'Mọi lứa tuổi',
  nha_tre_24_36: 'Nhà trẻ (24 - 36 tháng)',
  mam_3_4: 'Mẫu giáo bé (3 - 4 tuổi)',
  choi_4_5: 'Mẫu giáo nhỡ (4 - 5 tuổi)',
  la_5_6: 'Mẫu giáo lớn (5 - 6 tuổi)',
};

export const COMMON_THEMES = [
  'Tất cả chủ đề',
  'Trường mầm non',
  'Bản thân',
  'Gia đình',
  'Nghề nghiệp',
  'Thế giới động vật',
  'Thế giới thực vật',
  'Phương tiện giao thông',
  'Nước và các hiện tượng tự nhiên',
  'Quê hương - Đất nước - Bác Hồ',
  'Tết và Mùa xuân',
  'Các sự kiện & Lễ hội'
];
