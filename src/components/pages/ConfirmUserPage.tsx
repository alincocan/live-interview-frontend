import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthenticationService } from '../../service/authenticationService';

const ConfirmUserPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const confirmAccount = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setErrorMessage('Invalid confirmation link. No token provided.');
                setIsLoading(false);
                return;
            }

            try {
                const authService = AuthenticationService.getInstance();
                const response = await authService.confirmUser(token);

                if (response.success) {
                    setSuccessMessage(response.message || 'Your account has been confirmed successfully!');
                } else {
                    setErrorMessage(response.message || 'Account confirmation failed. Please try again.');
                }
            } catch (error) {
                console.error('Error during confirmation:', error);
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        confirmAccount();
    }, [searchParams]);

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                }}
            >
                <Typography component="h1" variant="h5" color={theme => theme.palette.text.primary} sx={{ mb: 3 }}>
                    Account Confirmation
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <CircularProgress size={50} sx={{ mb: 2 }} />
                        <Typography variant="body1" color={theme => theme.palette.text.primary} sx={{ mb: 3 }}>Confirming your account...</Typography>
                    </Box>
                ) : successMessage ? (
                    <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {successMessage}
                        </Alert>
                        <Button
                            variant="contained"
                            href="/login"
                            sx={{ mt: 2 }}
                        >
                            Go to Login
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ mt: 3, width: '100%', textAlign: 'center' }}>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {errorMessage}
                        </Alert>
                        <Button
                            variant="contained"
                            href="/login"
                            sx={{ mt: 2 }}
                        >
                            Go to Login
                        </Button>
                    </Box>
                )}
            </Box>
        </Container>
    );
};

export default ConfirmUserPage;