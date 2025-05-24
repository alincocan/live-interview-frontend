import {
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Container,
    Stack,
    CircularProgress,
    Box,
} from '@mui/material';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { InterviewService, Interviewer } from '../service/InterviewService.ts';

const ChooseInterviewerPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [interviewers, setInterviewers] = useState<Interviewer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Get the tag from location state if available
    const tag = location.state?.tag;

    // Determine if this is for interview or training based on the path
    const isTraining = location.pathname.includes('/training/');
    const sessionType = isTraining ? 'TRAINING' : 'INTERVIEW';
    const pageTitle = isTraining ? 'Select Trainer' : 'Select Interviewer';

    useEffect(() => {
        const fetchInterviewers = async () => {
            try {
                setLoading(true);
                const interviewService = InterviewService.getInstance();
                const response = await interviewService.getInterviewers();

                if (response.success && response.interviewers) {
                    setInterviewers(response.interviewers);
                } else {
                    setError(response.message || 'Failed to fetch interviewers');
                }
            } catch (err) {
                setError('An error occurred while fetching interviewers');
                console.error('Error fetching interviewers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewers();
    }, []);

    return (
        <Container
            maxWidth="lg"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 8,
            }}
        >
            <Typography sx={{ mb: 5, color: 'text.secondary' }} variant="h4">
                {pageTitle}
            </Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" sx={{ my: 4 }}>
                    {error}
                </Typography>
            ) : (
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    justifyContent="center"
                    sx={{ 
                        flexWrap: 'wrap', 
                        gap: 2,
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    {interviewers.map((interviewer, index) => (
                        <Card
                            key={index}
                            sx={{
                                width: 260,
                                borderRadius: 3,
                                overflow: 'hidden',
                                boxShadow: 3,
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            <CardActionArea onClick={() => {
                                // Don't store sessionType in sessionStorage, pass it as state instead
                                // No need to store in sessionStorage

                                // If tag is available from location state and we're in training mode, we'll pass it as state
                                // No need to store in sessionStorage

                                // Navigate to the appropriate page based on session type
                                if (isTraining) {
                                    // Pass the tag, sessionType, and selectedInterviewer as state if available
                                    navigate('/training/setup', { 
                                        state: { 
                                            tag: tag || undefined,
                                            sessionType,
                                            selectedInterviewer: interviewer 
                                        } 
                                    });
                                } else {
                                    navigate('/interview/upload', { 
                                        state: { 
                                            sessionType,
                                            selectedInterviewer: interviewer 
                                        } 
                                    });
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="260"
                                    image={interviewer.avatarPath}
                                    alt={interviewer.name}
                                />
                                <CardContent>
                                    <Typography variant="h6" component="div" color="text.primary" align="center">
                                        {interviewer.name}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Stack>
            )}
        </Container>
    );
};

export default ChooseInterviewerPage;
