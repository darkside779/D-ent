import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  Container, 
  Typography,
  CircularProgress
} from '@mui/material';
import { createTheme } from '@mui/material/styles';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentView from './pages/DocumentView';
import TemplateView from './pages/TemplateView';

// Components
import ConnectionTest from './components/ConnectionTest';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
  },
});

// Basic components
const HomePage = () => (
  <Box sx={{ mt: 4 }}>
    <Container maxWidth="lg">
      <Typography variant="h1" gutterBottom>
        Welcome to SmartExtract Pro
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Your document processing and data extraction platform
      </Typography>
      
      {/* Backend Connection Test */}
      <ConnectionTest />
    </Container>
  </Box>
);

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Loading...</Typography>
      </Box>
    );
  }

  // If not loading but not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected route
  return <Outlet />;
};

// Public Route Component
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documents/:id" element={<DocumentView />} />
              <Route path="/templates/:id" element={<TemplateView />} />
              {/* Add more protected routes here */}
            </Route>

            {/* Home and Catch-all */}
            <Route path="/" element={<HomePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
