import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/documentService';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  styled,
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import { useTheme } from '@mui/material/styles';
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';

// FileType component to display file icons based on type
const FileType = ({ type }: { type: string }) => {
  const iconStyle = { fontSize: 24 };
  
  switch (type.toLowerCase()) {
    case 'pdf':
      return <PictureAsPdfIcon color="error" style={iconStyle} />;
    case 'doc':
    case 'docx':
      return <DescriptionIcon color="primary" style={iconStyle} />;
    case 'xls':
    case 'xlsx':
      return <TableChartIcon color="success" style={iconStyle} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <ImageIcon color="secondary" style={iconStyle} />;
    default:
      return <InsertDriveFileIcon style={iconStyle} />;
  }
};

// Define our custom Document type that extends the DOM Document type
interface DocumentItem {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'processing' | 'completed' | 'failed' | 'pending' | 'uploaded' | 'processed' | 'error';
  createdAt: string;
  updatedAt: string;
  uploaded: boolean;
  progress: number;
  fields: any[];
  downloadUrl?: string;
  url?: string;
  file_url?: string;
  filename?: string;
  document_type?: string;
  file_size?: number;
  created_at?: string;
  updated_at?: string;
  extracted_data?: any[];
}

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const StatusChip = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case 'processed':
      case 'completed':
        return { label: 'Processed', color: 'success', icon: <CheckCircleIcon fontSize="small" /> };
      case 'processing':
        return { label: 'Processing', color: 'info', icon: <RefreshIcon fontSize="small" /> };
      case 'failed':
      case 'error':
        return { label: 'Failed', color: 'error', icon: <ErrorIcon fontSize="small" /> };
      default:
        return { label: 'Pending', color: 'default', icon: <PendingIcon fontSize="small" /> };
    }
  };

  const { label, color, icon } = getStatusProps();

  return (
    <Chip
      icon={icon}
      label={label}
      color={color as any}
      size="small"
      variant="outlined"
      sx={{ minWidth: 100 }}
    />
  );
};

const Documents: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Handlers
  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  // Handle document delete
  const handleDelete = useCallback(async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      setSuccess('Document deleted successfully');
    } catch (err) {
      setError('Failed to delete document');
      console.error('Error deleting document:', err);
    }
    handleMenuClose();
  }, []);

  // Handle document actions
  const handleDocumentAction = (action: 'view' | 'edit' | 'delete' | 'download', doc: DocumentItem) => {
    if (!doc) return;

    switch (action) {
      case 'view':
        navigate(`/documents/${doc.id}`);
        break;
      case 'delete':
        handleDelete(doc.id);
        return;
      case 'download':
        if (doc.downloadUrl) {
          window.open(doc.downloadUrl, '_blank');
        } else {
          setError('Download URL not available');
        }
        break;
      case 'edit':
        // Handle edit action
        break;
      default:
        const _exhaustiveCheck: never = action;
        return _exhaustiveCheck;
    }

    handleMenuClose();
  };

  // Filter documents based on search term
  const filteredDocuments = React.useMemo(() => 
    documents.filter((doc) =>
      doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [documents, searchTerm]
  );

  // Handle document upload via drag and drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setIsUploading(true);
    
    // Create a new document object
    const newDoc: DocumentItem = {
      id: `temp-${Date.now()}`,
      name: file.name,
      type: file.type || file.name.split('.').pop() || '',
      size: file.size,
      status: 'processing',
      uploaded: false,
      progress: 0,
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to documents list
    setDocuments(prev => [...prev, newDoc]);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      // Upload the file
      const uploadedDoc = await documentService.uploadDocument(file);
      clearInterval(progressInterval);
      
      // Map the API response to our DocumentItem type
      const mappedDoc: DocumentItem = {
        id: uploadedDoc.id,
        name: uploadedDoc.filename || uploadedDoc.name || file.name,
        type: uploadedDoc.document_type || uploadedDoc.type || file.type || 'unknown',
        size: uploadedDoc.file_size || uploadedDoc.size || file.size || 0,
        status: (uploadedDoc.status as any) || 'processing',
        createdAt: uploadedDoc.created_at || uploadedDoc.createdAt || new Date().toISOString(),
        updatedAt: uploadedDoc.updated_at || uploadedDoc.updatedAt || new Date().toISOString(),
        uploaded: true,
        progress: 100,
        fields: uploadedDoc.extracted_data || uploadedDoc.fields || [],
        downloadUrl: uploadedDoc.file_url || uploadedDoc.url || uploadedDoc.downloadUrl
      };
      
      // Update state with the new document
      setDocuments(prevDocs => [
        mappedDoc,
        ...prevDocs.filter(doc => doc.id !== `temp-${Date.now()}`)
      ]);
      
      setUploadProgress(100);
      setSuccess(`Successfully uploaded ${file.name}`);
    } catch (err) {
      setError(`Failed to upload ${file.name}`);
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  // Initialize dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  // Fetch documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const data = await documentService.getDocuments();
        // Map the API response to our Document type
        const mappedDocs: DocumentItem[] = data.map((doc: any) => ({
          id: doc.id,
          name: doc.filename || doc.name,
          type: doc.document_type || doc.type || 'unknown',
          size: doc.file_size || doc.size || 0,
          status: (doc.status as any) || 'pending',
          createdAt: doc.created_at || doc.createdAt || new Date().toISOString(),
          updatedAt: doc.updated_at || doc.updatedAt || new Date().toISOString(),
          uploaded: true,
          progress: 100,
          fields: doc.extracted_data || doc.fields || [],
          downloadUrl: doc.file_url || doc.url || doc.downloadUrl
        }));
        setDocuments(mappedDocs);
      } catch (err) {
        setError('Failed to fetch documents');
        console.error('Error fetching documents:', err);
      }
    };

    fetchDocuments();
  }, []);

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: DocumentItem) => {
    setSelectedDocument(document);
    setAnchorEl(event.currentTarget);
  };

  // DataGrid columns configuration
  const columns: GridColDef<DocumentItem>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 2,
      renderCell: (params) => {
        const doc = params.row;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FileType type={doc.type?.split('.').pop() || ''} />
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" component="div" noWrap>
                {doc.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" noWrap>
                {doc.type?.toUpperCase()} • {formatFileSize(doc.size)} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
              </Typography>
              {doc.status === 'processing' && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <LinearProgress variant="determinate" value={50} />
                  <Typography variant="caption" color="textSecondary">
                    Processing...
                  </Typography>
                </Box>
              )}
              {doc.status === 'failed' && (
                <Typography variant="caption" color="error">
                  Processing failed
                </Typography>
              )}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => <StatusChip status={params.row.status} />,
    },
    {
      field: 'fields',
      headerName: 'Fields Extracted',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.row.fields?.length || 0} {params.row.fields?.length === 1 ? 'field' : 'fields'}
        </Typography>
      ),
    },
    {
      field: 'progress',
      headerName: 'Progress',
      width: 200,
      renderCell: (params) => {
        const progress = params.row.progress || 0;
        const status = params.row.status;
        
        return (
          <Box sx={{ width: '100%', pr: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={
                status === 'error' || status === 'failed'
                  ? 'error'
                  : status === 'processing' || status === 'pending'
                  ? 'primary'
                  : 'success'
              }
              sx={{ height: 8, borderRadius: 5 }}
            />
            <Typography variant="caption" color="textSecondary">
              {progress}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          onClick={(e) => handleMenuOpen(e, params.row as DocumentItem)}
          size="small"
          aria-label="more"
          aria-controls="document-actions-menu"
          aria-haspopup="true"
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error/Success Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 3 
          }}
        >
          <Typography variant="h4" component="h1">
            Documents
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={view === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setView('grid')}
              size="small"
              startIcon={<VisibilityIcon />}
            >
              Grid
            </Button>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
              size="small"
              startIcon={<VisibilityIcon />}
            >
              List
            </Button>
            <Divider orientation="vertical" flexItem />
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUploadIcon />}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Upload
            </Button>
            <input
              {...getInputProps()}
              id="file-upload"
              type="file"
              style={{ display: 'none' }}
              multiple
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            size="small"
          >
            Filters
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            size="small"
          >
            Sort
          </Button>
        </Box>

        {/* Upload area */}
        {isUploading ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: 'primary.main',
              mb: 3,
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Uploading {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ height: 10, borderRadius: 5, mb: 2 }}
            />
            <Typography variant="body2" color="textSecondary">
              Please wait while we process your file...
            </Typography>
          </Paper>
        ) : (
          <Paper
            {...getRootProps()}
            variant="outlined"
            sx={{
              p: 6,
              textAlign: 'center',
              borderStyle: 'dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              mb: 3,
              transition: 'all 0.3s',
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon
              color={isDragActive ? 'primary' : 'action'}
              sx={{ fontSize: 48, mb: 2, opacity: 0.7 }}
            />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop the files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              or click to browse files (PDF, DOCX, XLSX, JPG, PNG, TIFF)
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Max file size: 50MB
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Documents Grid View */}
      {view === 'grid' ? (
        <Grid container spacing={3}>
          {filteredDocuments.map((doc) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <FileType type={doc.type} />
                    <Box>
                      <StatusChip status={doc.status} />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDocument(doc);
                          setAnchorEl(e.currentTarget);
                        }}
                        sx={{ ml: 1 }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle1" noWrap gutterBottom>
                    {doc.name}
                  </Typography>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {typeof doc.uploaded === 'string' ? 
                      format(new Date(doc.uploaded), 'MMM d, yyyy') : 
                      'Not uploaded'}
                  </Typography>
                  
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="caption" color="textSecondary">
                      {doc.fields.length} {doc.fields.length === 1 ? 'field' : 'fields'} extracted
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={doc.progress || 0}
                      color={
                        doc.status === 'error' 
                          ? 'error' 
                          : doc.status === 'processing' 
                          ? 'primary' 
                          : 'success'
                      }
                      sx={{ height: 6, borderRadius: 3, mt: 1 }}
                    />
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    disabled={doc.status === 'processing'}
                  >
                    View Details
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
          
          {filteredDocuments.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No documents found
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload your first document to get started'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        // Documents Table View
        <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
          <DataGrid
            rows={filteredDocuments}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 10, page: 0 },
              },
            }}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            slots={{
              toolbar: GridToolbar,
            }}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: theme.palette.background.paper,
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: theme.palette.action.hover,
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      )}

      {/* Document Actions Menu */}
      <Menu
        id="document-actions-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => selectedDocument && handleDocumentAction('view', selectedDocument)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => selectedDocument && handleDocumentAction('edit', selectedDocument)}
          disabled={!selectedDocument || !['completed', 'processed'].includes(selectedDocument.status)}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Fields</ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => selectedDocument && handleDocumentAction('download', selectedDocument)}
          disabled={!selectedDocument || !['completed', 'processed'].includes(selectedDocument.status)}
        >
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => selectedDocument && handleDocumentAction('delete', selectedDocument)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Documents;