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
import { AuthenticationService } from '../../service/authenticationService';

type Inputs = {
    email: string;
};

const ForgotPasswordPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Inputs>();

    const [isLoading, setIsLoading] = useState(false);
    const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        setIsLoading(true);
        setResponseMessage(null);

        try {
            const authService = AuthenticationService.getInstance();
            const response = await authService.recoverPassword(data.email);

            if (response.success) {
                setResponseMessage({
                    type: 'success',
                    text: response.message || 'Password recovery email sent successfully!'
                });
            } else {
                setResponseMessage({
                    type: 'error',
                    text: response.message || 'Failed to send recovery email. Please try again.'
                });
            }
        } catch (error) {
            console.error('Password recovery error:', error);
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
                    Forgot Password
                </Typography>
                <Box
                    component="form"
                    noValidate
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ mt: 3 }}
                >
                    <TextField
                        fullWidth
                        label="Email Address"
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
                    {responseMessage && (
                        <Alert 
                            severity={responseMessage.type} 
                            sx={{ mt: 2, width: '100%' }}
                        >
                            {responseMessage.text}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href="/login" variant="body2">
                                Back to Sign In
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default ForgotPasswordPage;
