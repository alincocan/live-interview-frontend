import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardHeader, 
    CircularProgress
} from '@mui/material';
import { UserService, User } from '../service/userService.ts';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            const userService = UserService.getInstance();

            // Check if user data already exists in storage
            let userData = userService.getUserFromStorage();

            if (!userData) {
                const response = await userService.getCurrentUser();
                if (response.success && response.user) {
                    userData = response.user;
                }
            }

            setUser(userData);
            setLoading(false);
        };

        fetchUserData();
    }, []);

    // Format date for display

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch {
            // Return the original string if date parsing fails
            return dateString;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minHeight: '80vh',
            }}
        >

            <Grid container spacing={3} sx={{ maxWidth: 1000, width: '100%' }}>
                {/* Personal Details Card */}
                <Grid item xs={12} md={7}>
                    <Card elevation={3} sx={{ height: '100%', backgroundColor: '#333333', borderRadius: 3 }}>
                        <CardHeader 
                            title="Personal Details" 
                            sx={{ 
                                backgroundColor: 'black', 
                                color: 'white',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12
                            }}
                        />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>First Name:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{user?.firstName || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Last Name:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{user?.lastName || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Email:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{user?.email || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Occupation:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{user?.occupation || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Date of Birth:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{formatDate(user?.dateOfBirth)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Joining Date:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{formatDate(user?.createTime)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2" sx={{ color: 'white' }}>Years of Experience:</Typography>
                                    <Typography variant="body1" sx={{ color: 'white' }}>{user?.yearsOfExperience || 'N/A'}</Typography>
                                </Grid>
                            </Grid>
                            <Button variant="outlined" fullWidth sx={{ mt: 3 }}>
                                Edit Profile
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payment Card */}
                <Grid item xs={12} md={5}>
                    <Card elevation={3} sx={{ height: '100%', backgroundColor: '#333333', borderRadius: 3 }}>
                        <CardHeader 
                            title="Payment Information" 
                            sx={{ 
                                backgroundColor: 'black', 
                                color: 'white',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12
                            }}
                        />
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {user?.tokens || 0}
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 3, color: 'white' }}>
                                    Available Tokens
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 4, color: 'white' }}>
                                    Tokens are used for conducting interviews and accessing premium features.
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large"
                                    onClick={() => navigate('/payment')}
                                >
                                    Buy More Tokens
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Box>
    );
};

export default ProfilePage;
