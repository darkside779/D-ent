import api from './api';

import { ReactNode } from 'react';

interface Document {
  id: string;
  name?: string;
  filename?: string;
  type?: string;
  document_type?: string;
  size?: number;
  file_size?: number;
  status: 'processing' | 'completed' | 'failed' | 'pending' | 'uploaded' | 'processed' | 'error';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  uploaded?: boolean | string;
  progress?: number;
  fields?: any[];
  extracted_data?: any[];
  downloadUrl?: string;
  file_url?: string;
  url?: string;
}

export const documentService = {
  // Get all documents
  async getDocuments(): Promise<Document[]> {
    try {
      const response = await api.get('/documents/');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Upload a document
  async uploadDocument(file: File): Promise<Document> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get document by ID
  async getDocumentById(id: string): Promise<Document> {
    try {
      const response = await api.get(`/documents/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Delete document by ID
  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`/documents/${id}/`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get document content (for viewing)
  async getDocumentContent(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/documents/${id}/content`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching content for document ${id}:`, error);
      throw error;
    }
  },
};

export type { Document };
