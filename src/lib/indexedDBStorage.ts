// IndexedDB for large file storage (much larger capacity than localStorage)

const DB_NAME = 'lot-lounge-link-media';
const STORE_NAME = 'media-files';
const DB_VERSION = 1;

interface MediaFile {
  id: string;
  ownerId: string;
  type: 'photo' | 'video' | 'document';
  data: Blob;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  mimeType: string;
}

let dbInstance: IDBDatabase | null = null;

async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('ownerId', 'ownerId', { unique: false });
        store.createIndex('uploadedAt', 'uploadedAt', { unique: false });
      }
    };
  });
}

async function addMediaFile(file: MediaFile): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(file);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getMediaFilesByOwnerId(ownerId: string): Promise<MediaFile[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('ownerId');
    const request = index.getAll(ownerId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as MediaFile[]);
  });
}

async function getMediaFile(id: string): Promise<MediaFile | null> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

async function deleteMediaFile(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function deleteMediaFilesByOwnerId(ownerId: string): Promise<void> {
  const db = await initDB();
  const files = await getMediaFilesByOwnerId(ownerId);

  for (const file of files) {
    await deleteMediaFile(file.id);
  }
}

async function getAllMediaFiles(): Promise<MediaFile[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as MediaFile[]);
  });
}

// Helper to convert blob to data URL
async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper to convert data URL to blob
function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mimeType });
}

export const indexedDBStorage = {
  initDB,
  addMediaFile,
  getMediaFilesByOwnerId,
  getMediaFile,
  deleteMediaFile,
  deleteMediaFilesByOwnerId,
  getAllMediaFiles,
  blobToDataUrl,
  dataUrlToBlob,
};
