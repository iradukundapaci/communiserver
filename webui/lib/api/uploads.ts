// File upload service for Minio integration
import { getAuthTokens } from "./auth";

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  contentType: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Upload a file to Minio storage
 * @param file File to upload
 * @param folder Optional folder path (e.g., 'reports', 'activities')
 * @param onProgress Optional progress callback
 * @returns Promise with upload response containing the file URL
 */
export async function uploadFile(
  file: File,
  folder: string = 'uploads',
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    // Create XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.payload);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      // Start upload
      xhr.open('POST', '/api/v1/uploads');
      xhr.setRequestHeader('Authorization', `Bearer ${tokens.accessToken}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

/**
 * Upload multiple files to Minio storage
 * @param files Array of files to upload
 * @param folder Optional folder path
 * @param onProgress Optional progress callback for each file
 * @returns Promise with array of upload responses
 */
export async function uploadMultipleFiles(
  files: File[],
  folder: string = 'uploads',
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResponse[]> {
  const uploadPromises = files.map((file, index) => 
    uploadFile(
      file, 
      folder, 
      onProgress ? (progress) => onProgress(index, progress) : undefined
    )
  );

  return Promise.all(uploadPromises);
}

/**
 * Delete a file from Minio storage
 * @param url File URL to delete
 * @returns Promise with success message
 */
export async function deleteFile(url: string): Promise<string> {
  try {
    const tokens = getAuthTokens();

    if (!tokens) {
      throw new Error("Not authenticated");
    }

    const response = await fetch('/api/v1/uploads', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete file');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error("Delete file error:", error);
    throw error;
  }
}

/**
 * Get file info from URL
 * @param url File URL
 * @returns File info object
 */
export function getFileInfo(url: string): {
  filename: string;
  extension: string;
  isImage: boolean;
  isDocument: boolean;
} {
  const filename = url.split('/').pop() || '';
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

  return {
    filename,
    extension,
    isImage: imageExtensions.includes(extension),
    isDocument: documentExtensions.includes(extension),
  };
}

/**
 * Format file size in human readable format
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * @param filename The filename
 * @returns File extension
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file type is allowed
 * @param file File to check
 * @param allowedTypes Array of allowed MIME types
 * @returns Boolean indicating if file type is allowed
 */
export function isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.length === 0 || allowedTypes.includes(file.type);
}

/**
 * Validate file size
 * @param file File to validate
 * @param maxSizeInMB Maximum file size in MB
 * @returns Boolean indicating if file size is valid
 */
export function isFileSizeValid(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

/**
 * Validate file before upload
 * @param file File to validate
 * @param maxSize Maximum file size in bytes (default: 10MB)
 * @param allowedTypes Array of allowed MIME types
 * @returns Validation result
 */
export function validateFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = []
): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${formatFileSize(maxSize)} limit`
    };
  }

  // Check file type if specified
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  return { isValid: true };
}

// Common file type constants
export const FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ],
  ALL: ['*/*']
};
