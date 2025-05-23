import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { InterviewService, InterviewQuestion } from '../../service/InterviewService';
import QuestionDisplay from '../QuestionDisplay';

const BookmarkedQuestionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

    // Current question index for display
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Track bookmarked questions
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);

    // Get current question's tag
    const currentQuestionTag = questions[currentQuestionIndex]?.tag || '';

    useEffect(() => {
        const fetchBookmarkedQuestions = async () => {
            try {
                const interviewService = InterviewService.getInstance();
                const response = await interviewService.getBookmarkedQuestions();

                if (response.success) {
                    setQuestions(response.questions);

                    // Initialize bookmarkedQuestions array with questions that have bookmarked=true
                    const bookmarkedIds = response.questions
                        .filter(question => question.bookmarked)
                        .map(question => question.id);
                    setBookmarkedQuestions(bookmarkedIds);

                    setErrorMessage(null);
                } else {
                    setErrorMessage(response.message || 'Failed to fetch bookmarked questions. Please try again.');
                }
            } catch (error) {
                console.error('Error fetching bookmarked questions:', error);
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookmarkedQuestions();
    }, []);

    // Toggle bookmark for a question
    const toggleBookmark = async (questionId: string) => {
        try {
            const interviewService = InterviewService.getInstance();

            // Check if we're unbookmarking the current question
            const isUnbookmarkingCurrentQuestion = questions[currentQuestionIndex]?.id === questionId;

            // Update bookmarkedQuestions state first for immediate UI feedback
            setBookmarkedQuestions(prev => {
                if (prev.includes(questionId)) {
                    return prev.filter(id => id !== questionId);
                } else {
                    return [...prev, questionId];
                }
            });

            // Call the API to update the bookmark state on the server
            const response = await interviewService.toggleBookmark(questionId);

            if (response.success) {
                // If we're unbookmarking a question, remove it from the questions list
                if (bookmarkedQuestions.includes(questionId)) {
                    // Remove the question from the questions array
                    setQuestions(prev => {
                        const updatedQuestions = prev.filter(q => q.id !== questionId);

                        // If we removed the currently displayed question and there are other questions
                        if (isUnbookmarkingCurrentQuestion && updatedQuestions.length > 0) {
                            // Select the first question
                            setCurrentQuestionIndex(0);
                        } else if (isUnbookmarkingCurrentQuestion && updatedQuestions.length === 0) {
                            // No questions left, nothing to display
                            setCurrentQuestionIndex(0);
                        } else if (currentQuestionIndex >= updatedQuestions.length) {
                            // If the current index is now out of bounds, adjust it
                            setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
                        }

                        return updatedQuestions;
                    });
                }
            } else {
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

    // Handle start training button click
    const handleStartTraining = () => {
        // Use the tag from the current question
        if (currentQuestionTag) {
            // Navigate to the training/choose route with the tag in state (not visible in URL)
            navigate('/training/choose', { state: { tag: currentQuestionTag } });
        } else {
            console.error('No tag available for the current question');
        }
    };

    return (
        <Container maxWidth={false} sx={{ py: 2, px: { xs: 2, sm: 3, md: 4 } }}>
            <Box 
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    mb: 2
                }}
            >
                <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                        fontWeight: 'bold',
                        color: 'primary.main'
                    }}
                >
                    Bookmarked Questions
                </Typography>

                {!isLoading && !errorMessage && questions.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Current question's tag */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {currentQuestionTag && (
                                <Chip
                                    key="tag"
                                    label={currentQuestionTag}
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                />
                            )}
                        </Box>

                        {/* Start training button */}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<SchoolIcon />}
                            onClick={handleStartTraining}
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            Start Training on this Topic
                        </Button>
                    </Box>
                )}
            </Box>

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
                        Loading bookmarked questions...
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
                                Error Loading Bookmarked Questions
                            </Typography>
                            <Typography variant="body1" color="error.dark">
                                {errorMessage}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ) : (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    gap: 4,
                    height: 'calc(100vh - 150px)', // Adjusted height for the page
                    mb: 0
                }}>
                    {/* Questions Table - 33% of screen width */}
                    <TableContainer component={Paper} sx={{ 
                        width: '33%', 
                        height: '100%',
                        borderRadius: 2,
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        <Table stickyHeader aria-label="bookmarked questions table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tag</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Score</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {questions.map((question, index) => (
                                    <TableRow 
                                        key={question.id}
                                        hover
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        selected={index === currentQuestionIndex}
                                        sx={{ 
                                            cursor: 'pointer',
                                            '&.Mui-selected': {
                                                backgroundColor: 'primary.lighter'
                                            },
                                            '&.Mui-selected:hover': {
                                                backgroundColor: 'primary.light',
                                                color: 'black',
                                                '& .MuiChip-root': {
                                                    color: 'black',
                                                    borderColor: 'black'
                                                }
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ 
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            '.Mui-selected:hover &': {
                                                color: 'black'
                                            }
                                        }}>
                                            {question.question}
                                        </TableCell>
                                        <TableCell sx={{
                                            '.Mui-selected:hover &': {
                                                color: 'black'
                                            }
                                        }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                {question.tag && (
                                                    <Chip
                                                        key="tag"
                                                        label={question.tag}
                                                        size="small" 
                                                        color="primary" 
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="right" sx={{
                                            '.Mui-selected:hover &': {
                                                color: 'black'
                                            }
                                        }}>
                                            {question.score !== undefined && question.score !== null 
                                                ? question.score.toFixed(1) 
                                                : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Question Display - 67% of screen width */}
                    <Box sx={{ width: '67%', height: '100%' }}>
                        <QuestionDisplay 
                            questions={questions} 
                            bookmarkedQuestions={bookmarkedQuestions} 
                            onToggleBookmark={toggleBookmark}
                            currentQuestionIndex={currentQuestionIndex}
                            showTooltip={false}
                        />
                    </Box>
                </Box>
            )}
        </Container>
    );
};

export default BookmarkedQuestionsPage;
