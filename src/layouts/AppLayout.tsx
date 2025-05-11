import { Box, Button, Typography } from '@mui/material';
import { useNavigate, Outlet } from 'react-router-dom';
import { AuthenticationService } from '../service/authenticationService';

const AppLayout: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Get the authentication service instance and call logout
        AuthenticationService.getInstance().logout();
        // Redirect to login page
        navigate('/login');
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
                <Typography variant="h6" sx={{ color: '#fff' }}>
                    Live Interview AI
                </Typography>
                <Box>
                    <Button onClick={() => navigate('/dashboard')} sx={{ color: '#fff' }}>
                        Home
                    </Button>
                    <Button onClick={() => navigate('/profile')} sx={{ color: '#fff' }}>
                        Profile
                    </Button>
                    <Button onClick={() => navigate('/settings')} sx={{ color: '#fff' }}>
                        Settings
                    </Button>
                    <Button onClick={handleLogout} sx={{ color: '#fff' }}>
                        Logout
                    </Button>
                </Box>
            </Box>

            <Box sx={{ pt: '64px' }}>
                <Outlet />
            </Box>
        </Box>
    );
};

export default AppLayout;
