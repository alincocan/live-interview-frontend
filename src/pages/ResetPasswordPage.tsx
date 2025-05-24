import {
    Avatar,
    Button,
    TextField,
    Link,
    Grid,
    Box,
    Typography,
    Container,
    Alert,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { AuthenticationService } from '../service/authenticationService.ts';
import { useNavigate, useLocation } from 'react-router-dom';

type Inputs = {
    password: string;
    confirmPassword: string;
};

const ResetPasswordPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<Inputs>();

    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showLoginButton, setShowLoginButton] = useState(false);

    // Get token from URL query parameter
    const token = new URLSearchParams(location.search).get('token');

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        if (!token) {
            setResponseMessage({
                type: 'error',
                text: 'Invalid or missing reset token. Please request a new password reset link.'
            });
            return;
        }

        setIsLoading(true);
        setResponseMessage(null);

        try {
            const authService = AuthenticationService.getInstance();
            const response = await authService.resetPassword(token, data.password);

            if (response.success) {
                setResponseMessage({
                    type: 'success',
                    text: response.message || 'Password reset successfully!'
                });
                setShowLoginButton(true);
            } else {
                setResponseMessage({
                    type: 'error',
                    text: response.message || 'Failed to reset password. Please try again.'
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setResponseMessage({
                type: 'error',
                text: 'An unexpected error occurred. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1 }}>
                    <Box
                        component="img"
                        src="images/man-logo.jpg"
                        alt="My Image"
                        sx={{
                            width: 50,
                            height: 'auto',
                            borderRadius: 2, boxShadow: 3,
                        }}
                    />
                </Avatar>
                <Typography component="h1" variant="h5" color={theme => theme.palette.text.primary}>
                    Reset Password
                </Typography>
                <Box
                    component="form"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ mt: 3 }}
                >
                    <TextField
                        fullWidth
                        margin="normal"
                        label="New Password"
                        type="password"
                        {...register('password', {
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        })}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Confirm Password"
                        type="password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: (value) => 
                                value === watch('password') || 'Passwords do not match'
                        })}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                    />
                    {responseMessage && (
                        <Alert 
                            severity={responseMessage.type} 
                            sx={{ mt: 2, width: '100%' }}
                        >
                            {responseMessage.text}
                        </Alert>
                    )}
                    {showLoginButton ? (
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    )}
                    {!showLoginButton && (
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    Back to Sign In
                                </Link>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default ResetPasswordPage;