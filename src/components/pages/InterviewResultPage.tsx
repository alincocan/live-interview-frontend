import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Paper,
    IconButton,
    Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { InterviewService, InterviewDetailsResponse } from '../../service/InterviewService';

const InterviewResultPage: React.FC = () => {
    const { interviewId } = useParams<{ interviewId: string }>();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [interviewDetails, setInterviewDetails] = useState<InterviewDetailsResponse | null>(null);

    // Current question index for slider
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Track bookmarked questions
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

    // Control tooltip visibility
    const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(true);

    // Show tooltip for 5 seconds when page loads
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowBookmarkTooltip(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const fetchInterviewDetails = async () => {
            if (!interviewId) {
                setErrorMessage('Interview ID is missing. Please try again.');
                setIsLoading(false);
                return;
            }

            try {
                const interviewService = InterviewService.getInstance();
                const response = await interviewService.getInterviewDetails(interviewId);

                if (response.success) {
                    setInterviewDetails(response);

                    // Initialize bookmarkedQuestions array with questions that have bookmarked=true
                    const bookmarkedIds = response.questions
                        .filter(question => question.bookmarked)
                        .map(question => question.id);
                    setBookmarkedQuestions(bookmarkedIds);

                    setErrorMessage(null);
                } else {
                    setErrorMessage(response.message || 'Failed to fetch interview details. Please try again.');
                }
            } catch (error) {
                console.error('Error fetching interview details:', error);
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [interviewId]);

    // Direct navigation to a specific question
    const handleGoToSlide = (index: number) => {
        if (interviewDetails && interviewDetails.questions.length > 0) {
            setCurrentQuestionIndex(index);
        }
    };

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
                        Loading interview results...
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
            ) : interviewDetails ? (
                <>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4,
                        height: { md: 'calc(100vh - 100px)' }, // Increased height to use more of the viewport
                        mb: 0 // Removed bottom margin to allow content to extend closer to the bottom of the screen
                    }}>
                        {/* Interview Details Card - Left Side */}
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
                                    Interview Summary
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
                                                {interviewDetails.jobName}
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
                                                {formatDifficulty(interviewDetails.difficulty)}
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
                                                {interviewDetails.duration} minutes
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
                                        bgcolor: interviewDetails.score >= 60 ? 'success.light' : 'error.light',
                                        color: interviewDetails.score >= 60 ? 'success.dark' : 'error.dark',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        textTransform: 'uppercase',
                                        letterSpacing: 1
                                    }}>
                                        {interviewDetails.score >= 60 ? 'PASSED' : 'FAILED'}
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
                                            {interviewDetails.score.toFixed(1)}
                                        </Typography>
                                        <Box sx={{ 
                                            mt: 1, 
                                            px: 2, 
                                            py: 0.5, 
                                            borderRadius: 5,
                                            bgcolor: interviewDetails.score >= 60 ? (
                                                        interviewDetails.score > 7 ? 'success.main' : 'warning.main'
                                                    ) : 'error.main',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5
                                        }}>
                                            {interviewDetails.score >= 60 ? (
                                                interviewDetails.score > 7 ? 'Excellent' : 'Good'
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
                            {interviewDetails.questions.length > 0 ? (
                                <>
                                    {/* Questions Linked List */}
                                    <Box sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        mb: 2,
                                        overflow: 'auto',
                                        width: '100%',
                                        py: 2,
                                        px: 1
                                    }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            minWidth: 'fit-content'
                                        }}>
                                            {interviewDetails.questions.map((question, index) => (
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
                                                    {index < interviewDetails.questions.length - 1 && (
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

                                    {/* Question Details Card */}
                                    {interviewDetails.questions.length > 0 && (
                                        <Card 
                                            sx={{ 
                                                borderRadius: 2, 
                                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                                                overflow: 'hidden',
                                                border: '2px solid #1976d2', // Added a distinctive blue border to make the change more noticeable
                                                height: '100%', // Using full height to make the card extend to the bottom of the screen
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <CardContent sx={{ 
                                                p: 0, 
                                                height: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                '&:last-child': { pb: 0 } // Override default padding
                                            }}>
                                                {/* First Row: Question and Score (20% height) */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    alignItems: 'flex-start',
                                                    p: 3,
                                                    height: '20%',
                                                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                                                    overflow: 'auto'
                                                }}>
                                                    {/* Question */}
                                                    <Box sx={{ flex: 1, pr: 2, display: 'flex', flexDirection: 'column' }}>
                                                        <Box sx={{
                                                            flex: 1, 
                                                            overflow: 'auto',
                                                            bgcolor: 'background.paper',
                                                            p: 2,
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            '&::-webkit-scrollbar': {
                                                                width: '8px',
                                                            },
                                                            '&::-webkit-scrollbar-thumb': {
                                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                                borderRadius: '4px',
                                                            }
                                                        }}>
                                                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                                                {interviewDetails.questions[currentQuestionIndex].question}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Score and Bookmark */}
                                                    <Box sx={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        mr: 2
                                                    }}>
                                                        {/* Score Circle */}
                                                        <Box sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            position: 'relative',
                                                            width: 60,
                                                            height: 60,
                                                            mr: 1
                                                        }}>
                                                            <CircularProgress 
                                                                variant="determinate" 
                                                                value={100} 
                                                                size={60} 
                                                                thickness={3}
                                                                sx={{ 
                                                                    color: interviewDetails.questions[currentQuestionIndex].score !== undefined && 
                                                                           interviewDetails.questions[currentQuestionIndex].score !== null ?
                                                                           (interviewDetails.questions[currentQuestionIndex].score >= 70 ? 'success.main' : 
                                                                           interviewDetails.questions[currentQuestionIndex].score >= 40 ? 'warning.main' : 'error.main')
                                                                           : 'grey.500',
                                                                    position: 'absolute'
                                                                }} 
                                                            />
                                                            <Typography 
                                                                variant="h6" 
                                                                component="div" 
                                                                color="text.primary" 
                                                                fontWeight="bold"
                                                                sx={{
                                                                    position: 'absolute',
                                                                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                                }}
                                                            >
                                                                {interviewDetails.questions[currentQuestionIndex].score !== undefined && 
                                                                 interviewDetails.questions[currentQuestionIndex].score !== null ? 
                                                                 interviewDetails.questions[currentQuestionIndex].score.toFixed(1) : 'N/A'}
                                                            </Typography>
                                                        </Box>

                                                        {/* Bookmark Star */}
                                                        <Tooltip 
                                                            title="You can bookmark the question from here"
                                                            open={showBookmarkTooltip}
                                                            placement="top"
                                                            arrow
                                                            componentsProps={{
                                                                tooltip: {
                                                                    sx: {
                                                                        bgcolor: 'primary.dark',
                                                                        fontSize: '0.9rem',
                                                                        padding: '8px 12px',
                                                                        borderRadius: '4px'
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <IconButton 
                                                                onClick={() => toggleBookmark(interviewDetails.questions[currentQuestionIndex].id)}
                                                                sx={{ 
                                                                    color: bookmarkedQuestions.includes(interviewDetails.questions[currentQuestionIndex].id) 
                                                                        ? 'primary.main' 
                                                                        : 'action.disabled',
                                                                    '&:hover': {
                                                                        color: bookmarkedQuestions.includes(interviewDetails.questions[currentQuestionIndex].id) 
                                                                            ? 'primary.dark' 
                                                                            : 'text.secondary'
                                                                    }
                                                                }}
                                                            >
                                                                {bookmarkedQuestions.includes(interviewDetails.questions[currentQuestionIndex].id) 
                                                                    ? <StarIcon sx={{ fontSize: '2rem' }} /> 
                                                                    : <StarBorderIcon sx={{ fontSize: '2rem' }} />
                                                                }
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </Box>

                                                {/* Second Row: Answer and Correct Answer (80% height) */}
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    height: '80%',
                                                    flexDirection: { xs: 'column', sm: 'row' }
                                                }}>
                                                    {/* Left Column: Answer */}
                                                    <Box sx={{ 
                                                        flex: 1, 
                                                        p: 3, 
                                                        borderRight: { xs: 'none', sm: '1px solid rgba(0,0,0,0.08)' },
                                                        borderBottom: { xs: '1px solid rgba(0,0,0,0.08)', sm: 'none' },
                                                        height: { xs: '50%', sm: '100%' },
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography variant="h6" gutterBottom sx={{ 
                                                            fontWeight: 'medium',
                                                            color: 'primary.main',
                                                            mb: 2
                                                        }}>
                                                            Your Answer
                                                        </Typography>
                                                        <Box sx={{ 
                                                            flex: 1, 
                                                            overflow: 'auto',
                                                            bgcolor: 'background.paper',
                                                            p: 2,
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            maxHeight: 'calc(100% - 40px)', // Subtract the height of the header
                                                            '&::-webkit-scrollbar': {
                                                                width: '8px',
                                                            },
                                                            '&::-webkit-scrollbar-thumb': {
                                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                                borderRadius: '4px',
                                                            }
                                                        }}>
                                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pb: 6 }}>
                                                                {interviewDetails.questions[currentQuestionIndex].answer || 'No answer provided'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    {/* Right Column: Correct Answer */}
                                                    <Box sx={{ 
                                                        flex: 1, 
                                                        p: 3,
                                                        height: { xs: '50%', sm: '100%' },
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography variant="h6" gutterBottom sx={{ 
                                                            fontWeight: 'medium',
                                                            color: 'success.main',
                                                            mb: 2
                                                        }}>
                                                            Correct Answer
                                                        </Typography>
                                                        <Box sx={{ 
                                                            flex: 1, 
                                                            overflow: 'auto',
                                                            bgcolor: 'background.paper',
                                                            p: 2,
                                                            borderRadius: 1,
                                                            border: '1px solid rgba(0,0,0,0.05)',
                                                            maxHeight: 'calc(100% - 40px)', // Subtract the height of the header
                                                            '&::-webkit-scrollbar': {
                                                                width: '8px',
                                                            },
                                                            '&::-webkit-scrollbar-thumb': {
                                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                                borderRadius: '4px',
                                                            }
                                                        }}>
                                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pb: 6 }}>
                                                                {interviewDetails.questions[currentQuestionIndex].correctAnswer || 'No correct answer provided'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    )}

                                </>
                            ) : (
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 4, 
                                        borderRadius: 2,
                                        border: '1px solid rgba(0,0,0,0.08)',
                                        backgroundColor: 'info.lighter',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h6" color="info.dark" sx={{ fontWeight: 'medium', mb: 1 }}>
                                        No Questions Found
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        There are no questions available for this interview.
                                    </Typography>
                                </Paper>
                            )}
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
                        No Interview Data Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                        We couldn't find any interview data for the requested ID. Please check that you have the correct interview ID or try again later.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default InterviewResultPage;
