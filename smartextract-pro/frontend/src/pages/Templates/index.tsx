import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Box,
  Button,
  Typography,
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
  Divider,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  OutlinedInput,
  Checkbox,
  ListItemButton,
  List,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Description as TemplateIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FileCopy as DuplicateIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Category as CategoryIcon,
  Sort as SortIcon,
  Close as CloseIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridRowParams, GridValueGetterParams, GridPaginationModel, GridToolbar } from '@mui/x-data-grid';
import { Paper } from '@mui/material';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// Mock data for templates
const mockTemplates = [
  {
    id: uuidv4(),
    name: 'Standard Invoice',
    category: 'Invoices',
    description: 'Template for extracting data from standard invoices',
    fields: 12,
    created: '2023-04-15T10:30:00',
    updated: '2023-05-10T14:20:00',
    isActive: true,
  },
  {
    id: uuidv4(),
    name: 'Purchase Order',
    category: 'Purchase Orders',
    description: 'Template for processing purchase orders',
    fields: 8,
    created: '2023-03-22T09:15:00',
    updated: '2023-05-05T11:45:00',
    isActive: true,
  },
  {
    id: uuidv4(),
    name: 'Bank Statement',
    category: 'Financial Documents',
    description: 'Template for extracting transaction data from bank statements',
    fields: 15,
    created: '2023-02-10T14:20:00',
    updated: '2023-04-28T16:30:00',
    isActive: false,
  },
  {
    id: uuidv4(),
    name: 'Employment Contract',
    category: 'Legal',
    description: 'Template for extracting key terms from employment contracts',
    fields: 20,
    created: '2023-01-05T11:20:00',
    updated: '2023-03-15T13:10:00',
    isActive: true,
  },
  {
    id: uuidv4(),
    name: 'Medical Report',
    category: 'Healthcare',
    description: 'Template for extracting patient information from medical reports',
    fields: 18,
    created: '2022-12-15T16:45:00',
    updated: '2023-02-28T10:15:00',
    isActive: true,
  },
];

// Styled components
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

const TemplateCard: React.FC<{
  template: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onView: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}> = ({ template, onEdit, onDelete, onDuplicate, onView, onToggleStatus }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (action: string) => {
    handleMenuClose();
    switch (action) {
      case 'view':
        onView(template.id);
        break;
      case 'edit':
        onEdit(template.id);
        break;
      case 'duplicate':
        onDuplicate(template.id);
        break;
      case 'delete':
        onDelete(template.id);
        break;
      case 'toggleStatus':
        onToggleStatus(template.id, template.isActive);
        break;
      default:
        break;
    }
  };

  return (
    <StyledCard>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TemplateIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
            <Typography variant="subtitle1" component="div" noWrap sx={{ maxWidth: '70%' }}>
              {template.name}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            aria-label="template actions"
            sx={{ mt: -1, mr: -1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Chip
          label={template.category}
          size="small"
          icon={<CategoryIcon fontSize="small" />}
          sx={{ mb: 1.5, fontSize: '0.7rem' }}
          color="secondary"
          variant="outlined"
        />

        <Typography variant="body2" color="text.secondary" sx={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          mb: 1.5,
          minHeight: '2.8em',
        }}>
          {template.description}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {template.fields} {template.fields === 1 ? 'field' : 'fields'}
            </Typography>
          </Box>
          <Box>
            <Chip
              label={template.isActive ? 'Active' : 'Inactive'}
              size="small"
              color={template.isActive ? 'success' : 'default'}
              variant="outlined"
              sx={{ 
                height: 20, 
                fontSize: '0.65rem',
                '& .MuiChip-label': { px: 0.75 },
              }}
              onClick={() => handleAction('toggleStatus')}
            />
          </Box>
        </Box>
      </CardContent>
      <Divider />
      <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: '0.7rem' }}>
          Updated {format(new Date(template.updated), 'MMM d, yyyy')}
        </Typography>
        <Box>
          <Tooltip title="View Template">
            <IconButton size="small" onClick={() => handleAction('view')}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Template">
            <IconButton size="small" onClick={() => handleAction('edit')}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Template</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleAction('duplicate')}>
          <ListItemIcon>
            <DuplicateIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Duplicate Template</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleAction('toggleStatus')}>
          <ListItemIcon>
            {template.isActive ? (
              <CloseIcon fontSize="small" />
            ) : (
              <CheckCircleIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {template.isActive ? 'Deactivate' : 'Activate'}
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => handleAction('delete')}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Template</ListItemText>
        </MenuItem>
      </Menu>
    </StyledCard>
  );
};

const Templates: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState(mockTemplates);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Handle template actions
  const handleEditTemplate = (id: string) => {
    navigate(`/templates/${id}/edit`);
  };

  const handleViewTemplate = (id: string) => {
    navigate(`/templates/${id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setSelectedTemplate(template);
      setOpenDeleteDialog(true);
    }
  };

  const confirmDeleteTemplate = () => {
    if (selectedTemplate) {
      setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));
      setOpenDeleteDialog(false);
      setSelectedTemplate(null);
    }
  };

  const handleDuplicateTemplate = (id: string) => {
    const templateToDuplicate = templates.find(t => t.id === id);
    if (templateToDuplicate) {
      const newTemplate = {
        ...templateToDuplicate,
        id: uuidv4(),
        name: `${templateToDuplicate.name} (Copy)`,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
  };

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    setTemplates(prev =>
      prev.map(template =>
        template.id === id
          ? { ...template, isActive: !currentStatus, updated: new Date().toISOString() }
          : template
      )
    );
  };

  const handleCreateTemplate = () => {
    // In a real app, this would navigate to a template creation wizard
    const newTemplate = {
      id: uuidv4(),
      name: 'New Template',
      category: 'Uncategorized',
      description: 'Template description',
      fields: 0,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      isActive: true,
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setOpenCreateDialog(false);
  };

  // Filter and sort templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && template.isActive) ||
                         (filter === 'inactive' && !template.isActive);
    return matchesSearch && matchesFilter;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'updated':
        comparison = new Date(a.updated).getTime() - new Date(b.updated).getTime();
        break;
      case 'fields':
        comparison = a.fields - b.fields;
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // DataGrid columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Template Name',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TemplateIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
          <Box>
            <Typography variant="body2" noWrap>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.category}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 3,
      renderCell: (params) => (
        <Typography variant="body2" noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'fields',
      headerName: 'Fields',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={`${params.value} ${params.value === 1 ? 'field' : 'fields'}`}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'updated',
      headerName: 'Last Updated',
      width: 150,
      valueFormatter: (params) => format(new Date(params.value), 'MMM d, yyyy'),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          variant="outlined"
          onClick={() => handleToggleStatus(params.row.id, params.value)}
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => handleViewTemplate(params.row.id)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => handleEditTemplate(params.row.id)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Get unique categories for filter
  const categories = Array.from(new Set(templates.map(t => t.category))).sort();

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
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
            Document Templates
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant={view === 'grid' ? 'contained' : 'outlined'}
              onClick={() => setView('grid')}
              size="small"
              startIcon={<ViewIcon />}
            >
              Grid
            </Button>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
              size="small"
              startIcon={<ViewIcon />}
            >
              List
            </Button>
            <Divider orientation="vertical" flexItem />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              New Template
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search templates..."
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
          
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filter}
              label="Status"
              onChange={(e) => setFilter(e.target.value as string)}
            >
              <MenuItem value="all">All Templates</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value as string)}
              startAdornment={
                <InputAdornment position="start">
                  <SortIcon />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              }
            >
              <MenuItem value="name">Name</MenuItem>
              <MenuItem value="category">Category</MenuItem>
              <MenuItem value="updated">Last Updated</MenuItem>
              <MenuItem value="fields">Field Count</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Templates Grid View */}
      {view === 'grid' ? (
        <Grid container spacing={3}>
          {sortedTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <TemplateCard
                template={template}
                onEdit={handleEditTemplate}
                onDelete={handleDeleteTemplate}
                onDuplicate={handleDuplicateTemplate}
                onView={handleViewTemplate}
                onToggleStatus={handleToggleStatus}
              />
            </Grid>
          ))}
          
          {sortedTemplates.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No templates found
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Create your first template to get started'}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenCreateDialog(true)}
                >
                  Create Template
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      ) : (
        // Templates Table View
        <Box sx={{ height: 'calc(100vh - 300px)', width: '100%' }}>
          <DataGrid
            rows={sortedTemplates}
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
            onRowClick={(params) => handleViewTemplate(params.row.id)}
          />
        </Box>
      )}

      {/* Create Template Dialog */}
      <Dialog 
        open={openCreateDialog} 
        onClose={() => setOpenCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Template</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 3 }}>
            Start by giving your template a name and selecting a category. You'll be able to add fields and configure
            extraction rules in the next steps.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="templateName"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value=""
              onChange={() => {}}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
              <MenuItem value="new">+ Create New Category</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            id="templateDescription"
            label="Description (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTemplate} 
            variant="contained"
            color="primary"
          >
            Create Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the template "{selectedTemplate?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeleteTemplate} 
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Templates;
