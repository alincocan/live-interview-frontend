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
    CircularProgress,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { AuthenticationService } from '../../service/authenticationService';
import {SignUpData} from "../../bo/SignUpData.ts";

const SignUpPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<SignUpData>();

    // Watch the password field to use for validation
    const password = watch('password');

    const onSubmit: SubmitHandler<SignUpData> = async (data) => {
        // Clear previous messages
        setSuccessMessage(null);
        setErrorMessage(null);
        setIsLoading(true);

        try {
            // Create SignUpData object from form data
            const signUpData: SignUpData = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                occupation: data.occupation,
                password: data.password
            };

            // Call the authentication service
            const response = await AuthenticationService.getInstance().signUp(signUpData);

            if (response.success) {
                setSuccessMessage('We have sent you a confirmation email');
            } else {
                setErrorMessage(response.message || 'Registration failed. Please try again.');
            }
        } catch (error) {
            console.error('Error during sign up:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ height: '100vh' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {!successMessage && (
                    <>
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
                            Create Account
                        </Typography>
                    </>
                )}
                {successMessage ? (
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
                    <>
                        {errorMessage && (
                            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                                {errorMessage}
                            </Alert>
                        )}
                        <Box
                            component="form"
                            noValidate
                            onSubmit={handleSubmit(onSubmit)}
                            sx={{ mt: 3 }}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        {...register('firstName', { required: 'First name is required' })}
                                        error={!!errors.firstName}
                                        helperText={errors.firstName?.message}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        {...register('lastName', { required: 'Last name is required' })}
                                        error={!!errors.lastName}
                                        helperText={errors.lastName?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email Address"
                                        autoComplete="off"
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
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Occupation"
                                        {...register('occupation', { required: 'Occupation is required' })}
                                        error={!!errors.occupation}
                                        helperText={errors.occupation?.message}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        autoComplete="new-password"
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
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type="password"
                                        {...register('confirmPassword', {
                                            required: 'Please confirm your password',
                                            validate: value =>
                                                value === password || 'Passwords do not match'
                                        })}
                                        error={!!errors.confirmPassword}
                                        helperText={errors.confirmPassword?.message}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {isLoading ? (
                                    <>
                                        <CircularProgress size={24} sx={{ mr: 1 }} />
                                        Signing Up...
                                    </>
                                ) : (
                                    'Sign Up'
                                )}
                            </Button>
                            <Button
                                fullWidth
                                variant="outlined"
                                sx={{ mb: 2 }}
                            >
                                Sign up with Google
                            </Button>
                            <Grid container justifyContent="flex-end">
                                <Grid item>
                                    <Link href="/login" variant="body2">
                                        Already have an account? Sign in
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default SignUpPage;
