import { Box, Typography, Menu, MenuItem, Divider, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthenticationService } from '../service/authenticationService';
import { UserService, User } from '../service/userService';
import { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [user, setUser] = useState<User | null>(null);

    // State for token purchase dialog
    const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
    const [tokenAmount, setTokenAmount] = useState<number>(100);
    const [purchaseError, setPurchaseError] = useState<string>('');
    const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);

    // Form handling for token purchase is not needed here

    // Function to check if required fields are missing
    const checkMissingFields = (userData: User | null): string[] => {
        if (!userData) return [];

        const requiredFields: Array<{ field: keyof User, label: string }> = [
            { field: 'firstName', label: 'First Name' },
            { field: 'lastName', label: 'Last Name' },
            { field: 'dateOfBirth', label: 'Date of Birth' },
            { field: 'occupation', label: 'Occupation' }
        ];

        // Get missing fields from the required fields list
        const missing = requiredFields
            .filter(({ field }) => !userData[field])
            .map(({ label }) => label);

        // Special check for yearsOfExperience being 0
        if (userData.yearsOfExperience === 0) {
            missing.push('Years of Experience');
        }

        return missing;
    };


    useEffect(() => {
        // Fetch user data when component mounts
        const fetchUserData = async () => {
            try {
                const userService = UserService.getInstance();
                // Check if user data already exists in storage
                let storedUser = null;

                // If not, fetch from server
                const response = await userService.getCurrentUser();
                if (response.success && response.user) {
                    storedUser = response.user;
                }

                // Set the user state
                setUser(storedUser);

                // Check for missing fields and redirect to profile update page if needed
                if (storedUser) {
                    const missing = checkMissingFields(storedUser);
                    if (missing.length > 0) {
                        // Redirect to profile update page
                        navigate('/profile-update');
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleMenuClose();
        navigate('/profile');
    };

    const handleLogout = () => {
        handleMenuClose();
        // Get the authentication service instance and call logout
        AuthenticationService.getInstance().logout();
        // Clear user data from storage
        UserService.getInstance().clearUserData();
        // Redirect to login page
        navigate('/login');
    };

    const handleBookmarkedQuestionsClick = () => {
        handleMenuClose();
        navigate('/questions/bookmarked');
    };

    const handleOpenPurchaseDialog = () => {
        setPurchaseDialogOpen(true);
        setPurchaseError('');
        setPurchaseSuccess(false);
    };

    const handleClosePurchaseDialog = () => {
        setPurchaseDialogOpen(false);
    };

    const handleTokenAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value);
        if (!isNaN(value) && value > 0) {
            setTokenAmount(value);
        }
    };

    const handlePurchaseTokens = async () => {
        try {
            setPurchaseError('');
            setPurchaseSuccess(false);

            const userService = UserService.getInstance();
            const response = await userService.purchaseTokens(tokenAmount);

            if (response.success) {
                setPurchaseSuccess(true);
                // Update user state with new token balance
                if (user && response.newTokenBalance !== undefined) {
                    setUser({
                        ...user,
                        tokens: response.newTokenBalance
                    });
                }

                // Close dialog after a short delay
                setTimeout(() => {
                    setPurchaseDialogOpen(false);
                }, 1500);
            } else {
                setPurchaseError(response.message || 'Failed to purchase tokens');
            }
        } catch (error) {
            console.error('Error purchasing tokens:', error);
            setPurchaseError('An unexpected error occurred');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundImage: 'url(https://source.unsplash.com/random/1600x900?nature)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                overflowX: 'hidden', // prevent right overflow
                m: 0,
                p: 0,
            }}
        >
            {/* Modern transparent top menu */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '99%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    backdropFilter: 'blur(6px)',
                    padding: '0.5rem 1rem',
                    zIndex: 100,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            color: '#fff',
                            cursor: 'pointer'
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        Live Interview AI
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                    {/* Start Interview Menu Item */}
                    <Box 
                        onClick={() => navigate('/interview/choose')}
                        sx={{
                            mr: 2,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <PlayArrowIcon sx={{ mr: 1, color: '#4CAF50' }} />
                        <Typography>Start Interview</Typography>
                    </Box>

                    {/* Trainings Menu Item */}
                    <Box 
                        onClick={() => navigate('/trainings')}
                        sx={{
                            mr: 2,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <SchoolIcon sx={{ mr: 1, color: '#2196F3' }} />
                        <Typography>Trainings</Typography>
                    </Box>

                    {/* Interview List Menu Item */}
                    <Box 
                        onClick={() => navigate('/interview/list')}
                        sx={{
                            mr: 2,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <ListAltIcon sx={{ mr: 1, color: '#FF9800' }} />
                        <Typography>My Interviews</Typography>
                    </Box>

                    {/* Token Balance Button */}
                    {user && (
                        <Tooltip title="Click to buy more tokens">
                            <Button
                                variant="contained"
                                startIcon={<AccountBalanceWalletIcon />}
                                onClick={handleOpenPurchaseDialog}
                                sx={{
                                    mr: 2,
                                    backgroundColor: '#FFD700', // Yellow color
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: '#FFC400',
                                    },
                                    fontWeight: 'bold',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)'
                                    }
                                }}
                            >
                                {user.tokens || 0} Tokens
                            </Button>
                        </Tooltip>
                    )}

                    <Box 
                        sx={{ 
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            color: '#fff'
                        }}
                        onClick={handleMenuOpen}
                        aria-controls={open ? 'profile-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                    >
                        <Avatar 
                            sx={{ 
                                width: 40, 
                                height: 40, 
                                bgcolor: 'primary.main',
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)'
                                }
                            }}
                        >
                            <PersonIcon />
                        </Avatar>
                        {user && (
                            <Typography 
                                variant="body1" 
                                sx={{ 
                                    ml: 1,
                                    color: '#fff'
                                }}
                            >
                                {user.lastName} {user.firstName}
                            </Typography>
                        )}
                    </Box>
                    <Menu
                        id="profile-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleMenuClose}
                        MenuListProps={{
                            'aria-labelledby': 'profile-button',
                        }}
                        PaperProps={{
                            style: {
                                width: '250px',
                            },
                        }}
                    >
                        <MenuItem onClick={handleBookmarkedQuestionsClick}>
                            <BookmarkIcon sx={{ mr: 1, color: '#FF9800' }} />
                            Bookmarked Questions
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleProfileClick}>
                            <PersonIcon sx={{ mr: 1 }} />
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Box>

            <Box sx={{ pt: '64px' }}>
                <Outlet />
            </Box>

            {/* Token Purchase Dialog */}
            <Dialog open={purchaseDialogOpen} onClose={handleClosePurchaseDialog}>
                <DialogTitle>Purchase Tokens</DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        {purchaseSuccess ? (
                            <Typography color="success.main" sx={{ mb: 2 }}>
                                Tokens purchased successfully!
                            </Typography>
                        ) : (
                            <>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    How many tokens would you like to purchase?
                                </Typography>
                                <TextField
                                    label="Token Amount"
                                    type="number"
                                    fullWidth
                                    value={tokenAmount}
                                    onChange={handleTokenAmountChange}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton 
                                                size="small" 
                                                onClick={() => setTokenAmount(tokenAmount + 100)}
                                            >
                                                <AddIcon />
                                            </IconButton>
                                        ),
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                {purchaseError && (
                                    <Typography color="error" sx={{ mb: 2 }}>
                                        {purchaseError}
                                    </Typography>
                                )}
                            </>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePurchaseDialog} color="primary">
                        Cancel
                    </Button>
                    {!purchaseSuccess && (
                        <Button 
                            onClick={handlePurchaseTokens} 
                            variant="contained" 
                            color="primary"
                            disabled={tokenAmount <= 0}
                        >
                            Purchase
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default AppLayout;
