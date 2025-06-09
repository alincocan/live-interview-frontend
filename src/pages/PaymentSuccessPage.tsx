import { 
    Box, 
    Button, 
    Container, 
    Typography, 
    Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

const PaymentSuccessPage = () => {
    const navigate = useNavigate();

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <Box sx={{ 
            background: 'linear-gradient(to bottom, #000000, #000846)',
            minHeight: '100vh',
            pt: 8,
            pb: 8
        }}>
            <Container maxWidth="md">
                <Paper
                    elevation={3}
                    sx={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        p: 4,
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <Box sx={{ py: 4 }}>
                        <CheckCircleIcon sx={{ fontSize: 80, color: '#4CAF50', mb: 2 }} />
                        <Typography variant="h4" gutterBottom>
                            Payment Successful!
                        </Typography>
                        <Typography variant="h6" sx={{ mb: 4 }}>
                            Thank you for your purchase
                        </Typography>
                        <Button 
                            variant="contained" 
                            onClick={handleGoToDashboard}
                            size="large"
                            sx={{
                                backgroundColor: '#4CAF50',
                                color: '#fff',
                                fontWeight: 'bold',
                                px: 4,
                                py: 1.5,
                                '&:hover': {
                                    backgroundColor: '#388E3C',
                                },
                            }}
                        >
                            Go to Dashboard
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default PaymentSuccessPage;
