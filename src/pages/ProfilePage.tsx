import { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    CardHeader, 
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Divider
} from '@mui/material';
import { UserService, User } from '../service/userService.ts';
import subscriptionsService, { Subscription } from '../service/subscriptionsService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
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

            // Fetch subscriptions data
            const subscriptionsResponse = await subscriptionsService.getSubscriptions();
            if (subscriptionsResponse.success && subscriptionsResponse.subscriptions) {
                setSubscriptions(subscriptionsResponse.subscriptions);
            }

            setUser(userData);
            setLoading(false);
        };

        fetchData();
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
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardHeader 
                            title="Personal Details" 
                            sx={{
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12
                            }}
                        />
                        <Divider sx={{ mb: 1 }} />
                        <CardContent>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">First Name:</Typography>
                                    <Typography variant="body1">{user?.firstName || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Last Name:</Typography>
                                    <Typography variant="body1">{user?.lastName || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2">Email:</Typography>
                                    <Typography variant="body1">{user?.email || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Occupation:</Typography>
                                    <Typography variant="body1">{user?.occupation || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Date of Birth:</Typography>
                                    <Typography variant="body1">{formatDate(user?.dateOfBirth)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Joining Date:</Typography>
                                    <Typography variant="body1">{formatDate(user?.createTime)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="subtitle2">Years of Experience:</Typography>
                                    <Typography variant="body1">{user?.yearsOfExperience || 'N/A'}</Typography>
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
                    <Card elevation={3} sx={{ height: '100%', borderRadius: 3 }}>
                        <CardHeader 
                            title="Payment Information" 
                            sx={{
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12
                            }}
                        />
                        <Divider sx={{ mb: 1 }} />
                        <CardContent>
                            <Box sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {user?.tokens || 0}
                                </Typography>
                                <Typography variant="h6" sx={{ mb: 3}}>
                                    Available Tokens
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 4}}>
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

                {/* Subscriptions Card */}
                <Grid item xs={12}>
                    <Card elevation={3} sx={{ backgroundColor: '#333333', borderRadius: 3, mt: 3 }}>
                        <CardHeader
                            title="Subscriptions"
                            sx={{
                                backgroundColor: 'black',
                                color: 'white',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12
                            }}
                        />
                        <CardContent>
                            {subscriptions.length > 0 ? (
                                <TableContainer component={Paper} sx={{ backgroundColor: '#444444' }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Currency</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Date</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Next Billing Date</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {subscriptions.map((subscription, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.name}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.price}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.currency}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.type}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{formatDate(subscription.startDate)}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{formatDate(subscription.nextBillingDate)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Typography variant="body1" sx={{ color: 'white', textAlign: 'center', py: 3 }}>
                                    No active subscriptions found.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

        </Box>
    );
};

export default ProfilePage;
