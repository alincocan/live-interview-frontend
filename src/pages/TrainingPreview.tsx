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
    TrainingService,
    GenerateTrainingRequest
} from '../service/TrainingService';

const TrainingPreview: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [modelUrl, setModelUrl] = useState("");
    const [trainingData, setTrainingData] = useState({
        numQuestions: 0,
        jobName: '',
        softSkillsPercentage: 0,
        difficulty: '',
        tags: [] as string[],
        languageCode: '',
        jobDescription: ''
    });

    useEffect(() => {
        // Fetch data from location state
        const { numQuestions, jobName, softSkillsPercentage, difficulty, tags, languageCode, jobDescription, modelUrl } = location.state || {};

        if (!numQuestions || !jobName || !tags || !difficulty || !modelUrl) {
            setErrorMessage("We couldn't load the training. Please try again!");
            return;
        }

        setModelUrl(modelUrl);
        // Parse the data
        const parsedData = {
            numQuestions: parseInt(numQuestions, 10),
            jobName,
            softSkillsPercentage: parseInt(softSkillsPercentage || '0', 10),
            difficulty,
            tags,
            languageCode,
            jobDescription
        };

        setTrainingData(parsedData);
    }, [location.state]);

    const startTraining = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            // Get languageCode from trainingData
            const languageCode = trainingData.languageCode;

            // Get selectedInterviewer from location state if available, otherwise try sessionStorage
            const selectedInterviewerFromState = location.state?.selectedInterviewer;
            const selectedInterviewerStr = selectedInterviewerFromState ? 
                JSON.stringify(selectedInterviewerFromState) : 
                sessionStorage.getItem('selectedInterviewer');

            if (!languageCode) {
                throw new Error("We couldn't load the training. Please try again!");
            }

            // Parse the selectedInterviewer object if available
            let interviewerId = undefined;
            let voiceId = undefined;

            if (selectedInterviewerStr) {
                const selectedInterviewer = JSON.parse(selectedInterviewerStr);
                interviewerId = selectedInterviewer.id;
                voiceId = selectedInterviewer.voiceId;
            }

            if (!voiceId) {
                throw new Error("We couldn't load the training. Please try again!");
            }

            // Create request for generating training questions
            const requestData: GenerateTrainingRequest = { 
                duration: trainingData.numQuestions, // Set duration as number of questions
                difficulty: trainingData.difficulty, // Explicitly include difficulty
                jobName: trainingData.jobName,
                softSkillsPercentage: trainingData.softSkillsPercentage,
                tags: trainingData.tags,
                language: languageCode,
                interviewerId,
                voiceId,
                jobDescription: trainingData.jobDescription
            };

            // Call the training service to generate questions and get audio phrases in parallel
            const trainingService = TrainingService.getInstance();

            const [
                questionsResponse,
                audioPhrasesResponse
            ] = await Promise.all([
                trainingService.generateTraining(requestData),
                trainingService.getAudioPhrases(languageCode, voiceId)
            ]);

            // Process questions response
            if (questionsResponse.success) {
                // Store sessionId in sessionStorage if available
                if (questionsResponse.sessionId) {
                    sessionStorage.setItem('sessionId', questionsResponse.sessionId);
                }
            } else {
                throw new Error(questionsResponse.message || "We couldn't load the training. Please try again!");
            }

            // Process audio phrases response
            const hasAudioFailure = !audioPhrasesResponse.success;
            if (hasAudioFailure) {
                console.error('Failed to fetch audio phrases:', audioPhrasesResponse.message);
                setErrorMessage("We couldn't load the training. Please try again!");
            } else {
                // Navigate to the training session page with all the necessary data
                navigate('/training/session', {
                    state: {
                        ...location.state,
                        questions: questionsResponse.questions,
                        welcomeAudio: audioPhrasesResponse.introPhrase,
                        sectionChangerPhrases: audioPhrasesResponse.sectionChangerPhrases,
                        transitionPhrases: audioPhrasesResponse.transitionPhrases,
                        outroPhrase: audioPhrasesResponse.outroPhrase,
                        repeatQuestionPhrases: audioPhrasesResponse.repeatQuestionPhrases,
                        modelUrl
                    }
                });
            }

        } catch (error) {
            console.error('Error starting training:', error);
            setErrorMessage("We couldn't load the training. Please try again!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
                        We are preparing your training
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
                            onClick={startTraining} 
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
                                <Box component="span" sx={{ fontWeight: 'bold' }}>Job name:</Box> {trainingData.jobName}
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 4 }}>
                                <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Number of Questions:</Box> {trainingData.numQuestions}
                                </Typography>

                                <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center' }}>
                                    <Box component="span" sx={{ fontWeight: 'bold' }}>Difficulty:</Box> {trainingData.difficulty}
                                </Typography>

                                {trainingData.languageCode && (
                                    <Typography variant="body1" gutterBottom color="text.primary" sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>Language:</Box>
                                        {trainingData.languageCode === 'en-US' ? '🇺🇸' :
                                          trainingData.languageCode === 'en-GB' ? '🇬🇧' :
                                          trainingData.languageCode === 'fr-FR' ? '🇫🇷' :
                                          trainingData.languageCode === 'de-DE' ? '🇩🇪' :
                                          trainingData.languageCode === 'es-ES' ? '🇪🇸' :
                                          trainingData.languageCode === 'it-IT' ? '🇮🇹' :
                                          trainingData.languageCode === 'ja-JP' ? '🇯🇵' :
                                          trainingData.languageCode === 'ko-KR' ? '🇰🇷' :
                                          trainingData.languageCode === 'pt-BR' ? '🇧🇷' :
                                          trainingData.languageCode === 'zh-CN' ? '🇨🇳' :
                                          trainingData.languageCode} {trainingData.languageCode}
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 3, justifyContent: 'center' }}>
                                {trainingData.tags && trainingData.tags.length > 0 && (
                                    <>
                                        <Typography variant="body1" color="text.primary" sx={{ mr: 1 }}>
                                            <Box component="span" sx={{ fontWeight: 'bold' }}>Topic:</Box>
                                        </Typography>
                                        {trainingData.tags.map((tag, index) => (
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
                                    onClick={startTraining}
                                    disabled={isLoading}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        fontSize: '1rem',
                                        borderRadius: '6px'
                                    }}
                                >
                                    Start Training
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}
        </Container>
    );
};

export default TrainingPreview;
