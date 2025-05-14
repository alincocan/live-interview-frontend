import {
    Avatar,
    Button,
    TextField,
    FormControlLabel,
    Checkbox,
    Link,
    Paper,
    Box,
    Grid,
    Typography,
    Alert,
    Divider,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthenticationService } from '../../service/authenticationService';
import {LoginCredentials} from "../../bo/LoginCredentials.ts";

const boxStyles = {
    my: 8,
    mx: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

const LoginPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginCredentials>();

    const navigate = useNavigate();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setLoginError(null);

        try {
            const authService = AuthenticationService.getInstance();
            // Instead of fetching HTML and rendering it, redirect to the Google login URL
            const googleLoginUrl = authService.getGoogleLoginUrl();

            // Open the Google login URL in a new window or redirect the current window
            window.location.href = googleLoginUrl;

            // Note: We don't need to set googleLoading to false here since we're redirecting
            // the user away from this page
        } catch (error) {
            console.error('Google login error:', error);
            setLoginError('An error occurred during Google login. Please try again.');
            setGoogleLoading(false);
        }
    };



    const onSubmit: SubmitHandler<LoginCredentials> = async (data) => {
        setIsLoading(true);
        setLoginError(null);

        try {
            const authService = AuthenticationService.getInstance();
            const response = await authService.login({
                email: data.email,
                password: data.password,
                remember: data.remember
            });

            if (response.success) {
                console.log('Login successful');
                navigate('/dashboard');
            } else {
                setLoginError(response.message || 'Authentication failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setLoginError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
            <Grid container component="main" sx={{ height: '100vh' }}>
                <Grid
                    item
                    xs={false}
                    sm={4}
                    md={7}

                />
                <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                    <Box sx={boxStyles}>
                        <Avatar sx={{ m: 1 }}>
                            <Box
                                component="img"
                                src="images/man-logo.jpg"
                                alt="My Image"
                                sx={{
                                    width: 50,
                                    height: 'auto',
                                    borderRadius: 2,
                                    boxShadow: 3,
                                }}
                            />

                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign in
                        </Typography>

                        {/* Google Login Section */}
                        <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={handleGoogleLogin}
                                disabled={googleLoading}
                                sx={{ mt: 1, mb: 2 }}
                            >
                                {googleLoading ? 'Loading...' : 'Sign in with Google'}
                            </Button>
                        </Box>

                        {/* Divider between Google login and regular login */}
                        <Divider sx={{ width: '100%', mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                                OR
                            </Typography>
                        </Divider>

                        <Box
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            sx={{ mt: 1, width: '100%' }}
                        >
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Email Address"
                                autoComplete="email"
                                autoFocus
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: 'Enter a valid email',
                                    },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                label="Password"
                                type="password"
                                autoComplete="current-password"
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
                            <FormControlLabel
                                control={
                                    <Checkbox {...register('remember')} color="primary" />
                                }
                                label="Remember me"
                            />
                            {loginError && (
                                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                    {loginError}
                                </Alert>
                            )}
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="/forgot-password" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                                <Grid item>
                                    <Link href="/signup" variant="body2">
                                        {"Don't have an account? Sign Up"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
    );
};

export default LoginPage;
