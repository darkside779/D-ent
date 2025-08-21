import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  textAlign: 'center',
  padding: theme.spacing(4),
}));

const NotFound: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <StyledContainer maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 120,
          height: 120,
          borderRadius: '50%',
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.contrastText,
          mb: 4,
          '& svg': {
            fontSize: 64,
          },
        }}
      >
        <ErrorOutlineIcon fontSize="inherit" color="inherit" />
      </Box>
      
      <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        404
      </Typography>
      
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 2 }}>
        Oops! Page not found
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 600, mb: 4 }}>
        The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ minWidth: 180 }}
        >
          Go Back
        </Button>
        
        <Button
          variant="outlined"
          color="primary"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ minWidth: 180 }}
        >
          Go to Home
        </Button>
      </Box>
      
      <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${theme.palette.divider}`, width: '100%' }}>
        <Typography variant="body2" color="textSecondary">
          If you believe this is an error, please contact our support team.
        </Typography>
      </Box>
    </StyledContainer>
  );
};

export default NotFound;
