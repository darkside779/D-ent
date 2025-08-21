import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Divider,
  useTheme,
  styled
} from '@mui/material';
import {
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

interface Activity {
  id: string;
  name: string;
  status: 'completed' | 'failed' | 'in-progress';
  timestamp: string;
  type: string;
  progress?: number;
  time: string;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div" style={{ color }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          <Box component="span" sx={{ fontSize: '2rem' }}>
            {icon}
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);


const RecentActivity: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  const getActivityIcon = (status: Activity['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'in-progress':
        return <PendingIcon color="info" />;
      default:
        return <FileIcon color="info" />;
    }
  };

  return (
    <StyledPaper>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Recent Activity</Typography>
        <Button size="small" startIcon={<RefreshIcon />}>
          Refresh
        </Button>
      </Box>
      <List>
        {activities.map((activity) => (
          <React.Fragment key={activity.id}>
            <ListItem>
              <ListItemIcon>{getActivityIcon(activity.status)}</ListItemIcon>
              <ListItemText
                primary={activity.name}
                secondary={activity.time}
                primaryTypographyProps={{
                  color: activity.status === 'failed' ? 'error' : 'textPrimary',
                }}
              />
              {activity.progress !== undefined && (
                <Box width={100} ml={2}>
                  <LinearProgress
                    variant="determinate"
                    value={activity.progress}
                    color={
                      activity.status === 'completed'
                        ? 'success'
                        : activity.status === 'failed'
                        ? 'error'
                        : 'primary'
                    }
                  />
                  <Typography variant="caption" color="textSecondary">
                    {activity.progress}%
                  </Typography>
                </Box>
              )}
            </ListItem>
            <Divider component="li" />
          </React.Fragment>
        ))}
      </List>
    </StyledPaper>
  );
};

interface RecentActivityProps {
  activities: Activity[];
}

const QuickActions = () => {
  const quickActions = [
    { label: 'Upload Document', icon: <CloudUploadIcon />, color: 'primary' },
    { label: 'Create Template', icon: <FileIcon />, color: 'secondary' },
  ];

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={action.icon}
              sx={{
                py: 2,
                borderColor: `${action.color}.light`,
                color: `${action.color}.dark`,
                '&:hover': {
                  borderColor: `${action.color}.dark`,
                  backgroundColor: `${action.color}10`,
                },
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </StyledPaper>
  );
};

const Dashboard: React.FC = () => {
  const theme = useTheme();

  const stats = [
    {
      title: 'Total Documents',
      value: '1,234',
      icon: <DescriptionIcon />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Storage Used',
      value: '2.5 GB',
      icon: <StorageIcon />,
      color: theme.palette.info.main,
    },
    {
      title: 'Processing',
      value: '12',
      icon: <CloudUploadIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: 'Errors',
      value: '43',
      icon: <ErrorIcon />,
      color: theme.palette.error.main,
    },
  ];

  const recentActivities: Activity[] = [
    {
      id: '1',
      name: 'Document processed',
      status: 'completed',
      time: '2 minutes ago',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      type: 'document',
      progress: 100
    },
    {
      id: '2',
      name: 'Template updated',
      status: 'in-progress',
      time: '5 minutes ago',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      type: 'template',
      progress: 60
    },
    {
      id: '3',
      name: 'Failed to process document',
      status: 'failed',
      time: '1 hour ago',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      type: 'document',
      progress: 30
    },
    {
      id: '4',
      name: 'New template created',
      status: 'completed',
      time: '2 hours ago',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'template',
      progress: 100
    },
    {
      id: '5',
      name: 'Document processing',
      status: 'in-progress',
      time: 'Just now',
      timestamp: new Date().toISOString(),
      type: 'document',
      progress: 25
    }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <QuickActions />
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <RecentActivity activities={recentActivities} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
