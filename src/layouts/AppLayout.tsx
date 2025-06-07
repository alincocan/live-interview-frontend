import { Box, Typography, Menu, MenuItem, Divider, Avatar, Button, Tooltip, IconButton, Switch } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthenticationService } from '../service/authenticationService';
import { UserService, User } from '../service/userService';
import { useState, useEffect } from 'react';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../config/ThemeContext';

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const [user, setUser] = useState<User | null>(null);
    const { mode, toggleColorMode } = useThemeContext();

    // No state for token purchase dialog as it's now a separate page

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

        // Add event listener for token updates
        const handleTokenUpdate = (event: CustomEvent<{ tokens: number }>) => {
            setUser(currentUser => {
                if (currentUser) {
                    return {
                        ...currentUser,
                        tokens: event.detail.tokens
                    };
                }
                return currentUser;
            });
        };

        // Add event listener
        window.addEventListener('tokenUpdate', handleTokenUpdate as EventListener);

        // Clean up event listener when component unmounts
        return () => {
            window.removeEventListener('tokenUpdate', handleTokenUpdate as EventListener);
        };
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

    const handleMyInterviewsClick = () => {
        handleMenuClose();
        navigate('/interview/list');
    };

    const handleMyTrainingsClick = () => {
        handleMenuClose();
        navigate('/training/list');
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
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(6px)',
                    padding: '0.5rem 0',
                    zIndex: 100,
                    maxWidth: 'lg',
                    margin: '0 auto',
                    right: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', pl: 3 }}>
                    <Box 
                        sx={{ 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        onClick={() => navigate('/dashboard')}
                    >
                        <img 
                            src="/images/logo.png" 
                            alt="Live Interview AI Logo" 
                            style={{ 
                                height: '40px',
                                objectFit: 'contain'
                            }} 
                        />
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pr: 3 }}>
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
                        <Typography color="text.primary">Start Interview</Typography>
                    </Box>

                    {/* Trainings Menu Item */}
                    <Box 
                        onClick={() => navigate('/training/choose')}
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
                        <Typography color="text.primary">Trainings</Typography>
                    </Box>

                    {/* Learn Menu Item */}
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
                            position: 'relative',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }
                        }}
                    >
                        <MenuBookIcon sx={{ mr: 1, color: '#FF9800' }} />
                        <Typography color="text.primary">Learn</Typography>
                        <Typography 
                            variant="caption"
                            color="text.primary"
                            sx={{ 
                                position: 'absolute',
                                bottom: '-12px',
                                right: '10px',
                                backgroundColor: '#4CAF50',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                            }}
                        >
                            Coming soon
                        </Typography>
                    </Box>


                    {/* Token Balance Button */}
                    {user && (
                        <Tooltip title="Go to payment and subscriptions">
                            <Button
                                variant="contained"
                                startIcon={<AccountBalanceWalletIcon />}
                                onClick={() => navigate('/payment')}
                                sx={{
                                    mr: 2,
                                    backgroundColor: '#FFD700', // Yellow color
                                    color: '#000',
                                    '&:hover': {
                                        backgroundColor: (t) => t.palette.primary.main,
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)'
                                    },
                                    fontWeight: 'bold',
                                    borderRadius: '20px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
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
                                color="text.primary"
                                sx={{ 
                                    ml: 1,
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
                            sx: {
                                backgroundColor: (t) => t.palette.mode === 'light' ? '#ffffff' : t.palette.background.default
                            },
                        }}
                    >
                        <Box
                            sx={{
                                mb: 2,
                                padding: '8px',
                                margin: '8px 0',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <PersonIcon sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                            {user && (
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold'}}>
                                        {user.lastName} {user.firstName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                                        {user.email}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Divider />
                        <Box 
                            sx={{
                                padding: '8px', 
                                margin: '8px 0',
                            }}
                        >

                            <MenuItem 
                                onClick={handleMyInterviewsClick}
                                sx={{
                                    '& .MuiTypography-root': { 
                                        fontSize: '0.875rem' 
                                    }
                                }}
                            >
                                <ListAltIcon sx={{ mr: 1, color: '#FF9800' }} />
                                <Typography variant="body2">My Interviews</Typography>
                            </MenuItem>
                            <MenuItem 
                                onClick={handleMyTrainingsClick}
                                sx={{
                                    '& .MuiTypography-root': { 
                                        fontSize: '0.875rem' 
                                    }
                                }}
                            >
                                <SchoolIcon sx={{ mr: 1, color: '#2196F3' }} />
                                <Typography variant="body2">My Trainings</Typography>
                            </MenuItem>
                            <MenuItem 
                                onClick={handleBookmarkedQuestionsClick}
                                sx={{
                                    '& .MuiTypography-root': { 
                                        fontSize: '0.875rem' 
                                    }
                                }}
                            >
                                <BookmarkIcon sx={{ mr: 1, color: '#FF9800' }} />
                                <Typography variant="body2">Bookmarked Questions</Typography>
                            </MenuItem>
                        </Box>
                        <Divider sx={{ my: 1}}/>
                        <MenuItem onClick={handleProfileClick}>
                            <PersonIcon sx={{ mr: 1 }} />
                            Profile
                        </MenuItem>
                        <Divider />
                        <MenuItem sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {mode === 'dark' ? <Brightness7Icon sx={{ mr: 1 }} /> : <Brightness4Icon sx={{ mr: 1 }} />}
                                <Typography>{mode === 'dark' ? "Light Mode" : "Dark Mode"}</Typography>
                            </Box>
                            <Switch 
                                checked={mode === 'dark'} 
                                onChange={toggleColorMode}
                                color="primary"
                            />
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

        </Box>
    );
};

export default AppLayout;
