"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  Video, 
  File, 
  Download,
  Eye,
  FileImage,
  FileVideo,
  FileArchive
} from "lucide-react";

interface EvidenceGalleryProps {
  evidenceSummary: {
    totalFiles: number;
    filesByType: {
      images: number;
      documents: number;
      videos: number;
      other: number;
    };
    evidenceQuality: {
      high: number;
      medium: number;
      low: number;
    };
    evidenceUrls: string[];
  };
}

export function EvidenceGallery({ evidenceSummary }: EvidenceGalleryProps) {
  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-green-600" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(extension || '')) {
      return <Video className="h-5 w-5 text-red-600" />;
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return <FileArchive className="h-5 w-5 text-purple-600" />;
    }
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'Image';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'mkv'].includes(extension || '')) {
      return 'Video';
    }
    if (['pdf', 'doc', 'docx', 'txt'].includes(extension || '')) {
      return 'Document';
    }
    if (['zip', 'rar', '7z'].includes(extension || '')) {
      return 'Archive';
    }
    return 'Other';
  };

  const getFileName = (url: string) => {
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Unknown File';
  };

  return (
    <div className="space-y-6">
      {/* Evidence Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Evidence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Total Files */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {evidenceSummary.totalFiles}
              </div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>

            {/* File Types */}
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {evidenceSummary.filesByType.images}
              </div>
              <div className="text-sm text-muted-foreground">Images</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {evidenceSummary.filesByType.videos}
              </div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {evidenceSummary.filesByType.documents}
              </div>
              <div className="text-sm text-muted-foreground">Documents</div>
            </div>
          </div>

          {/* Quality Distribution */}
          <div className="mt-6">
            <h4 className="font-medium mb-3">Evidence Quality Distribution</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {evidenceSummary.evidenceQuality.high}
                </div>
                <div className="text-sm text-muted-foreground">High Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {evidenceSummary.evidenceQuality.medium}
                </div>
                <div className="text-sm text-muted-foreground">Medium Quality</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {evidenceSummary.evidenceQuality.low}
                </div>
                <div className="text-sm text-muted-foreground">Low Quality</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Gallery */}
      {evidenceSummary.evidenceUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Files ({evidenceSummary.evidenceUrls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidenceSummary.evidenceUrls.map((url, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(url)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {getFileName(url)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {getFileType(url)}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="h-3 w-3" />
                          View
                        </a>
                        <a
                          href={url}
                          download
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>File Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(evidenceSummary.filesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {type === 'images' && <FileImage className="h-5 w-5 text-green-600" />}
                  {type === 'videos' && <FileVideo className="h-5 w-5 text-red-600" />}
                  {type === 'documents' && <FileText className="h-5 w-5 text-blue-600" />}
                  {type === 'other' && <File className="h-5 w-5 text-gray-600" />}
                  <div>
                    <div className="font-medium capitalize">{type}</div>
                    <div className="text-sm text-muted-foreground">
                      {((count / evidenceSummary.totalFiles) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">{count} files</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 