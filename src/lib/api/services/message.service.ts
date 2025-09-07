import { apiClient } from '../client';

export interface Message {
  id: string;
  businessId: string;
  senderId: string;
  senderType: 'business' | 'customer' | 'admin';
  recipientId: string;
  recipientType: 'business' | 'customer' | 'admin';
  subject: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  threadId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageData {
  recipientId: string;
  recipientType: 'business' | 'customer' | 'admin';
  subject: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  threadId?: string;
}

export interface UpdateMessageData {
  status?: 'sent' | 'delivered' | 'read' | 'archived';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export class MessageService {
  // Get all messages for a business
  static async getMessages(businessId: string, filters?: {
    status?: string;
    priority?: string;
    senderType?: string;
    recipientType?: string;
    page?: number;
    limit?: number;
  }): Promise<{ messages: Message[]; total: number; page: number; totalPages: number; }> {
    const response = await apiClient.get('/messages', { businessId, ...filters });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch messages');
    }
    return response.data as { messages: Message[]; total: number; page: number; totalPages: number; };
  }

  // Get message by ID
  static async getMessageById(id: string): Promise<Message> {
    const response = await apiClient.get(`/messages/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch message');
    }
    return response.data as Message;
  }

  // Create message
  static async createMessage(messageData: CreateMessageData): Promise<Message> {
    const response = await apiClient.post('/messages', messageData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to create message');
    }
    return response.data as Message;
  }

  // Update message
  static async updateMessage(id: string, messageData: UpdateMessageData): Promise<Message> {
    const response = await apiClient.put(`/messages/${id}`, messageData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to update message');
    }
    return response.data as Message;
  }

  // Delete message
  static async deleteMessage(id: string): Promise<void> {
    const response = await apiClient.delete(`/messages/${id}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete message');
    }
  }

  // Get message thread
  static async getMessageThread(threadId: string): Promise<Message[]> {
    const response = await apiClient.get(`/messages/thread/${threadId}`);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to fetch message thread');
    }
    return response.data as Message[];
  }

  // Reply to message
  static async replyToMessage(messageId: string, replyData: { content: string; attachments?: Array<{ name: string; url: string; size: number; type: string; }>; }): Promise<Message> {
    const response = await apiClient.post(`/messages/${messageId}/reply`, replyData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to reply to message');
    }
    return response.data as Message;
  }

  // Mark messages as read
  static async markAsRead(messageIds: string[]): Promise<{ success: boolean; processed: number; failed: number; }> {
    const response = await apiClient.post('/messages/mark-read', { messageIds });
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to mark messages as read');
    }
    return response.data as { success: boolean; processed: number; failed: number; };
  }

  // Bulk actions for messages
  static async bulkMessageAction(actionData: { messageIds: string[]; action: 'archive' | 'delete' | 'mark_read'; }): Promise<{ success: boolean; processed: number; failed: number; errors?: string[]; }> {
    const response = await apiClient.post('/messages/bulk-action', actionData);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to perform bulk action');
    }
    return response.data as { success: boolean; processed: number; failed: number; errors?: string[]; };
  }

  // Export messages
  static async exportMessages(filters?: { businessId?: string; status?: string; priority?: string; }): Promise<{ url: string; expiresAt: string; }> {
    const response = await apiClient.post('/messages/export', filters);
    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to export messages');
    }
    return response.data as { url: string; expiresAt: string; };
  }
}