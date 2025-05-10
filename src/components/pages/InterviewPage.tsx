import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Paper,
    TextField,
    Button,
    Snackbar,
} from '@mui/material';
import { 
    InterviewService, 
    InterviewQuestion, 
    ValidateAnswerRequest,
    FinalizeInterviewRequest
} from '../../service/InterviewService';

const InterviewPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isValidating, setIsValidating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showValidationError, setShowValidationError] = useState(false);
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [remainingTime, setRemainingTime] = useState(0);
    const [interviewStarted, setInterviewStarted] = useState(false);
    const [interviewCompleted, setInterviewCompleted] = useState(false);
    const [isFinalized, setIsFinalized] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalizeError, setFinalizeError] = useState<string | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [interviewData, setInterviewData] = useState({
        duration: 0,
        jobName: '',
        softSkillsPercentage: 0,
        difficulty: '',
        tags: [] as string[]
    });


    useEffect(() => {
        // Initialize session storage with default values if not already set
        sessionStorage.setItem('duration', '10');
        sessionStorage.setItem('jobName', 'Java Developer');
        sessionStorage.setItem('softSkillsPercentage', '10');
        sessionStorage.setItem('difficulty', 'JUNIOR');
        sessionStorage.setItem('tags', JSON.stringify(['Collections', 'Multi-Threading', 'Exceptions']));

        // Fetch data from sessionStorage
        const duration = sessionStorage.getItem('duration');
        const jobName = sessionStorage.getItem('jobName');
        const softSkillsPercentage = sessionStorage.getItem('softSkillsPercentage');
        const difficulty = sessionStorage.getItem('difficulty');
        const tags = sessionStorage.getItem('tags');

        if (!duration || !jobName || !softSkillsPercentage || !tags || !difficulty) {
            setErrorMessage('Missing interview configuration data. Please set up the interview first.');
            setIsLoading(false);
            return;
        }

        // Parse the data
        const parsedData = {
            duration: parseInt(duration, 10),
            jobName,
            softSkillsPercentage: parseInt(softSkillsPercentage, 10),
            difficulty,
            tags: JSON.parse(tags)
        };

        setInterviewData(parsedData);

        // Initialize the timer with duration in minutes converted to seconds
        setRemainingTime(parsedData.duration * 60);

        // Set loading to false after initializing data
        setIsLoading(false);
    }, []);

    // Timer countdown effect
    useEffect(() => {
        if (remainingTime <= 0 || isLoading || !interviewStarted) return;

        const timer = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingTime, isLoading, interviewStarted]);

    // Function to start the interview
    const startInterview = () => {
        setIsLoading(true);
        setInterviewStarted(true);
        setCurrentQuestionIndex(0);
        setUserAnswer('');

        // Generate interview questions when the interview starts
        generateInterviewQuestions(interviewData);
    };

    // Function to handle moving to the next question
    const handleNextQuestion = async () => {
        if (userAnswer.trim() === '') {
            setValidationError('Please provide an answer before proceeding.');
            setShowValidationError(true);
            return;
        }

        setIsValidating(true);

        try {
            const interviewService = InterviewService.getInstance();
            const interviewId = sessionStorage.getItem('interviewId');
            const jobName = sessionStorage.getItem('jobName');

            const request: ValidateAnswerRequest = {
                questionId: questions[currentQuestionIndex].id,
                question: questions[currentQuestionIndex].question,
                answer: userAnswer,
                interviewId: interviewId || undefined,
                jobName: jobName || undefined,
                tags: questions[currentQuestionIndex].tags,
                softSkill: questions[currentQuestionIndex].softSkill
            };

            const response = await interviewService.validateAnswer(request);

            if (response.success) {
                // If validation is successful, move to the next question
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                    setUserAnswer('');
                }
                setValidationError(null);
            } else {
                // If validation fails, show error message
                setValidationError(response.message || 'Failed to validate your answer. Please try again.');
                setShowValidationError(true);
            }
        } catch (error) {
            console.error('Error validating answer:', error);
            setValidationError('An unexpected error occurred. Please try again.');
            setShowValidationError(true);
        } finally {
            setIsValidating(false);
        }
    };

    // Function to handle finishing the interview
    const handleFinishInterview = async () => {
        if (userAnswer.trim() === '') {
            setValidationError('Please provide an answer before finishing.');
            setShowValidationError(true);
            return;
        }

        setIsValidating(true);

        try {
            const interviewService = InterviewService.getInstance();
            const interviewId = sessionStorage.getItem('interviewId');
            const jobName = sessionStorage.getItem('jobName');

            const request: ValidateAnswerRequest = {
                questionId: questions[currentQuestionIndex].id,
                question: questions[currentQuestionIndex].question,
                answer: userAnswer,
                interviewId: interviewId || undefined,
                jobName: jobName || undefined,
                tags: questions[currentQuestionIndex].tags,
                softSkill: questions[currentQuestionIndex].softSkill
            };

            const response = await interviewService.validateAnswer(request);

            if (response.success) {
                // If validation is successful, mark the interview as completed
                setInterviewCompleted(true);
                setValidationError(null);

                // Call the finalize endpoint if we have an interviewId
                if (interviewId) {
                    setIsFinalizing(true);
                    try {
                        const finalizeRequest: FinalizeInterviewRequest = {
                            interviewId: interviewId
                        };

                        const finalizeResponse = await interviewService.finalizeInterview(finalizeRequest);

                        if (finalizeResponse.success) {
                            setIsFinalized(true);
                            setFinalizeError(null);
                        } else {
                            setIsFinalized(false);
                            setFinalizeError(finalizeResponse.message || 'Failed to finalize interview. Please try again.');
                        }
                    } catch (finalizeError) {
                        console.error('Error finalizing interview:', finalizeError);
                        setIsFinalized(false);
                        setFinalizeError('An unexpected error occurred while finalizing the interview. Please try again.');
                    } finally {
                        setIsFinalizing(false);
                    }
                }
            } else {
                // If validation fails, show error message
                setValidationError(response.message || 'Failed to validate your answer. Please try again.');
                setShowValidationError(true);
            }
        } catch (error) {
            console.error('Error validating answer:', error);
            setValidationError('An unexpected error occurred. Please try again.');
            setShowValidationError(true);
        } finally {
            setIsValidating(false);
        }
    };

    const generateInterviewQuestions = async (data: {
        duration: number,
        jobName: string,
        softSkillsPercentage: number,
        tags: string[]
    }) => {
        try {
            const interviewService = InterviewService.getInstance();
            const response = await interviewService.generateQuestions(data);

            if (response.success) {
                setQuestions(response.questions);

                // Store interviewId in sessionStorage if available
                if (response.interviewId) {
                    sessionStorage.setItem('interviewId', response.interviewId);
                }
            } else {
                setErrorMessage(response.message || 'Failed to generate interview questions.');
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Format remaining time to display minutes and seconds
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Handle closing the validation error snackbar
    const handleCloseValidationError = () => {
        setShowValidationError(false);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4, position: 'relative' }}>
            {/* Validation Error Snackbar */}
            <Snackbar
                open={showValidationError}
                autoHideDuration={6000}
                onClose={handleCloseValidationError}
                message={validationError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            {/* Timer in the upper right corner */}
            {!isLoading && !errorMessage && interviewStarted && !interviewCompleted && (
                <Paper
                    elevation={3}
                    sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {formatTime(remainingTime)}
                    </Typography>
                </Paper>
            )}

            {!interviewCompleted && (
                <>
                    <Typography variant="h4" component="h1" gutterBottom align="center" color="text.primary">
                        Interview Questions
                    </Typography>

                    {interviewData.jobName && (
                        <Typography variant="h6" gutterBottom align="center" color="text.secondary" sx={{ mb: 3 }}>
                            Job: {interviewData.jobName}
                        </Typography>
                    )}
                </>
            )}

            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
                    <Typography variant="body1" align="center" color="white" sx={{ mt: 2 }}>
                        We are loading the interview questions
                    </Typography>
                </Box>
            ) : errorMessage ? (
                <Alert severity="error" sx={{ my: 2 }}>
                    {errorMessage}
                </Alert>
            ) : (
                <>
                    {!interviewCompleted && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" gutterBottom>
                                Duration: {interviewData.duration} minutes
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                Soft Skills: {interviewData.softSkillsPercentage}%
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {interviewData.tags.map((tag, index) => (
                                    <Chip key={index} label={tag} variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {!interviewStarted ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Box 
                                component="button"
                                onClick={startInterview}
                                sx={{
                                    backgroundColor: 'primary.main',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '16px 32px',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: 3,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                        transform: 'scale(1.05)',
                                    },
                                    '&:active': {
                                        transform: 'scale(0.98)',
                                    },
                                }}
                            >
                                Start
                            </Box>
                        </Box>
                    ) : interviewCompleted ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, my: 4 }}>
                            <Typography variant="h4" align="center" color="primary" sx={{ fontWeight: 'bold' }}>
                                Congratulations. You have finished the interview! 🎉
                            </Typography>

                            <Typography variant="h1" sx={{ fontSize: '5rem' }}>
                                🎊
                            </Typography>

                            {finalizeError && (
                                <Alert severity="error" sx={{ width: '100%', my: 2 }}>
                                    {finalizeError}
                                </Alert>
                            )}

                            {isFinalizing ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={40} />
                                    <Typography>Finalizing your interview...</Typography>
                                </Box>
                            ) : isFinalized ? (
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    size="large"
                                    sx={{ 
                                        mt: 2, 
                                        px: 4, 
                                        py: 1.5, 
                                        fontSize: '1.2rem',
                                        borderRadius: '8px'
                                    }}
                                    onClick={() => {
                                        // Navigate to results page
                                        window.location.href = '/results';
                                    }}
                                >
                                    Go to results
                                </Button>
                            ) : null}
                        </Box>
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Question {currentQuestionIndex + 1} of {questions.length}
                                </Typography>

                                {questions.length > 0 ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Typography variant="body1" gutterBottom>
                                                {questions[currentQuestionIndex].question}
                                            </Typography>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                Tags:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {questions[currentQuestionIndex].tags.map((tag, index) => (
                                                    <Chip key={index} label={tag} variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>

                                        <TextField
                                            label="Your Answer"
                                            multiline
                                            rows={4}
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Type your answer here..."
                                        />

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={currentQuestionIndex >= questions.length - 1 ? handleFinishInterview : handleNextQuestion}
                                                disabled={isValidating}
                                            >
                                                {isValidating ? (
                                                    <>
                                                        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                                                        Validating...
                                                    </>
                                                ) : (
                                                    currentQuestionIndex >= questions.length - 1 ? 'Finish' : 'Submit'
                                                )}
                                            </Button>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography>No questions generated. Please try again.</Typography>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </Container>
    );
};

export default InterviewPage;
