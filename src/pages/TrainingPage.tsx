import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Typography,
    Box,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    IconButton, 
    Card,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import ModelViewer from '../components/ModelViewer';
import { 
    InterviewQuestion,
    AudioResponse
} from '../service/InterviewService';
import {
    TrainingService,
    ValidateAnswerRequest,
    FinalizeTrainingRequest
} from '../service/trainingService.ts';

const TrainingPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);


    const [sessionId, setSessionId] = useState<string | null>(null);
    const [jobName, setJobName] = useState<string | undefined>(undefined);
    const [language, setLanguage] = useState<string | undefined>(undefined);

    const [isValidating, setIsValidating] = useState(false);
    const [index, setIndex] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    const [audioList, setAudioList] = useState<Map<string, string>[]>([]);
    const [shouldStartRecording, setShouldStartRecording] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showFirstAudio, setShowFirstAudio] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Function to start recording
    const startRecording = async () => {
        audioChunksRef.current = [];
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                convertBlobToBase64(audioBlob);

                // Stop all tracks of the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);

            // Continue with the next audio even if recording fails
            if (index < audioList.length) {
                setIndex(index + 1);
            }
        }
    };

    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // Function to convert blob to base64
    const convertBlobToBase64 = (blob: Blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                // Extract the base64 data (remove the data URL prefix)
                const base64data = reader.result.toString().split(',')[1];
                // Call validateAnswer with the base64 audio data
                validateAnswer(base64data);
            }
        };
        reader.readAsDataURL(blob);
    };

    // Function to handle repeat question scenario
    const handleRepeatQuestion = (currentQuestion: InterviewQuestion) => {
        // Get the current question from location state
        const { questions, repeatQuestionPhrases } = location.state || {};
        if (questions && repeatQuestionPhrases && repeatQuestionPhrases.length > 0) {
            // Select a random phrase from repeatQuestionPhrases
            const randomPhrase: AudioResponse =
                repeatQuestionPhrases[Math.floor(Math.random() * repeatQuestionPhrases.length)];

            // Create a new audioList with the repeat phrase and the question
            const newAudioList = [...audioList];

            // Insert the repeat phrase and the question at the current index
            newAudioList.splice(index + 1, 0,
                new Map([[randomPhrase.text, randomPhrase.audio], [currentQuestion.question, currentQuestion.audio]]),
            );

            // Update the audioList and set the index to the first new entry
            setAudioList(newAudioList);
            setIndex(index + 1);
        }
    };

    // Function to validate the answer
    const validateAnswer = async (userAnswer: string) => {
        const { questions } = location.state || {};
        const currentQuestion = questions[questionIndex];

        if (!userAnswer) {
            handleRepeatQuestion(currentQuestion);
            return;
        }

        setIsValidating(true);

        try {
            const trainingService = TrainingService.getInstance();

            // Get the current question from the location state
            if (!questions || questions.length === 0) {
                console.error('No questions found');
                return;
            }

            const request: ValidateAnswerRequest = {
                question: currentQuestion.question,
                answer: userAnswer,
                language: language,
                sessionId: sessionId || undefined,
                jobName: jobName || undefined,
                tag: currentQuestion.tag,
                softSkill: currentQuestion.softSkill
            };

            const response = await trainingService.validateAnswer(request);

            if (response.success && response.answerType === 'SUCCESS') {
                // Continue with the next audio after recording is finished
                if (index < audioList.length) {
                    setIndex(index + 1);
                    setQuestionIndex(questionIndex + 1);
                }
            } else {
                handleRepeatQuestion(currentQuestion);
            }
        } catch (error) {
            console.error('Error validating answer:', error);
            handleRepeatQuestion(currentQuestion);
        } finally {
            setIsValidating(false);
        }
    };

    // Function to finalize the training
    const finalizeTraining = async () => {
        if (!sessionId) {
            setErrorMessage('No session ID found. Cannot finalize training.');
            return;
        }

        setIsValidating(true); // Use validating state to show loading

        try {
            const trainingService = TrainingService.getInstance();
            const request: FinalizeTrainingRequest = {
                sessionId: sessionId
            };

            const response = await trainingService.finalizeTraining(request);

            if (response.success) {
                // Redirect to dashboard
                navigate('/training/finish');
            } else {
                setErrorMessage(`Failed to finalize training: ${response.message}`);
                // Still show completion message
            }
        } catch (error) {
            setErrorMessage('Failed to finalize training. Please try again.' + error);
            // Still show completion message
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        // Initialize training data from location state
        const { questions, sectionChangerPhrases, transitionPhrases, jobName, languageCode, welcomeAudio, outroPhrase, repeatQuestionPhrases, duration } = location.state || {};

        if (!questions || !sectionChangerPhrases || !transitionPhrases || !welcomeAudio || !outroPhrase || !repeatQuestionPhrases) {
            setErrorMessage('Missing training data. Please set up the training first.');
        } else {
            setSessionId(sessionStorage.getItem("sessionId"));
            setJobName(jobName);
            setLanguage(languageCode);
            setDuration(duration);

            const result: Map<string, string>[] = [];

            // Start with welcome
            result.push(new Map([[welcomeAudio.text, welcomeAudio.audio]]));
            result.push(new Map([[questions[0].question, questions[0].audio]]));

            let previousTag: string | null = null;

            questions.forEach((question: { tag: string; question: string; audio: string; }, index: number) => {
                if(index > 0) {
                    const currentTag = question.tag;
                    const isTagChange = previousTag !== null && currentTag !== previousTag;

                    // Choose appropriate phrase
                    const phrasesToChooseFrom = isTagChange ? sectionChangerPhrases : transitionPhrases;
                    const randomPhrase = phrasesToChooseFrom[Math.floor(Math.random() * phrasesToChooseFrom.length)];

                    // Build current Map
                    const map = new Map<string, string>();
                    map.set(randomPhrase.text, randomPhrase.audio);
                    map.set(question.question, question.audio);

                    result.push(map);
                    previousTag = currentTag;
                }
            });

            result.push(new Map([[outroPhrase.text, outroPhrase.audio]]));

            setAudioList(result);
            setIndex(0);
        }
    }, [location.state]);

    // Initialize timer when duration changes
    useEffect(() => {
        if (duration > 0) {
            // Convert duration from minutes to seconds
            setRemainingTime(duration * 60);
        }
    }, [duration]);

    // Add a 3-second delay before showing the first audio
    useEffect(() => {
        if (audioList.length > 0 && index === 0) {
            // Initially set showFirstAudio to false
            setShowFirstAudio(false);

            // Set a timeout to show the first audio after 3 seconds
            const timer = setTimeout(() => {
                setShowFirstAudio(true);
            }, 3000);

            // Clean up the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [audioList, index]);


    // Timer countdown effect
    useEffect(() => {
        if (remainingTime <= 0) return;

        const timerInterval = setInterval(() => {
            setRemainingTime(prevTime => {
                if (prevTime <= 0) {
                    clearInterval(timerInterval);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timerInterval);
    }, [remainingTime]);



    return (
        <div>

            {errorMessage ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Alert severity="error" sx={{ my: 2, width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', width: '100%' }}>
                    <Card sx={{ width: '100%', mb: 4, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent sx={{ backgroundColor: 'transparent' }}>
                                {/* 3D Model Viewer as background */}
                                <Box sx={{
                                    height: '100vh',
                                    width: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    zIndex: 0
                                }}>
                                    <ModelViewer
                                        url={location.state?.modelUrl}
                                        audioMap={showFirstAudio ? audioList[index] : new Map()}
                                        onAudioFinished={() => {
                                            if(index === 1) {
                                                setShouldStartRecording(true);
                                                startRecording();
                                                return;
                                            }
                                            if(index === audioList.length-1) {
                                                finalizeTraining();
                                                return;
                                            }
                                            if (shouldStartRecording) {
                                                // Start recording when shouldStartRecording is true
                                                startRecording();
                                            } else if (index < audioList.length) {
                                                // Only increment index if not recording
                                                setIndex(index + 1);
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    <Paper
                        elevation={3} 
                        sx={{ 
                            width: '80px', 
                            ml: 2, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '700px',
                            position: 'relative',
                            zIndex: 1,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* Question counter display */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 20, 
                            left: 0, 
                            right: 0, 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center' 
                        }}>
                            <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                Question
                            </Typography>
                            <Typography variant="body1" sx={{ textAlign: 'center', fontWeight: 'bold', color: 'primary.main' }}>
                                {questionIndex + 1}/{location.state?.questions?.length || 0}
                            </Typography>
                        </Box>
                        {isValidating ? (
                            <>
                                <Typography variant="subtitle2" sx={{ mb: 2, textAlign: 'center' }}>
                                    Validating...
                                </Typography>

                                <Box sx={{ 
                                    position: 'absolute', 
                                    bottom: 20, 
                                    left: 0, 
                                    right: 0, 
                                    display: 'flex', 
                                    justifyContent: 'center' 
                                }}>
                                    <CircularProgress size={24} color="primary" />
                                </Box>
                            </>
                        ) : (
                            <>
                                {/* Recording suggestion emoticon */}
                                {shouldStartRecording && !isRecording && (
                                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <MicIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                        <Typography variant="caption" sx={{ textAlign: 'center' }}>
                                            Ready to record
                                        </Typography>
                                    </Box>
                                )}

                                {/* Stop recording button */}
                                {isRecording && (
                                    <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <IconButton 
                                            color="error" 
                                            onClick={stopRecording}
                                            sx={{ mb: 1 }}
                                        >
                                            <StopIcon />
                                        </IconButton>
                                        <Typography variant="caption" sx={{ textAlign: 'center' }}>
                                            Stop recording
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Paper>
                </Box>
            )}
        </div>
    );
};

export default TrainingPage;
