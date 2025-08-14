/**
 * Advanced File Upload Component with MinIO S3 Integration
 * Supports drag & drop, multiple files, image preview, and progress tracking
 */
'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, File, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api/client';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  key: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  preview?: string;
}

export interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileRemoved?: (fileId: string) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  folder?: string;
  multiple?: boolean;
  showPreview?: boolean;
  className?: string;
  disabled?: boolean;
  resize?: {
    width?: number;
    height?: number;
    quality?: number;
  };
  generateThumbnail?: boolean;
}

export function FileUpload({
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', 'video/*'],
  folder = 'uploads',
  multiple = true,
  showPreview = true,
  className = '',
  disabled = false,
  resize,
  generateThumbnail = true,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return;

      // Check file limits
      const totalFiles = files.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      // Create file objects with initial state
      const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        url: '',
        key: '',
        status: 'uploading' as const,
        progress: 0,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Upload files
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const fileObj = newFiles[i];
        try {
          await uploadFile(file, fileObj);
        } catch (error) {
          updateFileStatus(fileObj.id, 'error', 0, error instanceof Error ? error.message : 'Upload failed');
        }
      }
    },
    [disabled, files.length, maxFiles, uploadFile]
  );

  const uploadFile = async (file: File, fileObj: UploadedFile) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    if (resize) {
      if (resize.width) formData.append('resize_width', resize.width.toString());
      if (resize.height) formData.append('resize_height', resize.height.toString());
      if (resize.quality) formData.append('quality', resize.quality.toString());
    }
    
    if (generateThumbnail) {
      formData.append('generate_thumbnail', 'true');
    }

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        updateFileProgress(fileObj.id, (prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await apiClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);

      if (response.success && response.data) {
        updateFileStatus(fileObj.id, 'success', 100);
        updateFileData(fileObj.id, {
          url: (response.data as any).url,
          key: (response.data as any).key,
        });
      } else {
        throw new Error(response.error?.message || 'Upload failed');
      }
    } catch (error) {
      updateFileStatus(fileObj.id, 'error', 0, error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const updateFileStatus = (
    fileId: string,
    status: UploadedFile['status'],
    progress: number,
    error?: string
  ) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, status, progress, error }
          : file
      )
    );
  };

  const updateFileProgress = (fileId: string, progressFn: (prev: number) => number) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, progress: progressFn(file.progress) }
          : file
      )
    );
  };

  const updateFileData = (fileId: string, data: Partial<UploadedFile>) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? { ...file, ...data }
          : file
      )
    );
  };

  const removeFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      // Clean up preview URL
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      // Remove from state
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      
      // Notify parent
      onFileRemoved?.(fileId);
    }
  };

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple,
    disabled,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  // Notify parent when files are successfully uploaded
  React.useEffect(() => {
    const successfulFiles = files.filter((f) => f.status === 'success');
    if (successfulFiles.length > 0) {
      onFilesUploaded?.(successfulFiles);
    }
  }, [files, onFilesUploaded]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive || dropzoneActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <CardContent className="p-6">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} ref={fileInputRef} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive || dropzoneActive
                  ? 'Drop files here'
                  : 'Drag & drop files here, or click to select'}
              </p>
              <p className="text-sm text-muted-foreground">
                Supports: {acceptedTypes.join(', ')} • Max size: {formatFileSize(maxSize)} • Max files: {maxFiles}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Select Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Files ({files.length})</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {showPreview && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        {getFileIcon(file.type)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={file.status === 'success' ? 'default' : file.status === 'error' ? 'destructive' : 'secondary'}>
                          {file.status}
                        </Badge>
                        {getStatusIcon(file.status)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2 h-1" />
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-500 mt-1">{file.error}</p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}