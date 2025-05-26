"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  uploadFile,
  UploadResponse,
  formatFileSize,
  isFileTypeAllowed,
  isFileSizeValid,
  getFileExtension,
} from "@/lib/api/upload";
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  Video,
  Music,
  Archive,
  AlertCircle,
  ExternalLink,
  RotateCcw,
} from "lucide-react";
import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesUploaded: (urls: string[]) => void;
  uploadedFiles: string[];
  maxFiles?: number;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  accept?: string;
  multiple?: boolean;
  onUploadStatusChange?: (isUploading: boolean, hasErrors: boolean) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
  url?: string;
  error?: string;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "video/mp4",
  "video/mpeg",
  "audio/mpeg",
  "audio/wav",
  "application/zip",
  "application/x-rar-compressed",
];

export function FileUpload({
  onFilesUploaded,
  uploadedFiles,
  maxFiles = 10,
  maxSizeInMB = 10,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  accept,
  multiple = true,
  onUploadStatusChange,
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track upload status and notify parent component
  useEffect(() => {
    const isUploading = uploadingFiles.some(f => f.status === "uploading");
    const hasErrors = uploadingFiles.some(f => f.status === "error");

    if (onUploadStatusChange) {
      onUploadStatusChange(isUploading, hasErrors);
    }
  }, [uploadingFiles, onUploadStatusChange]);

  const getFileIcon = (filename: string) => {
    const extension = getFileExtension(filename);

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="h-4 w-4" />;
    }
    if (['pdf'].includes(extension)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (['mp4', 'mpeg', 'avi', 'mov'].includes(extension)) {
      return <Video className="h-4 w-4 text-blue-500" />;
    }
    if (['mp3', 'wav', 'ogg'].includes(extension)) {
      return <Music className="h-4 w-4 text-green-500" />;
    }
    if (['zip', 'rar', '7z'].includes(extension)) {
      return <Archive className="h-4 w-4 text-yellow-500" />;
    }
    return <File className="h-4 w-4" />;
  };

  const validateFile = useCallback((file: File): string | null => {
    if (!isFileTypeAllowed(file, allowedTypes)) {
      return `File type ${file.type} is not allowed`;
    }
    if (!isFileSizeValid(file, maxSizeInMB)) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }
    return null;
  }, [allowedTypes, maxSizeInMB]);

  const uploadSingleFile = useCallback(async (file: File): Promise<string | null> => {
    const uploadingFile: UploadingFile = {
      file,
      progress: 0,
      status: "uploading",
    };

    setUploadingFiles(prev => [...prev, uploadingFile]);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.file === file && f.status === "uploading"
              ? { ...f, progress: Math.min(f.progress + 10, 90) }
              : f
          )
        );
      }, 200);

      const response: UploadResponse = await uploadFile(file);

      clearInterval(progressInterval);

      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, progress: 100, status: "completed", url: response.url }
            : f
        )
      );

      toast.success(`${file.name} uploaded successfully`);
      return response.url;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setUploadingFiles(prev =>
        prev.map(f =>
          f.file === file
            ? { ...f, status: "error", error: errorMessage }
            : f
        )
      );

      toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
      return null;
    }
  }, []);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      // Check if adding these files would exceed the limit
      const totalFiles = uploadedFiles.length + uploadingFiles.filter(f => f.status === "completed").length + fileArray.length;
      if (totalFiles > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          toast.error(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      // Upload all valid files and collect URLs
      const uploadPromises = validFiles.map(file => uploadSingleFile(file));
      const uploadResults = await Promise.all(uploadPromises);

      // Filter out failed uploads (null values) and add successful URLs
      const successfulUrls = uploadResults.filter((url): url is string => url !== null);

      if (successfulUrls.length > 0) {
        onFilesUploaded([...uploadedFiles, ...successfulUrls]);
      }

      // Show summary message
      if (successfulUrls.length === validFiles.length) {
        toast.success(`All ${validFiles.length} files uploaded successfully`);
      } else if (successfulUrls.length > 0) {
        toast.warning(`${successfulUrls.length} of ${validFiles.length} files uploaded successfully`);
      } else {
        toast.error("All file uploads failed");
      }
    },
[uploadedFiles, uploadingFiles, maxFiles, validateFile, uploadSingleFile, onFilesUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  const removeUploadedFile = (urlToRemove: string) => {
    const updatedFiles = uploadedFiles.filter(url => url !== urlToRemove);
    onFilesUploaded(updatedFiles);
    toast.success("File removed from list");
  };

  const handleDownloadFile = async (url: string) => {
    try {
      // For direct MinIO URLs, we can use the URL directly
      // If you need presigned URLs for security, uncomment the next line
      // const downloadUrl = await getPresignedDownloadUrl(url);

      window.open(url, '_blank');
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Failed to download file");
    }
  };

  const removeUploadingFile = (fileToRemove: File) => {
    setUploadingFiles(prev => prev.filter(f => f.file !== fileToRemove));
  };

  const retryUpload = async (file: File) => {
    // Remove the failed upload from the list
    setUploadingFiles(prev => prev.filter(f => f.file !== file));

    // Retry the upload
    const url = await uploadSingleFile(file);
    if (url) {
      onFilesUploaded([...uploadedFiles, url]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          isDragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Click to upload or drag and drop files here
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, {maxSizeInMB}MB each
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {uploadingFiles.map((uploadingFile, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-muted rounded-lg"
              >
                {getFileIcon(uploadingFile.file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadingFile.file.size)}
                  </p>
                  {uploadingFile.status === "uploading" && (
                    <Progress value={uploadingFile.progress} className="h-1 mt-1" />
                  )}
                  {uploadingFile.status === "error" && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3 text-red-500" />
                      <p className="text-xs text-red-500">{uploadingFile.error}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {uploadingFile.status === "error" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryUpload(uploadingFile.file);
                      }}
                      className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                      title="Retry upload"
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeUploadingFile(uploadingFile.file);
                    }}
                    className="h-6 w-6 p-0"
                    title="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files ({uploadedFiles.length})</h4>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
            {uploadedFiles.map((url, index) => {
              const filename = url.split('/').pop() || `file-${index + 1}`;
              // Extract original filename from the MinIO filename (remove timestamp and random string)
              const originalFilename = filename.replace(/^\d+_[a-z0-9]+_/, '').replace(/_/g, ' ');

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  {getFileIcon(filename)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" title={originalFilename}>
                      {originalFilename}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(url)}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View/Download
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadedFile(url)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    title="Remove file"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
