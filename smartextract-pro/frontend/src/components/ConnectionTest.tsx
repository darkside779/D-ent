import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Alert,
  CircularProgress
} from '@mui/material';
import { CheckCircle, Error, Refresh } from '@mui/icons-material';
import api from '../services/api';

interface ConnectionStatus {
  status: 'checking' | 'connected' | 'error';
  message: string;
  details?: any;
}

const ConnectionTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'checking',
    message: 'Checking connection...'
  });

  const testConnection = async () => {
    setConnectionStatus({
      status: 'checking',
      message: 'Testing connection...'
    });

    try {
      // Test basic API endpoint
      const healthResponse = await api.get('/health');
      
      // Test root endpoint
      const rootResponse = await api.get('/');
      
      setConnectionStatus({
        status: 'connected',
        message: 'Backend connection successful!',
        details: {
          health: healthResponse.data,
          root: rootResponse.data
        }
      });
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus({
        status: 'error',
        message: `Connection failed: ${error.message || 'Unknown error'}`,
        details: error.response?.data || error
      });
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'checking':
        return <CircularProgress size={24} />;
      case 'connected':
        return <CheckCircle color="success" />;
      case 'error':
        return <Error color="error" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Backend Connection Test
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {getStatusIcon()}
          <Typography 
            variant="body1" 
            color={getStatusColor()}
          >
            {connectionStatus.message}
          </Typography>
        </Box>

        {connectionStatus.status === 'connected' && connectionStatus.details && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2" component="div">
              <strong>Health Check:</strong> {JSON.stringify(connectionStatus.details.health)}
            </Typography>
            <Typography variant="body2" component="div">
              <strong>API Info:</strong> {JSON.stringify(connectionStatus.details.root)}
            </Typography>
          </Alert>
        )}

        {connectionStatus.status === 'error' && connectionStatus.details && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Error Details:</strong> {JSON.stringify(connectionStatus.details)}
            </Typography>
          </Alert>
        )}

        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={testConnection}
          disabled={connectionStatus.status === 'checking'}
        >
          Test Connection
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
