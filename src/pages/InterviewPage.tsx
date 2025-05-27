import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ModelViewer from '../components/ModelViewer';
import { 
    InterviewService, 
    FinalizeInterviewRequest,
    ValidateAnswerRequest
} from '../service/InterviewService';

const InterviewPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [sessionId, setSessionId] = useState<string | null>(null);
    const [jobName, setJobName] = useState<string | undefined>(undefined);
    const [language, setLanguage] = useState<string | undefined>(undefined);

    const [isValidating, setIsValidating] = useState(false);
    const [index, setIndex] = useState(0);
    const [duration, setDuration] = useState(0);
    const [remainingTime, setRemainingTime] = useState(0);

    const [audioList, setAudioList] = useState<Map<string, string>[]>([]);
    const [shouldStartRecording, setShouldStartRecording] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
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

    // Function to validate the answer
    const validateAnswer = async (userAnswer: string) => {
        if (!userAnswer) {
            return;
        }

        setIsValidating(true);

        try {
            const interviewService = InterviewService.getInstance();

            // Get the current question from the location state
            const { questions } = location.state || {};
            if (!questions || questions.length === 0) {
                console.error('No questions found');
                return;
            }

            // Calculate the current question index based on the index
            // Index 0 is welcome, index 1 is first question, so we need to subtract 1
            const questionIndex = Math.max(0, index - 1);
            if (questionIndex >= questions.length) {
                return;
            }

            const currentQuestion = questions[questionIndex];

            const request: ValidateAnswerRequest = {
                question: currentQuestion.question,
                answer: userAnswer,
                language: language,
                sessionId: sessionId || undefined,
                jobName: jobName || undefined,
                tag: currentQuestion.tag,
                softSkill: currentQuestion.softSkill
            };

            const response = await interviewService.validateAnswer(request);

            if (response.success) {
                // Continue with the next audio after recording is finished
                if (index < audioList.length) {
                    setIndex(index + 1);
                }
            } 
        } catch (error) {
            console.error('Error validating answer:', error);
        } finally {
            setIsValidating(false);
        }
    };

    // Function to finalize the interview
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const finalizeInterview = async () => {
        if (!sessionId) {
            setErrorMessage('No session ID found. Cannot finalize interview.');
            return;
        }

        setIsValidating(true); // Use validating state to show loading

        try {
            const interviewService = InterviewService.getInstance();
            const request: FinalizeInterviewRequest = {
                sessionId: sessionId
            };

            const response = await interviewService.finalizeInterview(request);

            if (response.success) {
                // Redirect to finish page
                navigate('/interview/finish');
            } else {
                setErrorMessage(`Failed to finalize interview: ${response.message}`);
                // Still show completion message
            }
        } catch (error) {
            setErrorMessage('Failed to finalize interview. Please try again.' + error);
            // Still show completion message
        } finally {
            setIsValidating(false);
        }
    };

    useEffect(() => {
        // Initialize interview data from location state
        const { questions, sectionChangerPhrases, transitionPhrases, jobName, languageCode, welcomeAudio, outroPhrase, repeatQuestionPhrases, duration } = location.state || {};

        if (!questions || !sectionChangerPhrases || !transitionPhrases || !welcomeAudio || !outroPhrase || !repeatQuestionPhrases) {
            setErrorMessage('Missing interview data. Please set up the interview first.');
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

    // Format time as MM:SS
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {errorMessage ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Alert severity="error" sx={{ my: 2, width: '100%' }}>
                        {errorMessage}
                    </Alert>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', width: '100%' }}>
                    {/* Main content */}
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Card sx={{ width: '100%', mb: 4, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent>
                                {/* 3D Model Viewer */}
                                <Box sx={{ height: '700px', width: '100%', mb: 4, position: 'relative' }}>
                                    <ModelViewer 
                                        url="/models/david/david.glb"
                                        audioMap={audioList[index]}
                                        onAudioFinished={() => {
                                            if(index === 1) {
                                                setShouldStartRecording(true);
                                                startRecording();
                                                return;
                                            }
                                            if(index === audioList.length-1) {
                                                finalizeInterview();
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
                    </Box>

                    {/* Right side panel - always visible */}
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
                            position: 'relative'
                        }}
                    >
                        {/* Timer display */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 20, 
                            left: 0, 
                            right: 0, 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center' 
                        }}>
                            <AccessTimeIcon color="primary" sx={{ fontSize: 24, mb: 1 }} />
                            <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {formatTime(remainingTime)}
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
        </Container>
    );
};

export default InterviewPage;
