import { Box, Typography, Menu, MenuItem, Divider, Avatar, Button, Tooltip, IconButton, Switch, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
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
import MenuIcon from '@mui/icons-material/Menu';
import { useThemeContext } from '../config/ThemeContext';

const AppLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const open = Boolean(anchorEl);
    const [user, setUser] = useState<User | null>(null);
    const { mode, toggleColorMode } = useThemeContext();

    // Check if current page is interview or training session
    const isSessionPage = location.pathname === '/interview/session' || location.pathname === '/training/session';

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

    const handleDrawerOpen = () => {
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
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
            {/* Modern transparent top menu - hidden on session pages */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    display: isSessionPage ? 'none' : 'flex',
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
                    {/* Mobile Menu Button - only visible on mobile */}
                    {isMobile && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerOpen}
                            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

                    {/* Desktop Navigation - hidden on mobile */}
                    {!isMobile && (
                        <>
                            {/* Start Interview Menu Item */}
                            <Box 
                                onClick={() => navigate('/interview/choose')}
                                sx={{
                                    mr: 2,
                                    color: '#fff',
                                    display: { xs: 'none', md: 'flex' },
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
                                    display: { xs: 'none', md: 'flex' },
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
                                    display: { xs: 'none', md: 'flex' },
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
                        </>
                    )}

                    {/* Token Balance Button - responsive styling */}
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
                                    // Hide text on small mobile screens, show only icon
                                    '& .MuiButton-startIcon': {
                                        mr: { xs: 0, sm: 1 }
                                    },
                                    '& .MuiButton-endIcon': {
                                        ml: { xs: 0, sm: 1 }
                                    },
                                    minWidth: { xs: '40px', sm: 'auto' },
                                    px: { xs: 1, sm: 2 }
                                }}
                            >
                                <Typography sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {user.tokens || 0} Tokens
                                </Typography>
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
                        {user && !isMobile && (
                            <Typography 
                                variant="body1"
                                color="text.primary"
                                sx={{ 
                                    ml: 1,
                                    display: { xs: 'none', sm: 'block' }
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

            <Box sx={{ pt: isSessionPage ? 0 : '64px' }}>
                <Outlet />
            </Box>

            {/* Mobile Navigation Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={handleDrawerClose}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '80%',
                        maxWidth: '300px',
                        boxSizing: 'border-box',
                        backgroundColor: (t) => t.palette.background.paper,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                    <img 
                        src="/images/logo.png" 
                        alt="Live Interview AI Logo" 
                        style={{ 
                            height: '40px',
                            objectFit: 'contain'
                        }} 
                        onClick={() => {
                            navigate('/dashboard');
                            handleDrawerClose();
                        }}
                    />
                </Box>
                <List sx={{ width: '100%' }}>
                    {/* Start Interview */}
                    <ListItem 
                        button 
                        onClick={() => {
                            navigate('/interview/choose');
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <PlayArrowIcon sx={{ color: '#4CAF50' }} />
                        </ListItemIcon>
                        <ListItemText primary="Start Interview" />
                    </ListItem>

                    {/* Trainings */}
                    <ListItem 
                        button 
                        onClick={() => {
                            navigate('/training/choose');
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <SchoolIcon sx={{ color: '#2196F3' }} />
                        </ListItemIcon>
                        <ListItemText primary="Trainings" />
                    </ListItem>

                    {/* Learn */}
                    <ListItem 
                        button 
                        onClick={() => {
                            navigate('/interview/list');
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <MenuBookIcon sx={{ color: '#FF9800' }} />
                        </ListItemIcon>
                        <ListItemText 
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography>Learn</Typography>
                                    <Typography 
                                        variant="caption"
                                        sx={{ 
                                            ml: 1,
                                            backgroundColor: '#4CAF50',
                                            padding: '2px 6px',
                                            borderRadius: '10px',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}
                                    >
                                        Coming soon
                                    </Typography>
                                </Box>
                            } 
                        />
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    {/* My Interviews */}
                    <ListItem 
                        button 
                        onClick={() => {
                            handleMyInterviewsClick();
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <ListAltIcon sx={{ color: '#FF9800' }} />
                        </ListItemIcon>
                        <ListItemText primary="My Interviews" />
                    </ListItem>

                    {/* My Trainings */}
                    <ListItem 
                        button 
                        onClick={() => {
                            handleMyTrainingsClick();
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <SchoolIcon sx={{ color: '#2196F3' }} />
                        </ListItemIcon>
                        <ListItemText primary="My Trainings" />
                    </ListItem>

                    {/* Bookmarked Questions */}
                    <ListItem 
                        button 
                        onClick={() => {
                            handleBookmarkedQuestionsClick();
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <BookmarkIcon sx={{ color: '#FF9800' }} />
                        </ListItemIcon>
                        <ListItemText primary="Bookmarked Questions" />
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Profile */}
                    <ListItem 
                        button 
                        onClick={() => {
                            handleProfileClick();
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItem>

                    {/* Dark/Light Mode Toggle */}
                    <ListItem sx={{ py: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ListItemIcon>
                                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                            </ListItemIcon>
                            <ListItemText primary={mode === 'dark' ? "Light Mode" : "Dark Mode"} />
                        </Box>
                        <Switch
                            checked={mode === 'dark'}
                            onChange={toggleColorMode}
                            color="primary"
                        />
                    </ListItem>

                    <Divider sx={{ my: 1 }} />

                    {/* Logout */}
                    <ListItem 
                        button 
                        onClick={() => {
                            handleLogout();
                            handleDrawerClose();
                        }}
                        sx={{ py: 2 }}
                    >
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>
        </Box>
    );
};

export default AppLayout;
