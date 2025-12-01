'use server';

import {
  uploadFile,
  deleteFile,
  getFileInfo,
  listFiles,
  cleanupOldFiles,
  validateFileType,
  type UploadFolder,
  type FileType,
} from '@/lib/utils/upload';

/**
 * Upload Actions
 * Server actions for file upload operations
 */

/**
 * Upload a file to storage
 */
export async function uploadFileAction(
  formData: FormData,
  folder: UploadFolder,
  fileType: FileType = 'all'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file = formData.get('file') as File;

    if (!file) {
      return { success: false, error: 'No file provided' };
    }

    const url = await uploadFile(file, folder, fileType);

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFileAction(
  publicPath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteFile(publicPath);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete file',
    };
  }
}

/**
 * Get file information
 */
export async function getFileInfoAction(
  publicPath: string
): Promise<{
  success: boolean;
  info?: { exists: boolean; size?: number; mimeType?: string };
  error?: string;
}> {
  try {
    const info = await getFileInfo(publicPath);
    return { success: true, info };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get file info',
    };
  }
}

/**
 * List files in a folder
 */
export async function listFilesAction(
  folder: UploadFolder
): Promise<{
  success: boolean;
  files?: Array<{
    filename: string;
    publicPath: string;
    size: number;
    createdAt: Date;
  }>;
  error?: string;
}> {
  try {
    const files = await listFiles(folder);
    return { success: true, files };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list files',
    };
  }
}

/**
 * Clean up old files
 */
export async function cleanupOldFilesAction(
  folder: UploadFolder,
  daysOld: number
): Promise<{ success: boolean; deletedCount?: number; error?: string }> {
  try {
    const deletedCount = await cleanupOldFiles(folder, daysOld);
    return { success: true, deletedCount };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to cleanup files',
    };
  }
}

/**
 * Validate file before upload
 */
export async function validateFileAction(
  fileName: string,
  mimeType: string | undefined,
  fileType: FileType
): Promise<{ valid: boolean; error?: string }> {
  try {
    validateFileType(fileName, mimeType, fileType);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid file',
    };
  }
}
