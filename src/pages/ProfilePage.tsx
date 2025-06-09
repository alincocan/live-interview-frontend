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
    IconButton,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    RadioGroup,
    Radio,
    FormControlLabel,
    TextField,
    FormControl,
    FormLabel,
    Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { UserService, User } from '../service/userService.ts';
import subscriptionsService, { Subscription } from '../service/subscriptionsService';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // State for cancel subscription dialog
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string>('');
    const [cancelReason, setCancelReason] = useState<string>('');
    const [otherReason, setOtherReason] = useState<string>('');

    // Predefined reasons for cancellation
    const cancellationReasons = [
        "Too expensive",
        "Not using the service enough",
        "Found a better alternative",
        "Technical issues",
        "Temporary pause, will subscribe again later"
    ];

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

    // Open the cancel subscription dialog
    const openCancelDialog = (subscriptionId: string) => {
        setSelectedSubscriptionId(subscriptionId);
        setCancelReason('');
        setOtherReason('');
        setCancelDialogOpen(true);
    };

    // Close the cancel subscription dialog
    const closeCancelDialog = () => {
        setCancelDialogOpen(false);
    };

    // Handle reason change
    const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCancelReason(event.target.value);
    };

    // Handle other reason text change
    const handleOtherReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setOtherReason(event.target.value);
    };

    // Handle the actual subscription cancellation
    const handleCancelSubscription = async () => {
        // Get the final reason (either selected from predefined or custom "other" reason)
        const finalReason = cancelReason === 'Other' ? otherReason : cancelReason;

        // Close the dialog
        closeCancelDialog();

        // Call the service with the subscription ID and reason
        const response = await subscriptionsService.cancelSubscription(selectedSubscriptionId, finalReason);

        if (response.success) {
            // Show success notification
            setNotification({
                open: true,
                message: response.message,
                severity: 'success'
            });

            // Remove the subscription from the list
            setSubscriptions(subscriptions.filter(sub => sub.subscriptionId !== selectedSubscriptionId));

            // Auto-dismiss success message after 5 seconds
            setTimeout(() => {
                setNotification(prev => ({...prev, open: false}));
            }, 5000);
        } else {
            // Show error notification
            setNotification({
                open: true,
                message: response.message,
                severity: 'error'
            });
        }
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({...prev, open: false}));
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
            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={notification.severity === 'success' ? 5000 : null}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

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
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tokens</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Start Date</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Next Billing Date</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {subscriptions.map((subscription, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.name}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.price}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.currency}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.tokens}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{subscription.type}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{formatDate(subscription.startDate)}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>{formatDate(subscription.nextBillingDate)}</TableCell>
                                                    <TableCell sx={{ color: 'white' }}>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => openCancelDialog(subscription.subscriptionId)}
                                                            size="small"
                                                            title="Cancel subscription"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
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

            {/* Cancellation Confirmation Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={closeCancelDialog}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    style: {
                        backgroundColor: '#333333',
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)'
                    }
                }}
            >
                <DialogTitle sx={{ color: 'white' }}>
                    Are you sure you want to cancel this subscription?
                </DialogTitle>
                <DialogContent sx={{ color: 'white' }}>
                    <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
                        <FormLabel component="legend" sx={{ color: 'white' }}>Please select a reason for cancellation:</FormLabel>
                        <RadioGroup
                            aria-label="cancellation-reason"
                            name="cancellation-reason"
                            value={cancelReason}
                            onChange={handleReasonChange}
                            sx={{ color: 'white' }}
                        >
                            {cancellationReasons.map((reason, index) => (
                                <FormControlLabel
                                    key={index}
                                    value={reason}
                                    control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#90caf9' } }} />}
                                    label={reason}
                                    sx={{ color: 'white' }}
                                />
                            ))}
                            <FormControlLabel
                                value="Other"
                                control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: '#90caf9' } }} />}
                                label="Other"
                                sx={{ color: 'white' }}
                            />
                        </RadioGroup>

                        {cancelReason === 'Other' && (
                            <TextField
                                label="Please specify"
                                variant="outlined"
                                fullWidth
                                value={otherReason}
                                onChange={handleOtherReasonChange}
                                margin="normal"
                                required
                                error={cancelReason === 'Other' && otherReason.trim() === ''}
                                helperText={cancelReason === 'Other' && otherReason.trim() === '' ? 'Please provide a reason' : ''}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'rgba(255, 255, 255, 0.5)',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: '#90caf9',
                                        },
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                    '& .MuiInputBase-input': {
                                        color: 'white',
                                    },
                                    '& .MuiFormHelperText-root': {
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    },
                                }}
                            />
                        )}
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                    <Button
                        onClick={closeCancelDialog}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            '&:hover': {
                                color: 'white',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)'
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCancelSubscription}
                        color="error"
                        variant="contained"
                        disabled={cancelReason === '' || (cancelReason === 'Other' && otherReason.trim() === '')}
                        sx={{
                            '&.Mui-disabled': {
                                backgroundColor: 'rgba(211, 47, 47, 0.3)',
                                color: 'rgba(255, 255, 255, 0.4)'
                            }
                        }}
                    >
                        Confirm Cancellation
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfilePage;
