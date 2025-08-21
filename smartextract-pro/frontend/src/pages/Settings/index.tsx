import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  Grid,
  Avatar,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
  AddAPhoto as AddPhotoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
}));

const SectionTitle = ({ title, subtitle, icon }: { title: string; subtitle?: string; icon: React.ReactNode }) => (
  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
    <Box sx={{ color: 'primary.main', mr: 2 }}>{icon}</Box>
    <Box>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

const Settings: React.FC = () => {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Profile form
  const profileForm = useFormik({
    initialValues: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Acme Inc.',
      jobTitle: 'Software Engineer',
      bio: 'Passionate about building great software and solving complex problems.',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('First name is required'),
      lastName: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().matches(
        /^\+?[1-9]\d{1,14}$/,
        'Enter a valid phone number with country code'
      ),
    }),
    onSubmit: (values) => {
      // Simulate API call
      console.log('Profile updated:', values);
      showSnackbarMessage('Profile updated successfully');
    },
  });

  // Password form
  const passwordForm = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Current password is required'),
      newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        )
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: (values, { resetForm }) => {
      // Simulate API call
      console.log('Password changed:', values);
      resetForm();
      showSnackbarMessage('Password changed successfully');
    },
  });

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
    productUpdates: true,
  });

  const handleNotificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationPrefs({
      ...notificationPrefs,
      [event.target.name]: event.target.checked,
    });
  };

  // Show snackbar message
  const showSnackbarMessage = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setShowSnackbar(true);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setShowSnackbar(false);
  };

  // Handle profile picture change
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload the file to your server
      console.log('Profile picture selected:', file);
      showSnackbarMessage('Profile picture updated successfully');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Account Settings
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Manage your account settings and preferences
      </Typography>

      {/* Profile Section */}
      <SectionPaper elevation={2}>
        <SectionTitle
          title="Profile Information"
          subtitle="Update your personal details"
          icon={<PersonIcon />}
        />
        
        <form onSubmit={profileForm.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ position: 'relative', mb: 2 }}>
                <Avatar
                  src="/default-avatar.png"
                  alt="Profile"
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-picture-upload"
                  type="file"
                  onChange={handleProfilePictureChange}
                />
                <label htmlFor="profile-picture-upload">
                  <IconButton
                    color="primary"
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      border: `2px solid ${theme.palette.background.paper}`,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <AddPhotoIcon />
                  </IconButton>
                </label>
              </Box>
              <Typography variant="caption" color="textSecondary" align="center">
                JPG, GIF or PNG. Max size 2MB
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={9}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="firstName"
                    name="firstName"
                    label="First Name"
                    value={profileForm.values.firstName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.firstName && Boolean(profileForm.errors.firstName)}
                    helperText={profileForm.touched.firstName && profileForm.errors.firstName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="lastName"
                    name="lastName"
                    label="Last Name"
                    value={profileForm.values.lastName}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.lastName && Boolean(profileForm.errors.lastName)}
                    helperText={profileForm.touched.lastName && profileForm.errors.lastName}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={profileForm.values.email}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.email && Boolean(profileForm.errors.email)}
                    helperText={profileForm.touched.email && profileForm.errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={profileForm.values.phone}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.touched.phone && Boolean(profileForm.errors.phone)}
                    helperText={profileForm.touched.phone && profileForm.errors.phone}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="company"
                    name="company"
                    label="Company"
                    value={profileForm.values.company}
                    onChange={profileForm.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="jobTitle"
                    name="jobTitle"
                    label="Job Title"
                    value={profileForm.values.jobTitle}
                    onChange={profileForm.handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="bio"
                    name="bio"
                    label="Bio"
                    multiline
                    rows={4}
                    value={profileForm.values.bio}
                    onChange={profileForm.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={!profileForm.dirty || !profileForm.isValid}
                  >
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </SectionPaper>

      {/* Password Section */}
      <SectionPaper elevation={2}>
        <SectionTitle
          title="Change Password"
          subtitle="Update your password"
          icon={<LockIcon />}
        />
        
        <form onSubmit={passwordForm.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8} lg={6}>
              <TextField
                fullWidth
                id="currentPassword"
                name="currentPassword"
                label="Current Password"
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordForm.values.currentPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.touched.currentPassword && Boolean(passwordForm.errors.currentPassword)}
                helperText={passwordForm.touched.currentPassword && passwordForm.errors.currentPassword}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                id="newPassword"
                name="newPassword"
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.values.newPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.touched.newPassword && Boolean(passwordForm.errors.newPassword)}
                helperText={passwordForm.touched.newPassword && passwordForm.errors.newPassword}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.values.confirmPassword}
                onChange={passwordForm.handleChange}
                onBlur={passwordForm.handleBlur}
                error={passwordForm.touched.confirmPassword && Boolean(passwordForm.errors.confirmPassword)}
                helperText={passwordForm.touched.confirmPassword && passwordForm.errors.confirmPassword}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        onMouseDown={(e) => e.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!passwordForm.dirty || !passwordForm.isValid}
                  startIcon={<SaveIcon />}
                >
                  Update Password
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} lg={6}>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'action.hover' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Password Requirements:
                </Typography>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>At least 8 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one lowercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </form>
      </SectionPaper>

      {/* Notification Preferences */}
      <SectionPaper elevation={2}>
        <SectionTitle
          title="Notification Preferences"
          subtitle="Manage how you receive notifications"
          icon={<EmailIcon />}
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationPrefs.emailNotifications}
                  onChange={handleNotificationChange}
                  name="emailNotifications"
                  color="primary"
                />
              }
              label="Email Notifications"
            />
            <Typography variant="caption" display="block" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 2 }}>
              Receive email notifications about your account
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationPrefs.marketingEmails}
                  onChange={handleNotificationChange}
                  name="marketingEmails"
                  color="primary"
                />
              }
              label="Marketing Emails"
            />
            <Typography variant="caption" display="block" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 2 }}>
              Receive marketing and promotional emails
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationPrefs.securityAlerts}
                  onChange={handleNotificationChange}
                  name="securityAlerts"
                  color="primary"
                />
              }
              label="Security Alerts"
            />
            <Typography variant="caption" display="block" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 2 }}>
              Receive important security alerts about your account
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationPrefs.productUpdates}
                  onChange={handleNotificationChange}
                  name="productUpdates"
                  color="primary"
                />
              }
              label="Product Updates"
            />
            <Typography variant="caption" display="block" color="textSecondary" sx={{ ml: 4, mt: -1, mb: 2 }}>
              Receive updates about new features and improvements
            </Typography>
          </Grid>
          
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => showSnackbarMessage('Notification preferences saved')}
            >
              Save Preferences
            </Button>
          </Grid>
        </Grid>
      </SectionPaper>

      {/* Danger Zone */}
      <SectionPaper elevation={2} sx={{ borderLeft: `4px solid ${theme.palette.error.main}` }}>
        <SectionTitle
          title="Danger Zone"
          subtitle="Irreversible and destructive actions"
          icon={<></>}
        />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Delete Account
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Permanently delete your account and all associated data. This action cannot be undone.
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => showSnackbarMessage('Account deletion requested', 'error')}
            >
              Delete My Account
            </Button>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Export Data
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Download all your data in a machine-readable format.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => showSnackbarMessage('Data export started. You will receive an email when ready.')}
            >
              Request Data Export
            </Button>
          </Grid>
        </Grid>
      </SectionPaper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
