import { apiClient } from '../client';

export interface UploadResult {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  businessId: string;
  uploadedBy: string;
  category: 'product' | 'profile' | 'document' | 'advertisement' | 'other';
  status: 'processing' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadOptions {
  category?: 'product' | 'profile' | 'document' | 'advertisement' | 'other';
  maxSize?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  public?: boolean;
}

export class UploadService {
  // Upload single file
  static async uploadFile(file: File, options?: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    if (options) {
      if (options.category) formData.append('category', options.category);
      if (options.maxSize) formData.append('maxSize', options.maxSize.toString());
      if (options.allowedTypes) formData.append('allowedTypes', JSON.stringify(options.allowedTypes));
      if (options.generateThumbnail !== undefined) formData.append('generateThumbnail', options.generateThumbnail.toString());
      if (options.public !== undefined) formData.append('public', options.public.toString());
    }

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload file');
    }
    return response.data as UploadResult;
  }

  // Upload multiple files
  static async uploadFiles(files: File[], options?: UploadOptions): Promise<UploadResult[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    if (options) {
      if (options.category) formData.append('category', options.category);
      if (options.maxSize) formData.append('maxSize', options.maxSize.toString());
      if (options.allowedTypes) formData.append('allowedTypes', JSON.stringify(options.allowedTypes));
      if (options.generateThumbnail !== undefined) formData.append('generateThumbnail', options.generateThumbnail.toString());
      if (options.public !== undefined) formData.append('public', options.public.toString());
    }

    const response = await apiClient.post('/upload/bulk', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload files');
    }
    return response.data as UploadResult[];
  }

  // Get uploaded files for a business
  static async getUploadedFiles(businessId: string, filters?: {
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ files: UploadResult[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/upload/files', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch uploaded files');
    }
    return response.data as { files: UploadResult[]; total: number; page: number; totalPages: number; };
  }

  // Get upload by ID
  static async getUploadById(id: string): Promise<UploadResult> {
    const response = await apiClient.get(`/upload/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch upload');
    }
    return response.data as UploadResult;
  }

  // Delete upload
  static async deleteUpload(id: string): Promise<void> {
    const response = await apiClient.delete(`/upload/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete upload');
    }
  }

  // Get upload URL (for temporary access)
  static async getUploadUrl(id: string, expiresIn?: number): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.get(`/upload/${id}/url`, { expiresIn });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to get upload URL');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Bulk delete uploads
  static async bulkDeleteUploads(uploadIds: string[]): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/upload/bulk-delete', { uploadIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk delete uploads');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export uploads
  static async exportUploads(filters?: { businessId?: string; category?: string; status?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/upload/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export uploads');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}