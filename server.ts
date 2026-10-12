import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware for body parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Directories for local persistent storage
const DATA_DIR = path.resolve(__dirname, 'data');
const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const MATERIALS_FILE = path.resolve(DATA_DIR, 'materials.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const cleanOriginalName = Buffer.from(file.originalname, 'latin1')
      .toString('utf8')
      .replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${timestamp}-${cleanOriginalName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB limit
});

// Seed data generator for Trường Mầm non Hải Tân
function getInitialSeedData() {
  return [
    {
      id: 'mat-001',
      title: 'Giáo án: Dạy hát "Cháu yêu bà" - Vận động minh họa (Độ tuổi: 3 - 4 tuổi)',
      category: 'giao_an',
      ageGroup: 'mam_3_4',
      theme: 'Gia đình',
      description: 'Giáo án chi tiết tiết học Giáo dục âm nhạc trọng tâm dạy hát, kết hợp vận động vỗ tay nhịp nhàng. Tích hợp trò chơi âm nhạc "Ai nhanh nhất". Đầy đủ mục tiêu kiến thức, kỹ năng, thái độ và tiến trình bài dạy 3 bước.',
      lyrics: 'Bà ơi bà, cháu yêu bà lắm. Tóc bà trắng, màu trắng như mây. Cháu yêu bà, cháu nắm bàn tay. Khi cháu vâng lời, cháu biết bà vui!',
      author: 'Cô Nguyễn Thị Lan - Khối Mẫu giáo Bé',
      fileUrl: '/uploads/sample_giao_an_chau_yeu_ba.pdf',
      fileName: 'Giao_an_am_nhac_Chau_yeu_ba_3-4T.pdf',
      fileSize: 425000,
      fileType: 'application/pdf',
      thumbnailUrl: '',
      storageSource: 'server',
      downloadsCount: 84,
      viewsCount: 312,
      createdAt: '2026-09-15T08:30:00.000Z',
      updatedAt: '2026-09-15T08:30:00.000Z',
    },
    {
      id: 'mat-002',
      title: 'Bài hát: "Em yêu cây xanh" - Nhạc có lời chuẩn mầm non',
      category: 'am_thanh',
      ageGroup: 'choi_4_5',
      theme: 'Thế giới thực vật',
      description: 'Giai điệu vui tươi, trong sáng giúp trẻ hiểu được ích lợi của cây xanh cho bóng mát và hoa thơm quả ngọt. Dùng trong hoạt động âm nhạc chủ đề Thực vật.',
      lyrics: 'Em rất thích trồng nhiều cây xanh, cho con chim nhảy nhót trên cành. Sân chơi sẽ có nhiều bóng mát, cho trường em muôn hoa đẹp xinh. Cô giáo dạy em yêu cây xanh, cây có hoa quả chín trên cành. Vui chung em sẽ lớn thật nhanh, cùng mùa xuân đón chào năm mới!',
      author: 'Nhạc sĩ Hoàng Văn Yến - Ban Âm nhạc MN Hải Tân',
      fileUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=playful-kids-melody-10928.mp3',
      fileName: 'Em_yeu_cay_xanh_Co_loi.mp3',
      fileSize: 3200000,
      fileType: 'audio/mpeg',
      thumbnailUrl: '',
      storageSource: 'external',
      downloadsCount: 142,
      viewsCount: 520,
      createdAt: '2026-09-18T09:15:00.000Z',
      updatedAt: '2026-09-18T09:15:00.000Z',
    },
    {
      id: 'mat-003',
      title: 'Nhạc beat không lời: "Trường chúng cháu là trường mầm non" (Tone chuẩn)',
      category: 'am_thanh',
      ageGroup: 'tat_ca',
      theme: 'Trường mầm non',
      description: 'Nhạc nền beat phối khí vui nhộn, âm thanh trong trẻo phù hợp cho trẻ hát đồng ca đầu năm học và các ngày lễ hội chào mừng năm học mới.',
      lyrics: 'Ai hỏi cháu cháu học trường nào đây? Bé mà ngoan lại múa hát thật hay. Cô là mẹ và các cháu là con, trường của cháu đây là trường mầm non!',
      author: 'Nhạc sĩ Phạm Tuyên - Biên tập: Cô Thu Hiền',
      fileUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=carefree-ukulele-kids-112191.mp3',
      fileName: 'Beat_Truong_chung_chau_la_truong_mam_non.mp3',
      fileSize: 2850000,
      fileType: 'audio/mpeg',
      thumbnailUrl: '',
      storageSource: 'external',
      downloadsCount: 215,
      viewsCount: 780,
      createdAt: '2026-09-02T10:00:00.000Z',
      updatedAt: '2026-09-02T10:00:00.000Z',
    },
    {
      id: 'mat-004',
      title: 'Video hướng dẫn: Vận động múa minh họa "Bông hoa mừng cô" (20/11)',
      category: 'video',
      ageGroup: 'la_5_6',
      theme: 'Nghề nghiệp',
      description: 'Video cô giáo Hải Tân làm mẫu các động tác cuộn tay hoa sen, nhún chân nhịp nhàng, nghiêng đầu duyên dáng theo bài hát Bông hoa mừng cô.',
      lyrics: 'Mùng tám tháng ba em ra thăm vườn, chọn một bông hoa xinh tươi tặng cô giáo...',
      author: 'Cô Trần Hải Yến - Lớp Mẫu giáo Lớn A1',
      fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      fileName: 'Video_Van_dong_Bong_hoa_mung_co_5-6T.mp4',
      fileSize: 15400000,
      fileType: 'video/mp4',
      thumbnailUrl: '',
      externalLink: 'https://www.youtube.com',
      storageSource: 'external',
      downloadsCount: 96,
      viewsCount: 435,
      createdAt: '2026-09-20T14:20:00.000Z',
      updatedAt: '2026-09-20T14:20:00.000Z',
    },
    {
      id: 'mat-005',
      title: 'Trò chơi âm nhạc: "Vũ điệu hóa đá" (Musical Statues) - Trẻ cực kỳ thích thú',
      category: 'tro_choi',
      ageGroup: 'tat_ca',
      theme: 'Trường mầm non',
      description: 'Trò chơi rèn luyện phản xạ thính giác và khả năng giữ thăng bằng. Khi tiếng nhạc nổi lên các bé tự do nhảy múa, khi nhạc dừng trẻ phải lập tức "hóa đá" giữ nguyên tư thế!',
      gameRules: `1. Mục đích: Rèn phản xạ thính giác, khả năng kiềm chế vận động và cảm thụ tiết tấu.\n2. Chuẩn bị: Khoảng không gian rộng rãi, loa phát nhạc sôi động.\n3. Cách chơi:\n- Cô bật nhạc, tất cả trẻ tự do nhún nhảy, tạo dáng sáng tạo theo giai điệu.\n- Khi cô bất ngờ tắt nhạc, trẻ phải dừng ngay lập tức và giữ nguyên dáng điệu (hóa đá), không được nhúc nhích hay cười nói.\n- Trẻ nào cử động khi nhạc đã tắt sẽ phải nhảy lò cò một vòng hoặc lên hát tặng cả lớp một câu hát.\n4. Biến thể: Khi nhạc tắt, cô hô "Hóa đá thành bông hoa", "Hóa đá thành chú chim con", trẻ tạo dáng theo yêu cầu!`,
      author: 'Tổ Chuyên môn Mầm non Hải Tân',
      fileUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=funny-kids-music-14421.mp3',
      fileName: 'Nhac_Tro_choi_Vu_dieu_hoa_da.mp3',
      fileSize: 1980000,
      fileType: 'audio/mpeg',
      thumbnailUrl: '',
      storageSource: 'external',
      downloadsCount: 168,
      viewsCount: 610,
      createdAt: '2026-09-22T16:00:00.000Z',
      updatedAt: '2026-09-22T16:00:00.000Z',
    },
    {
      id: 'mat-006',
      title: 'Học liệu Nhạc cụ: Bộ gõ Phách tre - Cách dạy trẻ gõ tiết tấu chậm & nhanh',
      category: 'nhac_cu',
      ageGroup: 'choi_4_5',
      theme: 'Trường mầm non',
      description: 'Tài liệu hướng dẫn trực quan cách cầm phách tre bằng 2 tay đúng tư thế, cách hướng dẫn trẻ gõ theo phách, gõ theo nhịp và gõ theo tiết tấu chậm (1-2-3 mở).',
      instrumentGuide: `1. Đặc điểm nhạc cụ: Phách tre gồm 2 thanh tre già dài khoảng 12-15cm, gọt nhẵn bóng, âm thanh giòn giã, vang khỏe.\n2. Tư thế cầm phách: Tay phải cầm thanh phách cái (ngón trỏ và ngón cái kẹp chặt, các ngón còn lại ôm nhẹ), tay trái cầm phách con đặt ngửa.\n3. Kỹ thuật gõ tiết tấu cho trẻ 4-5 tuổi:\n- Gõ theo phách: Gõ đều đặn vào từng phách của bài hát (nhịp mạnh và nhịp nhẹ đều gõ).\n- Gõ tiết tấu chậm: Gõ 3 tiếng nghỉ 1 tiếng (Cốc - Cốc - Cốc - Nghỉ/Mở).\n- Lưu ý cho giáo viên: Cho trẻ luyện gõ bằng tay trước khi phát phách tre thật.`,
      author: 'Cô Phạm Thị Mai - GV Âm nhạc Trường MN Hải Tân',
      fileUrl: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_8233480031.mp3?filename=wooden-percussion-hits-7023.mp3',
      fileName: 'Huong_dan_nhac_cu_phach_tre.pdf',
      fileSize: 750000,
      fileType: 'application/pdf',
      thumbnailUrl: '',
      storageSource: 'external',
      downloadsCount: 112,
      viewsCount: 420,
      createdAt: '2026-09-25T11:10:00.000Z',
      updatedAt: '2026-09-25T11:10:00.000Z',
    },
    {
      id: 'mat-007',
      title: 'Hình ảnh: Bộ tranh minh họa bài hát "Đố bạn" (Khám phá các con vật)',
      category: 'hinh_anh',
      ageGroup: 'mam_3_4',
      theme: 'Thế giới động vật',
      description: 'Bộ tranh màu vẽ sắc nét các con vật trong bài hát: Chú khỉ trèo cây, gấu đen đi lặc lè, hươu sao chạy nhanh, voi to huơ vòi. Phù hợp chiếu TV tương tác hoặc in flashcard cho trẻ.',
      lyrics: 'Trèo cây nhanh thoăn thoắt, đố bạn biết con gì? Đầu đội hai cái sừng, đó là chú hươu sao. Hai tai to phơi phới, đó là chú voi con!',
      author: 'Cô Lê Thị Bích - Khối Nhà trẻ & Mẫu giáo Bé',
      fileUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
      fileName: 'Tranh_minh_hoa_Do_ban_dong_vat.png',
      fileSize: 1840000,
      fileType: 'image/png',
      thumbnailUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
      storageSource: 'external',
      downloadsCount: 130,
      viewsCount: 512,
      createdAt: '2026-10-01T09:00:00.000Z',
      updatedAt: '2026-10-01T09:00:00.000Z',
    },
    {
      id: 'mat-008',
      title: 'Trò chơi âm nhạc: "Tai ai tinh - Đoán âm thanh nhạc cụ"',
      category: 'tro_choi',
      ageGroup: 'mam_3_4',
      theme: 'Trường mầm non',
      description: 'Trò chơi kích thích thính giác mầm non. Cô giáo giấu các nhạc cụ (trống lắc, xắc xô, phách tre, chuông leng keng) sau bức rèm và gõ tiếng kêu để trẻ đoán tên nhạc cụ.',
      gameRules: `1. Mục đích: Phát triển thính giác âm nhạc, phân biệt âm sắc của từng loại nhạc cụ mầm non.\n2. Chuẩn bị: Xắc xô, phách tre, trống lắc, chuông nhỏ; một tấm rèm xinh xắn hoặc hộp bí mật.\n3. Cách chơi:\n- Cô giới thiệu âm thanh của từng nhạc cụ cho cả lớp nghe trước.\n- Cho một bé lên bịt mắt hoặc giấu nhạc cụ sau rèm.\n- Cô gõ 1 nhạc cụ phát ra âm thanh. Trẻ lắng nghe và gọi tên nhạc cụ phát ra tiếng kêu.\n- Khi trẻ đoán đúng, cả lớp cùng vỗ tay khen thưởng và hát vang 1 bài hát ngắn!`,
      author: 'Cô Hoàng Thu Thảo - MN Hải Tân',
      fileUrl: 'https://cdn.pixabay.com/download/audio/2022/01/26/audio_d0c6ff1101.mp3?filename=game-level-music-14424.mp3',
      fileName: 'Tro_choi_Tai_ai_tinh.mp3',
      fileSize: 1650000,
      fileType: 'audio/mpeg',
      thumbnailUrl: '',
      storageSource: 'external',
      downloadsCount: 175,
      viewsCount: 590,
      createdAt: '2026-10-03T14:40:00.000Z',
      updatedAt: '2026-10-03T14:40:00.000Z',
    },
    {
      id: 'mat-009',
      title: 'Học liệu Nhạc cụ: Xắc xô & Trống lắc mầm non - Bộ gõ gõ đệm',
      category: 'nhac_cu',
      ageGroup: 'tat_ca',
      theme: 'Trường mầm non',
      description: 'Tổng hợp tài liệu minh họa âm thanh, cấu tạo và các bài tập vận động cổ tay cho trẻ mầm non khi sử dụng xắc xô và trống lắc tay trong các tiết ca múa.',
      instrumentGuide: `1. Xắc xô: Cầm bằng tay thuận, lắc nhẹ từ cổ tay hoặc vỗ nhẹ mặt xắc xô vào lòng bàn tay còn lại.\n2. Trống lắc: Trẻ xoay nhẹ cán trống để hai hạt gõ va đập vào hai mặt trống tạo tiếng vang giòn giã "lắc... rắc...".\n3. Ứng dụng: Rất thích hợp cho trẻ 24-36 tháng và 3-4 tuổi vừa hát vừa tạo nhịp điệu sinh động.`,
      author: 'Tổ Chuyên môn Thể chất - Nghệ thuật MN Hải Tân',
      fileUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      fileName: 'Hoc_lieu_Xac_xo_Trong_lac.pdf',
      fileSize: 980000,
      fileType: 'application/pdf',
      thumbnailUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
      storageSource: 'external',
      downloadsCount: 88,
      viewsCount: 360,
      createdAt: '2026-10-05T08:15:00.000Z',
      updatedAt: '2026-10-05T08:15:00.000Z',
    },
    {
      id: 'mat-010',
      title: 'Giáo án điện tử PowerPoint: "Bé nghe hát - Inh lả ơi" (Dân ca Thái)',
      category: 'giao_an',
      ageGroup: 'la_5_6',
      theme: 'Quê hương - Đất nước - Bác Hồ',
      description: 'Giáo án tương tác kèm slide trình chiếu sinh động giới thiệu trang phục, điệu múa xòe hoa và làn điệu dân ca Thái vùng Tây Bắc. Đầy đủ hiệu ứng âm thanh và câu hỏi kích thích tư duy trẻ.',
      lyrics: 'Inh lả ơi, sao noọng ơi. Khắp núi rừng Tây Bắc sáng ngời mùa xuân tới. Hoa ban nở trắng rừng đẹp sao!',
      author: 'Cô Đỗ Thị Loan - Khối Mẫu giáo Lớn',
      fileUrl: '/uploads/sample_giao_an_inh_la_oi.pptx',
      fileName: 'Giao_an_dien_tu_Inh_la_oi_5-6T.pptx',
      fileSize: 5800000,
      fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      thumbnailUrl: '',
      storageSource: 'server',
      downloadsCount: 198,
      viewsCount: 672,
      createdAt: '2026-10-08T15:00:00.000Z',
      updatedAt: '2026-10-08T15:00:00.000Z',
    }
  ];
}

// Read materials from local json
function readMaterials(): any[] {
  try {
    if (fs.existsSync(MATERIALS_FILE)) {
      const data = fs.readFileSync(MATERIALS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading materials file:', err);
  }
  const initial = getInitialSeedData();
  saveMaterials(initial);
  return initial;
}

// Save materials to local json
function saveMaterials(materials: any[]) {
  try {
    fs.writeFileSync(MATERIALS_FILE, JSON.stringify(materials, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving materials file:', err);
  }
}

// Initialize seed data on startup if not existing
readMaterials();

// --- API ROUTES ---

// Health & Stats
app.get('/api/health', (_req, res) => {
  const materials = readMaterials();
  res.json({
    status: 'ok',
    school: 'TRƯỜNG MẦM NON HẢI TÂN',
    repositoryName: 'KHO DỮ LIỆU ÂM NHẠC MẦM NON',
    totalMaterials: materials.length,
    timestamp: new Date().toISOString(),
  });
});

// GET all materials
app.get('/api/materials', (req, res) => {
  try {
    const { category, ageGroup, theme, search } = req.query;
    let list = readMaterials();

    if (category && category !== 'tat_ca') {
      list = list.filter((m) => m.category === category);
    }
    if (ageGroup && ageGroup !== 'tat_ca') {
      list = list.filter((m) => m.ageGroup === ageGroup || m.ageGroup === 'tat_ca');
    }
    if (theme && theme !== 'Tất cả chủ đề') {
      list = list.filter((m) => m.theme === theme);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description?.toLowerCase().includes(q) ||
          m.author?.toLowerCase().includes(q) ||
          m.lyrics?.toLowerCase().includes(q) ||
          m.fileName?.toLowerCase().includes(q)
      );
    }

    // Sort by latest by default
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi đọc dữ liệu' });
  }
});

// GET single material
app.get('/api/materials/:id', (req, res) => {
  const list = readMaterials();
  const found = list.find((m) => m.id === req.params.id);
  if (!found) {
    return res.status(404).json({ error: 'Không tìm thấy học liệu' });
  }
  res.json(found);
});

// CREATE a material
app.post('/api/materials', (req, res) => {
  try {
    const item = req.body;
    if (!item.title || !item.category) {
      return res.status(400).json({ error: 'Tiêu đề và danh mục là bắt buộc' });
    }

    const list = readMaterials();
    const newMaterial = {
      ...item,
      id: item.id || `mat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewsCount: item.viewsCount || 0,
      downloadsCount: item.downloadsCount || 0,
      storageSource: item.storageSource || 'server',
    };

    // If an item with same ID exists, update it, else prepend
    const existingIndex = list.findIndex((m) => m.id === newMaterial.id);
    if (existingIndex >= 0) {
      list[existingIndex] = newMaterial;
    } else {
      list.unshift(newMaterial);
    }

    saveMaterials(list);
    res.status(201).json(newMaterial);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi thêm học liệu' });
  }
});

// UPDATE a material
app.put('/api/materials/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const list = readMaterials();
    const index = list.findIndex((m) => m.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Không tìm thấy học liệu cần sửa' });
    }

    list[index] = {
      ...list[index],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    saveMaterials(list);
    res.json(list[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi cập nhật học liệu' });
  }
});

// DELETE a material
app.delete('/api/materials/:id', (req, res) => {
  try {
    const { id } = req.params;
    let list = readMaterials();
    const item = list.find((m) => m.id === id);

    if (!item) {
      return res.status(404).json({ error: 'Không tìm thấy học liệu cần xóa' });
    }

    list = list.filter((m) => m.id !== id);
    saveMaterials(list);

    // If local file exists, try delete
    if (item.fileUrl && item.fileUrl.startsWith('/uploads/')) {
      const filePath = path.resolve(DATA_DIR, item.fileUrl.replace('/', ''));
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn('Could not remove file:', filePath);
        }
      }
    }

    res.json({ success: true, message: 'Đã xóa học liệu thành công' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi xóa học liệu' });
  }
});

// UPLOAD a file (audio, video, document, image)
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Không có tệp nào được tải lên' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    res.json({
      fileUrl,
      fileName: originalName,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
      storageSource: 'server',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi tải tệp lên' });
  }
});

// Increment views
app.post('/api/materials/:id/view', (req, res) => {
  const list = readMaterials();
  const item = list.find((m) => m.id === req.params.id);
  if (item) {
    item.viewsCount = (item.viewsCount || 0) + 1;
    saveMaterials(list);
    return res.json({ viewsCount: item.viewsCount });
  }
  res.status(404).json({ error: 'Không tìm thấy' });
});

// Increment downloads & download helper
app.post('/api/materials/:id/download', (req, res) => {
  const list = readMaterials();
  const item = list.find((m) => m.id === req.params.id);
  if (item) {
    item.downloadsCount = (item.downloadsCount || 0) + 1;
    saveMaterials(list);
    return res.json({ downloadsCount: item.downloadsCount, fileUrl: item.fileUrl });
  }
  res.status(404).json({ error: 'Không tìm thấy' });
});

// SYNC BATCH endpoint (from Supabase or backup)
app.post('/api/sync-batch', (req, res) => {
  try {
    const { materials } = req.body;
    if (!Array.isArray(materials)) {
      return res.status(400).json({ error: 'materials phải là mảng' });
    }

    const currentList = readMaterials();
    const map = new Map<string, any>();
    currentList.forEach((m) => map.set(m.id, m));
    materials.forEach((m) => map.set(m.id, m));

    const merged = Array.from(map.values());
    saveMaterials(merged);

    res.json({ success: true, count: merged.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Start dev or production server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
