import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { MINIO_CONFIG, MINIO_URL } from '../config/minio';

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Create S3 client configured for MinIO
const s3Client = new S3Client({
  endpoint: MINIO_URL,
  region: MINIO_CONFIG.region,
  credentials: {
    accessKeyId: MINIO_CONFIG.accessKey,
    secretAccessKey: MINIO_CONFIG.secretKey,
  },
  forcePathStyle: true, // Required for MinIO
});

/**
 * Generate a unique filename with timestamp and random string
 * @param originalName Original filename
 * @returns Unique filename
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
  const sanitizedName = nameWithoutExtension.replace(/[^a-zA-Z0-9]/g, '_');

  return `${timestamp}_${randomString}_${sanitizedName}.${extension}`;
}

/**
 * Upload a file to MinIO bucket
 * @param file File to upload
 * @returns Promise with upload response containing the file URL
 */
export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    // Generate unique filename
    const filename = generateUniqueFilename(file.name);

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Create upload command
    const command = new PutObjectCommand({
      Bucket: MINIO_CONFIG.bucketName,
      Key: filename,
      Body: new Uint8Array(arrayBuffer),
      ContentType: file.type,
      ContentDisposition: `inline; filename="${file.name}"`,
      Metadata: {
        'original-name': file.name,
        'upload-timestamp': Date.now().toString(),
      },
    });

    // Upload file to MinIO
    await s3Client.send(command);

    // Generate the public URL
    const url = `${MINIO_URL}/${MINIO_CONFIG.bucketName}/${filename}`;

    return {
      url,
      filename,
      size: file.size,
      mimetype: file.type,
    };
  } catch (error) {
    console.error("Upload file error:", error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload multiple files to MinIO bucket
 * @param files Array of files to upload
 * @returns Promise with array of upload responses
 */
export async function uploadFiles(files: File[]): Promise<UploadResponse[]> {
  try {
    const uploadPromises = files.map(file => uploadFile(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Upload files error:", error);
    throw error;
  }
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
  return allowedTypes.includes(file.type);
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
 * Delete a file from MinIO bucket
 * @param fileUrl The full URL of the file to delete
 * @returns Promise indicating success
 */
export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      throw new Error('Invalid file URL');
    }

    const command = new DeleteObjectCommand({
      Bucket: MINIO_CONFIG.bucketName,
      Key: filename,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error("Delete file error:", error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a presigned URL for downloading a file
 * @param fileUrl The full URL of the file
 * @param expiryInSeconds Expiry time in seconds (default: 7 days)
 * @returns Promise with presigned URL
 */
export async function getPresignedDownloadUrl(fileUrl: string, expiryInSeconds: number = 7 * 24 * 60 * 60): Promise<string> {
  try {
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      throw new Error('Invalid file URL');
    }

    const command = new GetObjectCommand({
      Bucket: MINIO_CONFIG.bucketName,
      Key: filename,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: expiryInSeconds });
  } catch (error) {
    console.error("Get presigned URL error:", error);
    throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if a file exists in the bucket
 * @param fileUrl The full URL of the file
 * @returns Promise indicating if file exists
 */
export async function fileExists(fileUrl: string): Promise<boolean> {
  try {
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    if (!filename) {
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: MINIO_CONFIG.bucketName,
      Key: filename,
    });

    await s3Client.send(command);
    return true;
  } catch {
    return false;
  }
}
