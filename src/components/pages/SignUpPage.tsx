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
    InputAdornment,
    IconButton,
    Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import { AuthenticationService } from '../../service/authenticationService';
import {SignUpData} from "../../bo/SignUpData.ts";
import GoogleLogo from '../../components/icons/GoogleLogo';

const SignUpPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [yearsOfExperience, setYearsOfExperience] = useState<number | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setErrorMessage(null);

        try {
            const authService = AuthenticationService.getInstance();
            // Redirect to the Google login URL
            const googleLoginUrl = authService.getGoogleLoginUrl();
            window.location.href = googleLoginUrl;

            // Note: We don't need to set googleLoading to false here since we're redirecting
            // the user away from this page
        } catch (error) {
            console.error('Google login error:', error);
            setErrorMessage('An error occurred during Google login. Please try again.');
            setGoogleLoading(false);
        }
    };

    // Set the language for the date picker to English
    useEffect(() => {
        if (dateInputRef.current) {
            // Set multiple attributes to ensure the date picker displays in English
            dateInputRef.current.setAttribute('lang', 'en-US');
            dateInputRef.current.setAttribute('data-locale', 'en-US');
            dateInputRef.current.setAttribute('data-language', 'en');

            // Some browsers respect this format
            dateInputRef.current.setAttribute('data-date-format', 'yyyy-mm-dd');

            // Force the browser to recognize the language change
            const value = dateInputRef.current.value;
            dateInputRef.current.value = '';
            setTimeout(() => {
                if (dateInputRef.current) {
                    dateInputRef.current.value = value;
                }
            }, 10);
        }
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<SignUpData>();

    // No need to watch password field here as we're using it directly in validation

    // Handle years of experience increment/decrement
    const handleIncrement = () => {
        const newValue = (yearsOfExperience || 0) + 1;
        setYearsOfExperience(newValue);
        setValue('yearsOfExperience', newValue, { shouldValidate: true });
    };

    const handleDecrement = () => {
        if (yearsOfExperience && yearsOfExperience > 0) {
            const newValue = yearsOfExperience - 1;
            setYearsOfExperience(newValue);
            setValue('yearsOfExperience', newValue, { shouldValidate: true });
        }
    };

    const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === '' ? null : Number(e.target.value);
        setYearsOfExperience(value);
    };

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
                yearsOfExperience: data.yearsOfExperience,
                dateOfBirth: data.dateOfBirth,
                password: data.password,
                confirmPassword: data.confirmPassword
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
                            {/* Google Sign Up Button */}
                            <Box sx={{ width: '100%', mb: 2 }}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={handleGoogleLogin}
                                    disabled={googleLoading}
                                    startIcon={<GoogleLogo sx={{ fontSize: 20 }} />}
                                    sx={{ mt: 1, mb: 2 }}
                                >
                                    {googleLoading ? 'Loading...' : 'Sign up with Google'}
                                </Button>
                            </Box>

                            {/* Divider between Google signup and regular signup */}
                            <Divider sx={{ width: '100%', mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    OR
                                </Typography>
                            </Divider>

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
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Years of Experience"
                                        type="number"
                                        value={yearsOfExperience === null ? '' : yearsOfExperience}
                                        onChange={handleYearsChange}
                                        inputProps={{ 
                                            min: 0,
                                            style: { textAlign: 'center' }
                                        }}
                                        sx={{
                                            '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                WebkitAppearance: 'none',
                                                margin: 0,
                                            },
                                            '& input[type=number]': {
                                                MozAppearance: 'textfield',
                                            },
                                        }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <IconButton 
                                                        onClick={handleDecrement}
                                                        disabled={!yearsOfExperience || yearsOfExperience <= 0}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: 'action.selected',
                                                            borderRadius: '4px',
                                                            '&:hover': { bgcolor: 'action.hover' }
                                                        }}
                                                    >
                                                        <RemoveIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton 
                                                        onClick={handleIncrement}
                                                        size="small"
                                                        sx={{ 
                                                            bgcolor: 'action.selected',
                                                            borderRadius: '4px',
                                                            '&:hover': { bgcolor: 'action.hover' }
                                                        }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                        {...register('yearsOfExperience', { 
                                            required: 'Years of experience is required',
                                            valueAsNumber: true,
                                            min: {
                                                value: 0,
                                                message: 'Years must be a positive number'
                                            }
                                        })}
                                        error={!!errors.yearsOfExperience}
                                        helperText={errors.yearsOfExperience?.message}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Date of Birth"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ 
                                            lang: 'en-US',
                                            style: { textAlign: 'left' }
                                        }}
                                        InputProps={{
                                            inputRef: dateInputRef
                                        }}
                                        sx={{
                                            '& input::-webkit-calendar-picker-indicator': {
                                                filter: 'invert(0.5)'
                                            }
                                        }}
                                        {...register('dateOfBirth', { 
                                            required: 'Date of birth is required'
                                        })}
                                        error={!!errors.dateOfBirth}
                                        helperText={errors.dateOfBirth?.message}
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
                                            validate: value => {
                                                const passwordValue = watch('password');
                                                return value === passwordValue || 'Passwords do not match';
                                            }
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
