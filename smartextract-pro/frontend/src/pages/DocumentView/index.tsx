import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';

import { Document } from '../../services/documentService';

interface DocumentData extends Omit<Document, 'createdAt' | 'updatedAt' | 'created_at' | 'updated_at'> {
  id: string;
  name: string;
  type: string;
  size: number;
  status: Document['status'];
  createdAt: string;
  updatedAt: string;
  file_url?: string;
  downloadUrl?: string;
  extracted_data?: any[];
}

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const doc = await documentService.getDocumentById(id);
        
        // Map the document to our DocumentData type
        const mappedDoc: DocumentData = {
          id: doc.id,
          name: doc.name || doc.filename || 'Untitled Document',
          type: doc.type || doc.document_type || 'application/octet-stream',
          size: doc.size || doc.file_size || 0,
          status: doc.status,
          createdAt: doc.createdAt || doc.created_at || new Date().toISOString(),
          updatedAt: doc.updatedAt || doc.updated_at || new Date().toISOString(),
          file_url: doc.file_url || doc.url || doc.downloadUrl,
          downloadUrl: doc.downloadUrl || doc.file_url || doc.url,
          extracted_data: doc.extracted_data || doc.fields || []
        };
        
        setDocument(mappedDoc);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  const handleDownload = () => {
    if (document?.downloadUrl || document?.file_url) {
      window.open(document.downloadUrl || document.file_url, '_blank');
    } else {
      setError('Download URL not available');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await documentService.deleteDocument(id);
      navigate('/documents');
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!document) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Document not found</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Documents
        </Button>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {document.name}
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                {document.type && (
                  <Chip
                    label={document.type.toUpperCase()}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                )}
                {document.createdAt && (
                  <Chip
                    label={format(new Date(document.createdAt), 'MMM d, yyyy')}
                    variant="outlined"
                    size="small"
                  />
                )}
                <Chip
                  label={`${((document.size || 0) / 1024).toFixed(2)} KB`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <Tooltip title="Download">
                <IconButton onClick={handleDownload} color="primary">
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton 
                  onClick={() => navigate(`/documents/${document.id}/edit`)}
                  color="primary"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {document.extracted_data && document.extracted_data.length > 0 ? (
            <Box>
              <Typography variant="h6" gutterBottom>Extracted Data</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(document.extracted_data, null, 2)}
                </pre>
              </Paper>
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No extracted data available for this document.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default DocumentView;
