import { MusicMaterial } from '../types/material';
import { getSupabaseClient, getStoredSupabaseConfig } from './supabaseClient';
import {
  uploadFileToDrive,
  saveMaterialsIndexToDrive,
  loadMaterialsIndexFromDrive,
  deleteFileFromDrive,
} from './googleDriveService';

export interface FilterOptions {
  category?: string;
  ageGroup?: string;
  theme?: string;
  search?: string;
}

// Convert DB snake_case to CamelCase
function mapFromSupabaseRow(row: any): MusicMaterial {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    ageGroup: row.age_group || row.ageGroup,
    theme: row.theme,
    description: row.description || '',
    lyrics: row.lyrics || undefined,
    gameRules: row.game_rules || row.gameRules || undefined,
    instrumentGuide: row.instrument_guide || row.instrumentGuide || undefined,
    author: row.author,
    fileUrl: row.file_url || row.fileUrl,
    fileName: row.file_name || row.fileName,
    fileSize: Number(row.file_size || row.fileSize || 0),
    fileType: row.file_type || row.fileType || '',
    thumbnailUrl: row.thumbnail_url || row.thumbnailUrl || undefined,
    externalLink: row.external_link || row.externalLink || undefined,
    storageSource: row.storage_source || 'supabase',
    downloadsCount: Number(row.downloads_count || row.downloadsCount || 0),
    viewsCount: Number(row.views_count || row.viewsCount || 0),
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  };
}

// Convert CamelCase to DB snake_case for Supabase
function mapToSupabaseRow(item: MusicMaterial): any {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    age_group: item.ageGroup,
    theme: item.theme,
    description: item.description,
    lyrics: item.lyrics || null,
    game_rules: item.gameRules || null,
    instrument_guide: item.instrumentGuide || null,
    author: item.author,
    file_url: item.fileUrl,
    file_name: item.fileName,
    file_size: item.fileSize,
    file_type: item.fileType,
    thumbnail_url: item.thumbnailUrl || null,
    external_link: item.externalLink || null,
    storage_source: item.storageSource,
    downloads_count: item.downloadsCount,
    views_count: item.viewsCount,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  };
}

export async function fetchMaterials(filters?: FilterOptions): Promise<{
  materials: MusicMaterial[];
  source: 'supabase' | 'server';
}> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // Try Supabase first if configured
  if (supabase && config.isConnected) {
    try {
      let query = supabase
        .from(config.tableName || 'music_materials')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.category && filters.category !== 'tat_ca') {
        query = query.eq('category', filters.category);
      }
      if (filters?.ageGroup && filters.ageGroup !== 'tat_ca') {
        query = query.or(`age_group.eq.${filters.ageGroup},age_group.eq.tat_ca`);
      }
      if (filters?.theme && filters.theme !== 'Tất cả chủ đề') {
        query = query.eq('theme', filters.theme);
      }
      if (filters?.search && filters.search.trim()) {
        const s = filters.search.trim();
        query = query.or(`title.ilike.%${s}%,author.ilike.%${s}%,description.ilike.%${s}%,file_name.ilike.%${s}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        const mapped = data.map(mapFromSupabaseRow);
        return { materials: mapped, source: 'supabase' };
      }
      console.warn('Supabase query error, falling back to server:', error?.message);
    } catch (e) {
      console.warn('Supabase fetch failed, falling back to server:', e);
    }
  }

  // Fallback to Server API
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.ageGroup) params.set('ageGroup', filters.ageGroup);
  if (filters?.theme) params.set('theme', filters.theme);
  if (filters?.search) params.set('search', filters.search);

  const res = await fetch(`/api/materials?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Không thể tải danh sách học liệu từ máy chủ');
  }
  const data = await res.json();
  return { materials: data, source: 'server' };
}
 
export async function uploadMaterialFile(
  file: File,
  driveOptions?: { accessToken: string; folderId: string }
): Promise<{
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageSource: 'drive' | 'supabase' | 'server';
  driveFileId?: string;
}> {
  // Try Google Drive first if authenticated
  if (driveOptions?.accessToken && driveOptions?.folderId) {
    try {
      const driveUploaded = await uploadFileToDrive(
        driveOptions.accessToken,
        file,
        driveOptions.folderId
      );
      return {
        fileUrl: driveUploaded.webViewLink,
        fileName: driveUploaded.name,
        fileSize: driveUploaded.size,
        fileType: driveUploaded.mimeType,
        storageSource: 'drive',
        driveFileId: driveUploaded.fileId,
      };
    } catch (driveErr) {
      console.warn('Google Drive upload failed, falling back to other storage:', driveErr);
    }
  }

  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  // Try Supabase Storage first if configured
  if (supabase && config.isConnected) {
    try {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filePath = `uploads/${timestamp}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from(config.bucketName || 'music_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from(config.bucketName || 'music_files')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          return {
            fileUrl: publicUrlData.publicUrl,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type || 'application/octet-stream',
            storageSource: 'supabase',
          };
        }
      }
      console.warn('Supabase storage upload failed, fallback to server upload:', uploadError?.message);
    } catch (e) {
      console.warn('Supabase upload exception, fallback to server upload:', e);
    }
  }

  // Fallback to Express /api/upload
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Tải tệp lên máy chủ thất bại');
  }

  const uploaded = await res.json();
  return {
    ...uploaded,
    storageSource: 'server',
  };
}

export async function saveMaterial(material: MusicMaterial): Promise<MusicMaterial> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  let savedItem = material;

  // If Supabase is active, save to Supabase
  if (supabase && config.isConnected) {
    try {
      const row = mapToSupabaseRow(material);
      const { data, error } = await supabase
        .from(config.tableName || 'music_materials')
        .upsert(row)
        .select()
        .single();

      if (!error && data) {
        savedItem = mapFromSupabaseRow(data);
      } else {
        console.warn('Could not save to Supabase, saving to server:', error?.message);
      }
    } catch (e) {
      console.warn('Supabase upsert failed:', e);
    }
  }

  // Always save to Server API as well for dual-sync and offline resilience
  try {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(savedItem),
    });
    if (res.ok) {
      const serverResult = await res.json();
      return serverResult;
    }
  } catch (err) {
    console.warn('Server save fallback error:', err);
  }

  return savedItem;
}

export async function deleteMaterial(
  id: string,
  driveOptions?: { accessToken: string; driveFileId?: string }
): Promise<boolean> {
  // If stored in Google Drive, delete from Drive
  if (driveOptions?.accessToken && driveOptions.driveFileId) {
    try {
      await deleteFileFromDrive(driveOptions.accessToken, driveOptions.driveFileId);
    } catch (driveErr) {
      console.warn('Failed deleting file from Google Drive:', driveErr);
    }
  }

  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (supabase && config.isConnected) {
    try {
      await supabase
        .from(config.tableName || 'music_materials')
        .delete()
        .eq('id', id);
    } catch (e) {
      console.warn('Failed deleting from Supabase:', e);
    }
  }

  // Delete on server
  try {
    const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (err) {
    console.error('Delete on server failed:', err);
    return false;
  }
}

export async function recordView(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (supabase && config.isConnected) {
    try {
      await supabase.rpc('increment_material_views', { material_id: id });
    } catch (e) {
      // Ignored if RPC function is not created
    }
  }
  fetch(`/api/materials/${id}/view`, { method: 'POST' }).catch(() => {});
}

export async function recordDownload(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (supabase && config.isConnected) {
    try {
      await supabase.rpc('increment_material_downloads', { material_id: id });
    } catch (e) {
      // Ignored if RPC function is not created
    }
  }
  fetch(`/api/materials/${id}/download`, { method: 'POST' }).catch(() => {});
}

export async function testSupabaseConnection(
  url: string,
  key: string,
  bucketName = 'music_files'
): Promise<{ success: boolean; message: string; tableReady: boolean; bucketReady: boolean }> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const testClient = createClient(url.trim(), key.trim(), {
      auth: { persistSession: false },
    });

    // Check table
    const { data: tableData, error: tableError } = await testClient
      .from('music_materials')
      .select('id')
      .limit(1);

    const tableReady = !tableError;

    // Check bucket
    const { data: buckets, error: bucketError } = await testClient.storage.listBuckets();
    const bucketReady = !bucketError && !!buckets?.some((b) => b.name === bucketName || b.id === bucketName);

    if (tableReady && bucketReady) {
      return {
        success: true,
        message: 'Kết nối Supabase hoàn toàn thành công! Bảng dữ liệu và Storage Bucket đã sẵn sàng.',
        tableReady: true,
        bucketReady: true,
      };
    } else if (tableReady) {
      return {
        success: true,
        message: `Đã kết nối Database! Tuy nhiên chưa tìm thấy Storage Bucket '${bucketName}'. Bạn có thể tạo bucket '${bucketName}' ở chế độ Public.`,
        tableReady: true,
        bucketReady: false,
      };
    } else {
      return {
        success: false,
        message: `Đã kết nối máy chủ Supabase nhưng chưa có bảng 'music_materials'. Hãy sao chép mã SQL và chạy trong SQL Editor để tự động tạo bảng và bucket!`,
        tableReady: false,
        bucketReady: bucketReady,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể kết nối tới Supabase: ${err.message || 'Kiểm tra lại URL hoặc Anon Key'}`,
      tableReady: false,
      bucketReady: false,
    };
  }
}

export async function syncAllToSupabase(): Promise<{ count: number; error?: string }> {
  const supabase = getSupabaseClient();
  const config = getStoredSupabaseConfig();

  if (!supabase || !config.isConnected) {
    return { count: 0, error: 'Chưa cấu hình Supabase' };
  }

  // Get all from local server
  const res = await fetch('/api/materials');
  if (!res.ok) throw new Error('Không đọc được dữ liệu từ máy chủ');
  const serverMaterials: MusicMaterial[] = await res.json();

  let count = 0;
  for (const m of serverMaterials) {
    const row = mapToSupabaseRow(m);
    const { error } = await supabase.from(config.tableName || 'music_materials').upsert(row);
    if (!error) count++;
  }

  return { count };
}
