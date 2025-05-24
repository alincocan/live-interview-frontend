import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthenticationService } from '../service/authenticationService.ts';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

const OAuth2RedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthentication = async () => {
      try {
        // Extract token from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
          setError('No authentication token found in the URL.');
          return;
        }

        // Authenticate with the token
        const authService = AuthenticationService.getInstance();
        const response = await authService.authenticateWithToken(token);

        if (response.success) {
          // Redirect to dashboard on successful authentication
          navigate('/dashboard');
        } else {
          setError(response.message || 'Authentication failed. Please try again.');
        }
      } catch (error) {
        console.error('OAuth redirect error:', error);
        setError('An unexpected error occurred. Please try again.');
      }
    };

    handleAuthentication();
  }, [location, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100%',
        backgroundColor: (theme) => theme.palette.background.default,
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ maxWidth: 500, mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} sx={{ mb: 4 }} />
          <Typography variant="h6" color="textSecondary">
            Authenticating...
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuth2RedirectPage;