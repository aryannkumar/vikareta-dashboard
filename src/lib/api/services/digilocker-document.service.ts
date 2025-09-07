import { apiClient } from '../client';

export interface DigilockerDocument {
  id: string;
  businessId: string;
  userId?: string;
  documentType: string;
  documentId: string;
  name: string;
  description?: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'revoked' | 'pending';
  verificationStatus: 'verified' | 'pending' | 'failed' | 'not_verified';
  metadata: {
    fileSize?: number;
    mimeType?: string;
    checksum?: string;
    digilockerUri?: string;
    xmlContent?: string;
    pdfContent?: string;
  };
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
}

export interface DigilockerDocumentFilter {
  businessId?: string;
  userId?: string;
  documentType?: string;
  status?: 'active' | 'expired' | 'revoked' | 'pending';
  verificationStatus?: 'verified' | 'pending' | 'failed' | 'not_verified';
  issuer?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface UploadDigilockerDocumentData {
  documentType: string;
  name: string;
  description?: string;
  file: File;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface VerifyDigilockerDocumentData {
  documentId: string;
  verificationMethod: 'manual' | 'automated' | 'third_party';
  verifierId?: string;
  notes?: string;
}

export interface DigilockerDocumentSummary {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  expiredDocuments: number;
  documentsByType: Record<string, number>;
  documentsByStatus: Record<string, number>;
  documentsByIssuer: Record<string, number>;
}

export class DigilockerDocumentService {
  // Get Digilocker documents with filtering
  static async getDigilockerDocuments(filters: DigilockerDocumentFilter = {}): Promise<{ documents: DigilockerDocument[]; total: number; }> {
    const response = await apiClient.get('/digilocker-documents', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker documents');
    }
    return response.data as { documents: DigilockerDocument[]; total: number; };
  }

  // Get Digilocker document by ID
  static async getDigilockerDocumentById(id: string): Promise<DigilockerDocument> {
    const response = await apiClient.get(`/digilocker-documents/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker document');
    }
    return response.data as DigilockerDocument;
  }

  // Get Digilocker documents for a business
  static async getBusinessDigilockerDocuments(businessId: string, filters: Omit<DigilockerDocumentFilter, 'businessId'> = {}): Promise<{ documents: DigilockerDocument[]; total: number; }> {
    const response = await apiClient.get(`/digilocker-documents/business/${businessId}`, filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch business Digilocker documents');
    }
    return response.data as { documents: DigilockerDocument[]; total: number; };
  }

  // Upload Digilocker document
  static async uploadDigilockerDocument(documentData: UploadDigilockerDocumentData): Promise<DigilockerDocument> {
    const formData = new FormData();
    formData.append('documentType', documentData.documentType);
    formData.append('name', documentData.name);
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    formData.append('file', documentData.file);
    if (documentData.tags) {
      formData.append('tags', JSON.stringify(documentData.tags));
    }
    if (documentData.metadata) {
      formData.append('metadata', JSON.stringify(documentData.metadata));
    }

    const response = await apiClient.post('/digilocker-documents/upload', formData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to upload Digilocker document');
    }
    return response.data as DigilockerDocument;
  }

  // Update Digilocker document
  static async updateDigilockerDocument(id: string, updateData: { name?: string; description?: string; tags?: string[]; metadata?: Record<string, any>; }): Promise<DigilockerDocument> {
    const response = await apiClient.put(`/digilocker-documents/${id}`, updateData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update Digilocker document');
    }
    return response.data as DigilockerDocument;
  }

  // Delete Digilocker document
  static async deleteDigilockerDocument(id: string): Promise<void> {
    const response = await apiClient.delete(`/digilocker-documents/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete Digilocker document');
    }
  }

  // Verify Digilocker document
  static async verifyDigilockerDocument(id: string, verificationData: VerifyDigilockerDocumentData): Promise<DigilockerDocument> {
    const response = await apiClient.post(`/digilocker-documents/${id}/verify`, verificationData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to verify Digilocker document');
    }
    return response.data as DigilockerDocument;
  }

  // Revoke Digilocker document
  static async revokeDigilockerDocument(id: string, reason?: string): Promise<DigilockerDocument> {
    const response = await apiClient.post(`/digilocker-documents/${id}/revoke`, { reason });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to revoke Digilocker document');
    }
    return response.data as DigilockerDocument;
  }

  // Download Digilocker document
  static async downloadDigilockerDocument(id: string, format: 'pdf' | 'xml' | 'original' = 'pdf'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.get(`/digilocker-documents/${id}/download`, { format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to download Digilocker document');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Get Digilocker document content
  static async getDigilockerDocumentContent(id: string): Promise<{ xmlContent?: string; pdfContent?: string; metadata: Record<string, any>; }> {
    const response = await apiClient.get(`/digilocker-documents/${id}/content`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker document content');
    }
    return response.data as { xmlContent?: string; pdfContent?: string; metadata: Record<string, any>; };
  }

  // Get Digilocker document types
  static async getDigilockerDocumentTypes(): Promise<Array<{ type: string; name: string; description: string; requiredFields: string[]; issuer: string; }>> {
    const response = await apiClient.get('/digilocker-documents/types');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker document types');
    }
    return response.data as Array<{ type: string; name: string; description: string; requiredFields: string[]; issuer: string; }>;
  }

  // Get Digilocker document summary
  static async getDigilockerDocumentSummary(businessId?: string, userId?: string): Promise<DigilockerDocumentSummary> {
    const response = await apiClient.get('/digilocker-documents/summary', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker document summary');
    }
    return response.data as DigilockerDocumentSummary;
  }

  // Bulk verify Digilocker documents
  static async bulkVerifyDigilockerDocuments(documentIds: string[], verificationData: Omit<VerifyDigilockerDocumentData, 'documentId'>): Promise<{ verified: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/digilocker-documents/bulk-verify', { documentIds, ...verificationData });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk verify Digilocker documents');
    }
    return response.data as { verified: number; failed: number; errors?: string[]; };
  }

  // Bulk delete Digilocker documents
  static async bulkDeleteDigilockerDocuments(documentIds: string[]): Promise<{ deleted: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/digilocker-documents/bulk-delete', { documentIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to bulk delete Digilocker documents');
    }
    return response.data as { deleted: number; failed: number; errors?: string[]; };
  }

  // Export Digilocker documents
  static async exportDigilockerDocuments(filters: DigilockerDocumentFilter = {}, format: 'csv' | 'json' | 'xlsx' = 'csv'): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/digilocker-documents/export', { ...filters, format });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export Digilocker documents');
    }
    return response.data as { url: string; expiresAt: string; };
  }

  // Search Digilocker documents
  static async searchDigilockerDocuments(query: string, filters: DigilockerDocumentFilter = {}): Promise<{ documents: DigilockerDocument[]; total: number; }> {
    const response = await apiClient.get('/digilocker-documents/search', { query, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to search Digilocker documents');
    }
    return response.data as { documents: DigilockerDocument[]; total: number; };
  }

  // Get Digilocker document statistics
  static async getDigilockerDocumentStats(businessId?: string, period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    expiredDocuments: number;
    verificationRate: number;
    documentsUploaded: number;
    documentsDownloaded: number;
    topDocumentTypes: Array<{ type: string; count: number; }>;
    verificationTrend: Array<{ date: string; verified: number; uploaded: number; }>;
  }> {
    const response = await apiClient.get('/digilocker-documents/stats', { businessId, period });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker document statistics');
    }
    return response.data as {
      totalDocuments: number;
      verifiedDocuments: number;
      pendingDocuments: number;
      expiredDocuments: number;
      verificationRate: number;
      documentsUploaded: number;
      documentsDownloaded: number;
      topDocumentTypes: Array<{ type: string; count: number; }>;
      verificationTrend: Array<{ date: string; verified: number; uploaded: number; }>;
    };
  }

  // Sync Digilocker documents
  static async syncDigilockerDocuments(businessId: string, userId?: string): Promise<{ synced: number; failed: number; newDocuments: number; updatedDocuments: number; errors?: string[]; }> {
    const response = await apiClient.post('/digilocker-documents/sync', { businessId, userId });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to sync Digilocker documents');
    }
    return response.data as { synced: number; failed: number; newDocuments: number; updatedDocuments: number; errors?: string[]; };
  }

  // Get Digilocker issuers
  static async getDigilockerIssuers(): Promise<Array<{ issuer: string; name: string; description: string; documentTypes: string[]; }>> {
    const response = await apiClient.get('/digilocker-documents/issuers');
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch Digilocker issuers');
    }
    return response.data as Array<{ issuer: string; name: string; description: string; documentTypes: string[]; }>;
  }
}