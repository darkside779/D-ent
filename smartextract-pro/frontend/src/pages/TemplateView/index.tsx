import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import templateService from '../../services/templateService';
import type { Template } from '../../services/templateService';
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

// Using Template interface from templateService

const TemplateView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const templateData = await templateService.getTemplateById(id!);
        setTemplate(templateData);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await templateService.deleteTemplate(id);
      navigate('/templates');
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Failed to delete template');
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

  if (!template) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Template not found</Alert>
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
          Back to Templates
        </Button>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {template.name}
              </Typography>
              {template.description && (
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  {template.description}
                </Typography>
              )}
              <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                <Chip
                  label={template.documentType}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`Created: ${format(new Date(template.createdAt), 'MMM d, yyyy')}`}
                  variant="outlined"
                  size="small"
                />
                <Chip
                  label={`Updated: ${format(new Date(template.updatedAt), 'MMM d, yyyy')}`}
                  variant="outlined"
                  size="small"
                />
              </Box>
            </Box>
            <Box>
              <Tooltip title="Edit">
                <IconButton 
                  onClick={() => navigate(`/templates/${template.id}/edit`)}
                  color="primary"
                  sx={{ mr: 1 }}
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

          <Box>
            <Typography variant="h6" gutterBottom>Template Fields</Typography>
            {template.fields && template.fields.length > 0 ? (
              <Paper variant="outlined" sx={{ p: 2 }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(template.fields, null, 2)}
                </pre>
              </Paper>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No fields defined for this template.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default TemplateView;
