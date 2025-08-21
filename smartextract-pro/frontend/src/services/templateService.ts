import api from './api';

export interface ITemplate {
  id: string;
  name: string;
  description?: string;
  fields: any[];
  documentType: string;
  createdAt: string;
  updatedAt: string;
}

const templateService = {
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response = await api.get('/templates/');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  /**
   * Get a single template by ID
   */
  async getTemplateById(id: string): Promise<Template> {
    try {
      const response = await api.get(`/templates/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new template
   */
  async createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    try {
      const response = await api.post('/templates/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, templateData: Partial<Template>): Promise<Template> {
    try {
      const response = await api.put(`/templates/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<void> {
    try {
      await api.delete(`/templates/${id}`);
    } catch (error) {
      console.error(`Error deleting template ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get templates by document type
   */
  async getTemplatesByDocumentType(documentType: string): Promise<Template[]> {
    try {
      const response = await api.get(`/templates/?document_type=${documentType}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching templates for document type ${documentType}:`, error);
      throw error;
    }
  }
};

export type Template = ITemplate;
export default templateService;
