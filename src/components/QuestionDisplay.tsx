import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Typography,
    IconButton,
    Tooltip,
    Paper
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { InterviewQuestion } from '../service/InterviewService';

interface QuestionDisplayProps {
    questions: InterviewQuestion[];
    bookmarkedQuestions: string[];
    onToggleBookmark: (questionId: string) => void;
    currentQuestionIndex?: number;
    showTooltip?: boolean;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ 
    questions, 
    bookmarkedQuestions, 
    onToggleBookmark,
    currentQuestionIndex = 0,
    showTooltip = true
}) => {
    // Control tooltip visibility
    const [showBookmarkTooltip, setShowBookmarkTooltip] = useState(showTooltip);

    // Show tooltip for 5 seconds when component loads (if showTooltip is true)
    useEffect(() => {
        if (showTooltip) {
            const timer = setTimeout(() => {
                setShowBookmarkTooltip(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showTooltip]);

    return (
        <Box sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 'auto', md: '100%' },
            overflow: 'hidden'
        }}>
            {questions.length > 0 ? (
                <>

                    {/* Question Details Card */}
                    {questions.length > 0 && (
                        <Card 
                            sx={{ 
                                borderRadius: 2, 
                                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                                overflow: 'hidden',
                                border: '2px solid #1976d2',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <CardContent sx={{ 
                                p: 0, 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                '&:last-child': { pb: 0 }
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
                                                {questions[currentQuestionIndex].question}
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
                                                    color: questions[currentQuestionIndex].score !== undefined && 
                                                           questions[currentQuestionIndex].score !== null ?
                                                           (questions[currentQuestionIndex].score >= 70 ? 'success.main' : 
                                                           questions[currentQuestionIndex].score >= 40 ? 'warning.main' : 'error.main')
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
                                                {questions[currentQuestionIndex].score !== undefined && 
                                                 questions[currentQuestionIndex].score !== null ? 
                                                 questions[currentQuestionIndex].score.toFixed(1) : 'N/A'}
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
                                                onClick={() => onToggleBookmark(questions[currentQuestionIndex].id)}
                                                sx={{ 
                                                    color: bookmarkedQuestions.includes(questions[currentQuestionIndex].id) 
                                                        ? 'primary.main' 
                                                        : 'action.disabled',
                                                    '&:hover': {
                                                        color: bookmarkedQuestions.includes(questions[currentQuestionIndex].id) 
                                                            ? 'primary.dark' 
                                                            : 'text.secondary'
                                                    }
                                                }}
                                            >
                                                {bookmarkedQuestions.includes(questions[currentQuestionIndex].id) 
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
                                            maxHeight: 'calc(100% - 40px)',
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                borderRadius: '4px',
                                            }
                                        }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pb: 6 }}>
                                                {questions[currentQuestionIndex].answer || 'No answer provided'}
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
                                            maxHeight: 'calc(100% - 40px)',
                                            '&::-webkit-scrollbar': {
                                                width: '8px',
                                            },
                                            '&::-webkit-scrollbar-thumb': {
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                borderRadius: '4px',
                                            }
                                        }}>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', pb: 6 }}>
                                                {questions[currentQuestionIndex].correctAnswer || 'No correct answer provided'}
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
                        There are no questions available.
                    </Typography>
                </Paper>
            )}
        </Box>
    );
};

export default QuestionDisplay;
