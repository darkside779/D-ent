import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container, Typography, Button } from '@mui/material';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <Box sx={{ mt: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Welcome to Your Dashboard, {user?.full_name || user?.username}
        </Typography>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant="h6" gutterBottom>User Information</Typography>
          <Typography>Email: {user?.email}</Typography>
          <Typography>Username: {user?.username}</Typography>
          <Typography>User ID: {user?.id}</Typography>
          
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={logout}
              sx={{ mt: 2 }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
