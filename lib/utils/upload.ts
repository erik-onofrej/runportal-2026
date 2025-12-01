import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

/**
 * File Upload Utility
 * Handles file uploads to local storage in /public/uploads/
 */

// Upload folder structure
export const UPLOAD_FOLDERS = {
  events: 'events',
  organizers: 'organizers',
  partners: 'partners',
  attachments: 'attachments',
  galleries: 'galleries',
} as const;

export type UploadFolder = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

// File type configurations
export const FILE_TYPES = {
  image: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  document: {
    extensions: ['.pdf', '.doc', '.docx'],
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  all: {
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf', '.doc', '.docx'],
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
} as const;

export type FileType = keyof typeof FILE_TYPES;

/**
 * Upload a file to local storage
 * @param file - The file to upload (FormData File or Buffer)
 * @param folder - The upload folder (events, organizers, etc.)
 * @param fileType - Type validation (image, document, all)
 * @returns The public URL path to the uploaded file
 */
export async function uploadFile(
  file: File | Buffer,
  folder: UploadFolder,
  fileType: FileType = 'all',
  originalName?: string
): Promise<string> {
  // Get file details
  let fileName: string;
  let fileBuffer: Buffer;
  let fileSize: number;
  let mimeType: string | undefined;

  if (file instanceof Buffer) {
    if (!originalName) {
      throw new Error('Original filename required when uploading Buffer');
    }
    fileName = originalName;
    fileBuffer = file;
    fileSize = file.length;
  } else {
    const fileObj = file as File;
    fileName = fileObj.name;
    fileBuffer = Buffer.from(await fileObj.arrayBuffer());
    fileSize = fileObj.size;
    mimeType = fileObj.type;
  }

  // Validate file type
  validateFileType(fileName, mimeType, fileType);

  // Validate file size
  const config = FILE_TYPES[fileType];
  if (fileSize > config.maxSize) {
    throw new Error(
      `File size exceeds maximum allowed size of ${config.maxSize / 1024 / 1024}MB`
    );
  }

  // Generate unique filename
  const uniqueFileName = generateUniqueFilename(fileName);

  // Ensure upload directory exists
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  await ensureDirectoryExists(uploadDir);

  // Write file
  const filePath = path.join(uploadDir, uniqueFileName);
  await fs.writeFile(filePath, fileBuffer);

  // Return public URL path
  return `/uploads/${folder}/${uniqueFileName}`;
}

/**
 * Delete a file from storage
 * @param publicPath - The public URL path (e.g., /uploads/events/filename.jpg)
 */
export async function deleteFile(publicPath: string): Promise<void> {
  if (!publicPath.startsWith('/uploads/')) {
    throw new Error('Invalid file path - must start with /uploads/');
  }

  const filePath = path.join(process.cwd(), 'public', publicPath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File might not exist, which is fine
    if ((error as any).code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Validate file type based on extension and MIME type
 */
export function validateFileType(
  fileName: string,
  mimeType: string | undefined,
  fileType: FileType
): void {
  const config = FILE_TYPES[fileType];

  // Check extension
  const ext = path.extname(fileName).toLowerCase();
  if (!(config.extensions as readonly string[]).includes(ext)) {
    throw new Error(
      `Invalid file type. Allowed types: ${config.extensions.join(', ')}`
    );
  }

  // Check MIME type if provided
  if (mimeType && !(config.mimeTypes as readonly string[]).includes(mimeType)) {
    throw new Error(
      `Invalid MIME type. Allowed types: ${config.mimeTypes.join(', ')}`
    );
  }
}

/**
 * Generate a unique filename
 * Format: {timestamp}-{uuid}-{sanitized-original-name}
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const uuid = randomUUID().split('-')[0]; // Use first part of UUID for brevity
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);

  // Sanitize filename - remove special characters, replace spaces with hyphens
  const sanitized = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${timestamp}-${uuid}-${sanitized}${ext}`;
}

/**
 * Ensure a directory exists, create it if it doesn't
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Get file info from public path
 */
export async function getFileInfo(publicPath: string): Promise<{
  exists: boolean;
  size?: number;
  mimeType?: string;
}> {
  if (!publicPath.startsWith('/uploads/')) {
    return { exists: false };
  }

  const filePath = path.join(process.cwd(), 'public', publicPath);

  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // Determine MIME type from extension
    let mimeType: string | undefined;
    if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';
    else if (ext === '.gif') mimeType = 'image/gif';
    else if (ext === '.pdf') mimeType = 'application/pdf';

    return {
      exists: true,
      size: stats.size,
      mimeType,
    };
  } catch {
    return { exists: false };
  }
}

/**
 * List files in an upload folder
 */
export async function listFiles(folder: UploadFolder): Promise<
  Array<{
    filename: string;
    publicPath: string;
    size: number;
    createdAt: Date;
  }>
> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

  try {
    const files = await fs.readdir(uploadDir);
    const fileInfos = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadDir, filename);
        const stats = await fs.stat(filePath);

        return {
          filename,
          publicPath: `/uploads/${folder}/${filename}`,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      })
    );

    return fileInfos.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  } catch {
    return [];
  }
}

/**
 * Clean up old files in a folder (older than specified days)
 */
export async function cleanupOldFiles(
  folder: UploadFolder,
  daysOld: number
): Promise<number> {
  const files = await listFiles(folder);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  let deletedCount = 0;

  for (const file of files) {
    if (file.createdAt < cutoffDate) {
      await deleteFile(file.publicPath);
      deletedCount++;
    }
  }

  return deletedCount;
}
