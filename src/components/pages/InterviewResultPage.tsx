import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    IconButton
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { InterviewService, InterviewDetailsResponse } from '../../service/InterviewService';
import QuestionDisplay from '../QuestionDisplay';

const InterviewResultPage: React.FC = () => {
    const { interviewId: sessionId } = useParams<{ interviewId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sessionDetails, setSessionDetails] = useState<InterviewDetailsResponse | null>(null);
    const questionsListRef = useRef<HTMLDivElement>(null);

    // Current question index for display
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Function to navigate to a specific question
    const handleGoToSlide = (index: number) => {
        if (sessionDetails && sessionDetails.questions.length > 0) {
            setCurrentQuestionIndex(index);
        }
    };

    // Functions for horizontal scrolling
    const scrollLeft = () => {
        if (questionsListRef.current) {
            questionsListRef.current.scrollLeft -= 85; // Scroll by one question (45px) + one connector (40px)
        }
    };

    const scrollRight = () => {
        if (questionsListRef.current) {
            questionsListRef.current.scrollLeft += 85; // Scroll by one question (45px) + one connector (40px)
        }
    };

    // Track bookmarked questions
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);


    useEffect(() => {
        const fetchSessionDetails = async () => {
            if (!sessionId) {
                setErrorMessage('Session ID is missing. Please try again.');
                setIsLoading(false);
                return;
            }

            try {
                const interviewService = InterviewService.getInstance();
                const response = await interviewService.getInterviewDetails(sessionId);

                if (response.success) {
                    setSessionDetails(response);

                    // Initialize bookmarkedQuestions array with questions that have bookmarked=true
                    const bookmarkedIds = response.questions
                        .filter(question => question.bookmarked)
                        .map(question => question.id);
                    setBookmarkedQuestions(bookmarkedIds);

                    setErrorMessage(null);
                } else {
                    setErrorMessage(response.message || 'Failed to fetch session details. Please try again.');
                }
            } catch (error) {
                console.error('Error fetching session details:', error);
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessionDetails();
    }, [sessionId]);

    // Format difficulty level for display
    const formatDifficulty = (difficulty: string) => {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    };


    // Toggle bookmark for a question
    const toggleBookmark = async (questionId: string) => {
        try {
            const interviewService = InterviewService.getInstance();

            // Update local state first for immediate UI feedback
            setBookmarkedQuestions(prev => {
                if (prev.includes(questionId)) {
                    return prev.filter(id => id !== questionId);
                } else {
                    return [...prev, questionId];
                }
            });

            // Call the API to update the bookmark state on the server
            const response = await interviewService.toggleBookmark(questionId);

            if (!response.success) {
                console.error('Failed to toggle bookmark:', response.message);
                // Revert the local state change if the API call fails
                setBookmarkedQuestions(prev => {
                    if (prev.includes(questionId)) {
                        return prev.filter(id => id !== questionId);
                    } else {
                        return [...prev, questionId];
                    }
                });
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            // Revert the local state change if an error occurs
            setBookmarkedQuestions(prev => {
                if (prev.includes(questionId)) {
                    return prev.filter(id => id !== questionId);
                } else {
                    return [...prev, questionId];
                }
            });
        }
    };

    return (
        <Container maxWidth={false} sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }}>

            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    my: 8,
                    py: 6
                }}>
                    <CircularProgress 
                        size={60} 
                        thickness={4} 
                        sx={{ 
                            color: 'primary.main',
                            mb: 3
                        }} 
                    />
                    <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ 
                            fontWeight: 'medium',
                            color: 'text.secondary',
                            animation: 'pulse 1.5s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { opacity: 0.6 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0.6 }
                            }
                        }}
                    >
                        Loading session results...
                    </Typography>
                </Box>
            ) : errorMessage ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        my: 4, 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.light',
                        backgroundColor: 'error.lighter',
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            flexShrink: 0
                        }}>
                            <Typography variant="h6">!</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" color="error.dark" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                Error Loading Results
                            </Typography>
                            <Typography variant="body1" color="error.dark">
                                {errorMessage}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ) : sessionDetails ? (
                <>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4,
                        height: { md: 'calc(100vh - 100px)' }, // Increased height to use more of the viewport
                        mb: 0 // Removed bottom margin to allow content to extend closer to the bottom of the screen
                    }}>
                        {/* Session Details Card - Left Side */}
                        <Card 
                            sx={{ 
                                borderRadius: 2, 
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                border: '1px solid rgba(0,0,0,0.05)',
                                width: { xs: '100%', md: '20%' },
                                height: { xs: 'auto', md: '100%' },
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography 
                                    variant="h5" 
                                    component="div" 
                                    gutterBottom 
                                    sx={{ 
                                        fontWeight: 'medium',
                                        pb: 1,
                                        borderBottom: '1px solid rgba(0,0,0,0.08)',
                                        mb: 3
                                    }}
                                >
                                    Session Summary
                                </Typography>
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    gap: 0, 
                                    justifyContent: 'space-between',
                                    height: '100%'
                                }}>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
                                            gap: { xs: 0.5, sm: 2 },
                                            mb: 1.5
                                        }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                                Job Position:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {sessionDetails.jobName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
                                            gap: { xs: 0.5, sm: 2 },
                                            mb: 1.5
                                        }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                                Difficulty:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {formatDifficulty(sessionDetails.difficulty)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr' },
                                            gap: { xs: 0.5, sm: 2 }
                                        }}>
                                            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                                                Duration:
                                            </Typography>
                                            <Typography variant="body1" fontWeight="bold">
                                                {sessionDetails.duration} minutes
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* PASSED/FAILED Status */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        my: 2,
                                        py: 1,
                                        borderRadius: 1,
                                        bgcolor: sessionDetails.score >= 60 ? 'success.light' : 'error.light',
                                        color: sessionDetails.score >= 60 ? 'success.dark' : 'error.dark',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1
                                    }}>
                                        {sessionDetails.score >= 60 ? 'PASSED' : 'FAILED'}
                                    </Box>

                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: 'primary.dark',
                                        minWidth: 150,
                                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.1)'
                                    }}>
                                        <Typography variant="body1" color="white" sx={{ mb: 1, fontWeight: 'medium' }}>
                                            Overall Score
                                        </Typography>
                                        <Typography 
                                            variant="h2" 
                                            color="white" 
                                            fontWeight="bold"
                                            sx={{
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            {sessionDetails.score.toFixed(1)}
                                        </Typography>
                                        <Box sx={{ 
                                            mt: 1, 
                                            px: 2, 
                                            py: 0.5, 
                                            borderRadius: 5,
                                            bgcolor: sessionDetails.score >= 60 ? (
                                                        sessionDetails.score > 7 ? 'success.main' : 'warning.main'
                                                    ) : 'error.main',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            {sessionDetails.score >= 60 ? (
                                                sessionDetails.score > 7 ? 'Excellent' : 'Good'
                                            ) : 'Needs Improvement'}
                                        </Box>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Questions Slider - Right Side */}
                        <Box sx={{ 
                            width: { xs: '100%', md: '80%' },
                            display: 'flex',
                            flexDirection: 'column',
                            height: { xs: 'auto', md: '100%' },
                            overflow: 'hidden'
                        }}>

                            {/* Questions Linked List */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                mb: 2,
                                width: '80%',
                                py: 2,
                                px: 1,
                                mx: 'auto',
                                position: 'relative'
                            }}>
                                {/* Left Navigation Button */}
                                <IconButton 
                                    onClick={scrollLeft}
                                    sx={{
                                        position: 'absolute',
                                        left: -20,
                                        zIndex: 10,
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            bgcolor: 'background.paper',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    <ChevronLeftIcon />
                                </IconButton>

                                {/* Right Navigation Button */}
                                <IconButton 
                                    onClick={scrollRight}
                                    sx={{
                                        position: 'absolute',
                                        right: -20,
                                        zIndex: 10,
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        '&:hover': {
                                            bgcolor: 'background.paper',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                        }
                                    }}
                                >
                                    <ChevronRightIcon />
                                </IconButton>

                                <Box 
                                    ref={questionsListRef}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                        width: '100%',
                                        maxWidth: '640px', // Width for 8 questions: (8 * 45px) + (7 * 40px) = 640px
                                        margin: '0 auto',
                                        overflow: 'auto',
                                        scrollBehavior: 'smooth',
                                        paddingLeft: '20px', // Add padding on the left for the first node
                                        paddingRight: '20px', // Add padding on the right for the last node
                                        '&::-webkit-scrollbar': {
                                            display: 'none'
                                        },
                                        msOverflowStyle: 'none',
                                        scrollbarWidth: 'none',
                                        '& > *': {
                                            flexShrink: 0
                                        }
                                    }}
                                >
                                    {sessionDetails.questions.map((question, index) => (
                                        <React.Fragment key={index}>
                                            {/* Question Node */}
                                            <Box 
                                                onClick={() => handleGoToSlide(index)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    width: 45,
                                                    height: 45,
                                                    bgcolor: question.score && question.score >= 70 ? 'success.main' : 
                                                            question.score && question.score >= 40 ? 'warning.main' : 'error.main',
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.85rem',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s ease',
                                                    boxShadow: index === currentQuestionIndex ? 
                                                        '0 0 0 3px white, 0 0 0 5px rgba(25, 118, 210, 0.8)' : 
                                                        '0 2px 4px rgba(0,0,0,0.1)',
                                                    border: index === currentQuestionIndex ? '2px solid' : 'none',
                                                    borderColor: 'primary.main',
                                                    transform: index === currentQuestionIndex ? 'scale(1.15)' : 'scale(1)',
                                                    zIndex: index === currentQuestionIndex ? 2 : 1,
                                                    '&:hover': {
                                                        transform: 'scale(1.1)',
                                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                                    }
                                                }}
                                            >
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="caption" sx={{ display: 'block', fontWeight: 'bold', lineHeight: 1 }}>
                                                        Q{index + 1}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                        {question.score !== undefined && question.score !== null ? question.score.toFixed(0) : 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {/* Connector Line */}
                                            {index < sessionDetails.questions.length - 1 && (
                                                <Box sx={{ 
                                                    width: 40, 
                                                    height: 3, 
                                                    bgcolor: 'grey.400',
                                                    mx: 1
                                                }} />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </Box>
                            </Box>

                            <QuestionDisplay 
                                questions={sessionDetails.questions} 
                                bookmarkedQuestions={bookmarkedQuestions} 
                                onToggleBookmark={toggleBookmark}
                                currentQuestionIndex={currentQuestionIndex}
                            />
                        </Box>
                    </Box>
                </>
            ) : (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        my: 6, 
                        p: 4, 
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: 'info.lighter',
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}
                >
                    <Box 
                        sx={{ 
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'info.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}
                    >
                        <Typography variant="h4" color="info.dark">?</Typography>
                    </Box>
                    <Typography variant="h5" color="info.dark" sx={{ fontWeight: 'medium', mb: 1 }}>
                        No Session Data Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                        We couldn't find any session data for the requested ID. Please check that you have the correct session ID or try again later.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default InterviewResultPage;
