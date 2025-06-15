import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Button,
    Divider,
    Slide,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import InfoIcon from '@mui/icons-material/Info';
import MicIcon from '@mui/icons-material/Mic';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import KeyboardEscapeIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import {
    InterviewService,
    GenerateQuestionsRequest
} from '../service/InterviewService.ts';

// Interview tips and tricks
const interviewTips = [
    "Maintain good eye contact with the camera to create a connection with the interviewer.",
    "Speak clearly and at a moderate pace to ensure your responses are understood.",
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions.",
    "Prepare concise examples that highlight your skills and achievements.",
    "Listen carefully to each question before responding to ensure you address what's being asked.",
    "It's okay to take a moment to think before answering difficult questions.",
    "Show enthusiasm for the role and company throughout the interview.",
    "End with thoughtful questions that demonstrate your interest in the position."
];

const InterviewPreview: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasPartialFailure, setHasPartialFailure] = useState(false);
    const [interviewData, setInterviewData] = useState({
        duration: 0,
        jobName: '',
        softSkillsPercentage: 0,
        difficulty: '',
        tags: [] as string[],
        languageCode: '',
        jobDescription: ''
    });

    // State for tips rotation
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");

    // Tutorial popup state
    const [showTutorial, setShowTutorial] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    // No need for state variables as we're using response values directly

    // Effect for rotating tips every 5 seconds
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                // Set slide direction to right (exit to right, enter from left)
                setSlideDirection("right");

                // After the exit animation completes, change the tip and reverse the direction
                setTimeout(() => {
                    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % interviewTips.length);
                    setSlideDirection("left");
                }, 500); // Half a second for the exit animation
            }, 5000); // Change tip every 5 seconds

            return () => clearInterval(interval);
        }
    }, [isLoading]);

    // Check localStorage and show tutorial if needed
    useEffect(() => {
        const hasSeenTutorial = localStorage.getItem('interviewTutorialSeen') === 'true';
        if (!hasSeenTutorial) {
            setShowTutorial(true);
        }
    }, []);

    useEffect(() => {
        // Fetch data from location state
        const { duration, jobName, softSkillsPercentage, difficulty, tags, languageCode, jobDescription } = location.state || {};

        if (!duration || !jobName || !softSkillsPercentage || !tags || !difficulty) {
            setErrorMessage("We couldn't load the interview. Please try again!");
            return;
        }

        // Parse the data
        const parsedData = {
            duration: parseInt(duration, 10),
            jobName,
            softSkillsPercentage: parseInt(softSkillsPercentage, 10),
            difficulty,
            tags,
            languageCode,
            jobDescription
        };

        setInterviewData(parsedData);
    }, [location.state]);

    // Handle closing the tutorial
    const handleCloseTutorial = () => {
        if (dontShowAgain) {
            localStorage.setItem('interviewTutorialSeen', 'true');
        }
        setShowTutorial(false);
    };

    // Handle checkbox change
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDontShowAgain(event.target.checked);
    };

    const startInterview = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        setHasPartialFailure(false);

        try {
            // Get languageCode from interviewData
            const languageCode = interviewData.languageCode;

            // Get selectedInterviewer from location state if available, otherwise try sessionStorage
            const selectedInterviewerFromState = location.state?.selectedInterviewer;
            const selectedInterviewerStr = selectedInterviewerFromState ? 
                JSON.stringify(selectedInterviewerFromState) : 
                sessionStorage.getItem('selectedInterviewer');

            if (!languageCode || !selectedInterviewerStr) {
                throw new Error("We couldn't load the interview. Please try again!");
            }

            // Parse the selectedInterviewer object
            const selectedInterviewer = JSON.parse(selectedInterviewerStr);
            const voiceId = selectedInterviewer.voiceId;

            if (!voiceId) {
                throw new Error("We couldn't load the interview. Please try again!");
            }

            // Make the 4 API calls in parallel
            const interviewService = InterviewService.getInstance();

            // 1. Create request for generating questions
            const requestData: GenerateQuestionsRequest = { 
                ...interviewData,
                difficulty: interviewData.difficulty, // Explicitly include difficulty
                duration: interviewData.duration, // Use duration as number of questions
                language: languageCode,
                interviewerId: selectedInterviewer.id,
                voiceId: selectedInterviewer.voiceId,
                jobDescription: interviewData.jobDescription
            };

            // Execute 2 API calls in parallel
            const [
                questionsResponse,
                audioPhrasesResponse
            ] = await Promise.all([
                interviewService.generateQuestions(requestData),
                interviewService.getAudioPhrases(languageCode, voiceId)
            ]);

            // Process questions response
            if (questionsResponse.success) {
                // Store sessionId in sessionStorage if available
                if (questionsResponse.sessionId) {
                    sessionStorage.setItem('sessionId', questionsResponse.sessionId);
                }
            } else {
                throw new Error("We couldn't load the interview. Please try again!");
            }

            // Process audio phrases response
            if (!audioPhrasesResponse.success) {
                console.error('Failed to fetch audio phrases:', audioPhrasesResponse.message);
                setHasPartialFailure(true);
            }

            // If there's a partial failure, don't navigate, just show the Try Again button
            if (hasPartialFailure) {
                setErrorMessage("We couldn't load the interview. Please try again!");
            } else {
                // Navigate to the interview session page with all the necessary data
                // Use the response values directly instead of state values
                navigate('/interview/session', {
                    state: {
                        ...location.state,
                        questions: questionsResponse.questions,
                        welcomeAudio: audioPhrasesResponse.introPhrase,
                        sectionChangerPhrases: audioPhrasesResponse.sectionChangerPhrases,
                        transitionPhrases: audioPhrasesResponse.transitionPhrases,
                        outroPhrase: audioPhrasesResponse.outroPhrase,
                        repeatQuestionPhrases: audioPhrasesResponse.repeatQuestionPhrases,
                    }
                });
            }

        } catch (error) {
            console.error('Error starting interview:', error);
            setErrorMessage("We couldn't load the interview. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Tutorial Dialog */}
            <Dialog
                open={showTutorial}
                onClose={handleCloseTutorial}
                aria-labelledby="tutorial-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="tutorial-dialog-title" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <Box display="flex" alignItems="center">
                        <InfoIcon sx={{ mr: 1 }} />
                        Interview Tutorial
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="h6" gutterBottom>
                        Welcome to your interview session!
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Here's how to get the most out of your interview experience:
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <MicIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="When you see the microphone icon, it's your turn to speak" 
                                secondary="Speak clearly and at a comfortable pace"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <KeyboardReturnIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="After providing your answer, press Enter" 
                                secondary="This submits your response and moves to the next question"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <KeyboardEscapeIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Press Esc at any time to stop the interview" 
                                secondary="You can resume later or end the session completely"
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <StopIcon color="error" />
                            </ListItemIcon>
                            <ListItemText 
                                primary="Click the stop button when you've finished your answer" 
                                secondary="This will submit your response and move to the next question"
                            />
                        </ListItem>
                    </List>
                    <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold' }}>
                        Tips:
                    </Typography>
                    <Typography variant="body2" paragraph>
                        - Speak clearly and at a moderate pace
                        <br />
                        - Keep your answers concise but thorough
                        <br />
                        - Use specific examples from your experience
                        <br />
                        - Take a moment to think before answering difficult questions
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox 
                                checked={dontShowAgain} 
                                onChange={handleCheckboxChange} 
                                color="primary"
                            />
                        }
                        label="Don't show again"
                    />
                    <Button 
                        onClick={handleCloseTutorial} 
                        variant="contained" 
                        color="primary"
                        size="large"
                    >
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>

            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
                        We are preparing your interview
                    </Typography>
                    <CircularProgress size={60} sx={{ mb: 4 }} />

                    {/* Tips and Tricks Card */}
                    <Card sx={{ width: '100%', mt: 3, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <TipsAndUpdatesIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6" color="primary">
                                    Interview Tips & Tricks
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: '120px', px: 2 }}>
                                <Slide direction={slideDirection} in={true} mountOnEnter unmountOnExit>
                                    <Typography variant="body1" sx={{ py: 2 }}>
                                        {interviewTips[currentTipIndex]}
                                    </Typography>
                                </Slide>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            ) : errorMessage ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Alert severity="error" sx={{ my: 2, width: '100%' }}>
                        {errorMessage}
                    </Alert>
                    <Box sx={{ display: 'flex', mt: 2 }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={startInterview} 
                        >
                            Try Again
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                    <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3, width: '100%', minWidth: { xs: '380px', sm: '600px', md: '800px' }, maxWidth: { xs: '95%', sm: '90%', md: '1000px' } }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" component="h2" gutterBottom color="text.primary" sx={{ fontWeight: 'medium', mb: 2, textAlign: 'center' }}>
                                <Box component="span" sx={{ fontWeight: 'bold' }}>Job name:</Box> {interviewData.jobName}
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                                <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Duration:</Box> {interviewData.duration} minutes
                                </Typography>

                                <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Soft Skills:</Box> {interviewData.softSkillsPercentage}%
                                </Typography>

                                <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Difficulty:</Box> {interviewData.difficulty}
                                </Typography>

                                {interviewData.languageCode && (
                                    <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Language:</Box>
                                        {interviewData.languageCode === 'en-US' ? '🇺🇸' :
                                          interviewData.languageCode === 'en-GB' ? '🇬🇧' :
                                          interviewData.languageCode === 'fr-FR' ? '🇫🇷' :
                                          interviewData.languageCode === 'de-DE' ? '🇩🇪' :
                                          interviewData.languageCode === 'es-ES' ? '🇪🇸' :
                                          interviewData.languageCode === 'it-IT' ? '🇮🇹' :
                                          interviewData.languageCode === 'ja-JP' ? '🇯🇵' :
                                          interviewData.languageCode === 'ko-KR' ? '🇰🇷' :
                                          interviewData.languageCode === 'pt-BR' ? '🇧🇷' :
                                          interviewData.languageCode === 'zh-CN' ? '🇨🇳' :
                                          interviewData.languageCode} {interviewData.languageCode}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, justifyContent: 'center' }}>
                                {interviewData.tags && interviewData.tags.length > 0 && (
                                    <>
                                        <Typography variant="body1" color="text.primary" sx={{ mr: 1 }}>
                                            <Box component="span" sx={{ fontWeight: 'bold' }}>Topics:</Box>
                                        </Typography>
                                        {interviewData.tags.map((tag, index) => (
                                            <Chip key={`tag-${index}`} label={tag} variant="outlined" />
                                        ))}
                                    </>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="medium"
                                    onClick={startInterview}
                                    disabled={isLoading}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        fontSize: '1rem',
                                        borderRadius: '6px'
                                    }}
                                >
                                    Start Interview
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Container>
    );
};

export default InterviewPreview;
