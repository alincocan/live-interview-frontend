import React, { useState, useEffect } from 'react';
import {
    Avatar,
    Button,
    TextField,
    Paper,
    Box,
    Typography,
    Alert,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { UserService, User } from '../service/userService.ts';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// Define the form data interface for user profile update
interface UserProfileFormData {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    yearsOfExperience: number;
    occupation: string;
}

const ProfileUpdatePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [updateError, setUpdateError] = useState<string>('');
    const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

    // Form handling
    const { control, handleSubmit, formState: { errors }, setValue } = useForm<UserProfileFormData>();

    useEffect(() => {
        // Fetch user data when component mounts
        const fetchUserData = async () => {
            try {
                const userService = UserService.getInstance();
                const response = await userService.getCurrentUser();
                
                if (response.success && response.user) {
                    setUser(response.user);
                    
                    // Pre-fill form with existing data
                    if (response.user.firstName) setValue('firstName', response.user.firstName);
                    if (response.user.lastName) setValue('lastName', response.user.lastName);
                    if (response.user.dateOfBirth) setValue('dateOfBirth', response.user.dateOfBirth);
                    if (response.user.yearsOfExperience) setValue('yearsOfExperience', response.user.yearsOfExperience || 1);
                    if (response.user.occupation) setValue('occupation', response.user.occupation);
                } else {
                    // If we can't get the user data, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate, setValue]);

    // Function to handle form submission
    const onSubmitProfileUpdate: SubmitHandler<UserProfileFormData> = async (data) => {
        try {
            setUpdateError('');
            setUpdateSuccess(false);

            if (!user) {
                setUpdateError('User data not available');
                return;
            }

            const userService = UserService.getInstance();
            // Include the user ID in the update request
            const response = await userService.updateUser({
                ...data,
                id: user.id
            });

            if (response.success && response.user) {
                setUpdateSuccess(true);
                setUser(response.user);

                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setUpdateError(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setUpdateError('An unexpected error occurred');
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                backgroundImage: 'url(https://source.unsplash.com/random/1600x900?nature)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        >
            <Paper 
                elevation={6} 
                sx={{ 
                    width: '100%', 
                    maxWidth: '500px',
                    mx: 2,
                    p: 4,
                    borderRadius: 2
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
                        <PersonIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Complete Your Profile
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
                        Please provide the following information to complete your profile before continuing.
                    </Typography>

                    {updateSuccess ? (
                        <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                            Profile updated successfully! Redirecting to dashboard...
                        </Alert>
                    ) : (
                        <Box component="form" onSubmit={handleSubmit(onSubmitProfileUpdate)} noValidate sx={{ mt: 1, width: '100%' }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Controller
                                    name="firstName"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: 'First name is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            fullWidth
                                            label="First Name"
                                            error={!!errors.firstName}
                                            helperText={errors.firstName?.message}
                                            sx={{ mb: 2 }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="lastName"
                                    control={control}
                                    defaultValue=""
                                    rules={{ required: 'Last name is required' }}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            fullWidth
                                            label="Last Name"
                                            error={!!errors.lastName}
                                            helperText={errors.lastName?.message}
                                            sx={{ mb: 2 }}
                                        />
                                    )}
                                />
                            </Box>

                            <Controller
                                name="dateOfBirth"
                                control={control}
                                defaultValue=""
                                rules={{ required: 'Date of birth is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        fullWidth
                                        label="Date of Birth"
                                        type="date"
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.dateOfBirth}
                                        helperText={errors.dateOfBirth?.message}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                            />

                            <Controller
                                name="yearsOfExperience"
                                control={control}
                                defaultValue={1}
                                rules={{ 
                                    required: 'Years of experience is required',
                                    min: { value: 1, message: 'Years of experience must be at least 1' }
                                }}
                                render={({ field }) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <IconButton 
                                            onClick={() => {
                                                const newValue = Math.max(1, Number(field.value) - 1);
                                                field.onChange(newValue);
                                            }}
                                            disabled={Number(field.value) <= 1}
                                        >
                                            <RemoveIcon />
                                        </IconButton>
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            fullWidth
                                            label="Years of Experience"
                                            type="number"
                                            error={!!errors.yearsOfExperience}
                                            helperText={errors.yearsOfExperience?.message}
                                            sx={{ 
                                                mx: 1,
                                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                                    '-webkit-appearance': 'none',
                                                    margin: 0,
                                                },
                                                '& input[type=number]': {
                                                    '-moz-appearance': 'textfield',
                                                },
                                            }}
                                            InputProps={{
                                                inputProps: { min: 1 }
                                            }}
                                        />
                                        <IconButton 
                                            onClick={() => {
                                                const newValue = Number(field.value) + 1;
                                                field.onChange(newValue);
                                            }}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Box>
                                )}
                            />

                            <Controller
                                name="occupation"
                                control={control}
                                defaultValue=""
                                rules={{ required: 'Occupation is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        margin="normal"
                                        fullWidth
                                        label="Occupation"
                                        error={!!errors.occupation}
                                        helperText={errors.occupation?.message}
                                        sx={{ mb: 2 }}
                                    />
                                )}
                            />

                            {updateError && (
                                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                                    {updateError}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Update Profile
                            </Button>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfileUpdatePage;