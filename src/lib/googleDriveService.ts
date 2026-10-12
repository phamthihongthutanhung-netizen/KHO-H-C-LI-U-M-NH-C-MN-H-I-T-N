import { MusicMaterial } from '../types/material';

export const DRIVE_FOLDER_NAME = 'KHO DỮ LIỆU ÂM NHẠC MẦM NON - TRƯỜNG MN HẢI TÂN';
export const DRIVE_INDEX_FILE_NAME = 'materials_index.json';

interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

// 1. Get or create the main folder on Google Drive
export async function getOrCreateDriveFolder(accessToken: string): Promise<DriveFolderInfo> {
  const query = `name = '${DRIVE_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Lỗi kết nối Google Drive (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: DRIVE_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Thư mục chính lưu trữ kho học liệu âm nhạc của Trường Mầm non Hải Tân',
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Không thể tạo thư mục trên Google Drive: ${errorText}`);
  }

  return await createRes.json();
}

// 2. Upload file to Drive inside the school folder
export async function uploadFileToDrive(
  accessToken: string,
  file: File,
  folderId: string
): Promise<{
  fileId: string;
  name: string;
  webViewLink: string;
  webContentLink?: string;
  size: number;
  mimeType: string;
}> {
  const metadata = {
    name: file.name,
    parents: [folderId],
    description: `Học liệu âm nhạc tải lên từ website Trường MN Hải Tân vào ${new Date().toLocaleDateString('vi-VN')}`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const fileHeaderPart = `${delimiter}Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const fileBuffer = await file.arrayBuffer();

  const bodyBlob = new Blob(
    [
      metadataPart,
      fileHeaderPart,
      fileBuffer,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,size,mimeType',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: bodyBlob,
    }
  );

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Lỗi tải tệp lên Google Drive (${uploadRes.status}): ${errorText}`);
  }

  const uploadedData = await uploadRes.json();

  // Try to make file viewable for anyone with link (shared within school)
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${uploadedData.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('Could not set public permission on file, keeping owner access:', permErr);
  }

  return {
    fileId: uploadedData.id,
    name: uploadedData.name,
    webViewLink: uploadedData.webViewLink || `https://drive.google.com/file/d/${uploadedData.id}/view`,
    webContentLink: uploadedData.webContentLink,
    size: Number(uploadedData.size || file.size),
    mimeType: uploadedData.mimeType || file.type,
  };
}

// 3. Save materials master index to Drive
export async function saveMaterialsIndexToDrive(
  accessToken: string,
  folderId: string,
  materials: MusicMaterial[]
): Promise<string> {
  // Check if materials_index.json already exists in folder
  const query = `name = '${DRIVE_INDEX_FILE_NAME}' and '${folderId}' in parents and trashed = false`;
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const listData = await listRes.json();
  const existingFile = listData.files?.[0];

  const content = JSON.stringify(materials, null, 2);

  if (existingFile) {
    // Update existing file content
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: content,
      }
    );

    if (!updateRes.ok) {
      throw new Error('Lỗi cập nhật index học liệu trên Google Drive');
    }
    return existingFile.id;
  } else {
    // Create new file
    const metadata = {
      name: DRIVE_INDEX_FILE_NAME,
      parents: [folderId],
      description: 'Chỉ mục toàn bộ học liệu âm nhạc Trường MN Hải Tân',
    };

    const boundary = '-------IndexBoundary98765';
    const body = new Blob(
      [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n`,
        `--${boundary}--`,
      ],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const createRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: body,
      }
    );

    if (!createRes.ok) {
      throw new Error('Lỗi tạo mới index học liệu trên Google Drive');
    }
    const created = await createRes.json();
    return created.id;
  }
}

// 4. Load materials index from Drive
export async function loadMaterialsIndexFromDrive(
  accessToken: string,
  folderId: string
): Promise<MusicMaterial[] | null> {
  const query = `name = '${DRIVE_INDEX_FILE_NAME}' and '${folderId}' in parents and trashed = false`;
  const listRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!listRes.ok) return null;
  const listData = await listRes.json();
  const file = listData.files?.[0];
  if (!file) return null;

  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!contentRes.ok) return null;
  const materials: MusicMaterial[] = await contentRes.json();
  return materials;
}

// 5. Delete a file from Google Drive (Requires explicit confirmation by caller)
export async function deleteFileFromDrive(accessToken: string, fileId: string): Promise<boolean> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.ok || res.status === 204;
}
