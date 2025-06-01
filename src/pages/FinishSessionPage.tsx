import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Paper,
} from '@mui/material';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

const FinishSessionPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sessionId = sessionStorage.getItem('sessionId');

    const isTraining = location.pathname.includes('training/finish');

    const handleSeeResults = () => {
        if (sessionId) {
            navigate(`/interview/${sessionId}`);
        } else {
            navigate('/interview');
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <SentimentVerySatisfiedIcon sx={{ fontSize: 120, color: 'success.main' }} />

                    <Typography variant="h4" component="h1" gutterBottom>
                        {isTraining ? 'Training Completed Successfully!' : 'Interview Completed Successfully!'}
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Congratulations! You have successfully completed the {isTraining ? 'training' : 'interview'}.
                        Your answers have been recorded and analyzed.
                    </Typography>

                    <Button 
                        variant="contained" 
                        color="primary" 
                        size="large"
                        onClick={handleSeeResults}
                        sx={{ mt: 2 }}
                    >
                        See the Results
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default FinishSessionPage;
