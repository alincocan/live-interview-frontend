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
} from '@mui/material';
import {
    InterviewService,
    GenerateQuestionsRequest
} from '../service/InterviewService.ts';

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
        languageCode: ''
    });

    // No need for state variables as we're using response values directly

    useEffect(() => {
        // Fetch data from location state
        const { duration, jobName, softSkillsPercentage, difficulty, tags, languageCode } = location.state || {};

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
            languageCode
        };

        setInterviewData(parsedData);
    }, [location.state]);

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
                language: languageCode,
                interviewerId: selectedInterviewer.id,
                voiceId: selectedInterviewer.voiceId
            };

            // Execute all 4 API calls in parallel
            const [
                questionsResponse,
                welcomeAudioResponse,
                sectionChangerResponse,
                transitionResponse
            ] = await Promise.all([
                interviewService.generateQuestions(requestData),
                interviewService.getAudio(languageCode, voiceId),
                interviewService.getSectionChangerPhrases(languageCode, voiceId),
                interviewService.getTransitionPhrases(languageCode, voiceId)
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

            // Process welcome audio response
            if (!welcomeAudioResponse.success || !welcomeAudioResponse.audio) {
                console.error('Failed to fetch welcome audio:', welcomeAudioResponse.message);
                setHasPartialFailure(true);
            }

            // Process section changer phrases response
            if (!sectionChangerResponse.success || !sectionChangerResponse.transitionPhrases) {
                console.error('Failed to fetch section changer phrases:', sectionChangerResponse.message);
                setHasPartialFailure(true);
            }

            // Process transition phrases response
            if (!transitionResponse.success || !transitionResponse.transitionPhrases) {
                console.error('Failed to fetch transition phrases:', transitionResponse.message);
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
                        welcomeAudio: welcomeAudioResponse,
                        sectionChangerPhrases: sectionChangerResponse.transitionPhrases,
                        transitionPhrases: transitionResponse.transitionPhrases
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
            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
                        We are preparing your interview
                    </Typography>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
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
