import {
    Box,
    Button,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    Container,
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from 'react-router-dom';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/details');
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
                    My Dashboard
                </Typography>
                <Box>
                    <Button onClick={() => navigate('/dashboard')} sx={{ color: '#fff' }}>
                        Home
                    </Button>
                    <Button onClick={() => navigate('/dashboard/profile')} sx={{ color: '#fff' }}>
                        Profile
                    </Button>
                    <Button onClick={() => navigate('/settings')} sx={{ color: '#fff' }}>
                        Settings
                    </Button>
                    <Button onClick={() => navigate('/logout')} sx={{ color: '#fff' }}>
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

export default DashboardPage;