import React, { useState, useEffect, useRef } from 'react';
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
    Button,
    Snackbar,
    IconButton,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import {
    InterviewService, 
    InterviewQuestion, 
    ValidateAnswerRequest,
    FinalizeInterviewRequest,
    GetAudioResponse,
    TransitionPhrase
} from '../../service/InterviewService';


const InterviewPage: React.FC = () => {
    // Define keyframes for the pulse animation
    const pulseKeyframes = `
        @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 1; }
            100% { opacity: 0.6; }
        }
    `;
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

    // State to track if we're loading both welcome audio and interview questions
    const [isGeneratingInterview, setIsGeneratingInterview] = useState(false);

    // State for transition phrases
    const [sectionChangerPhrases, setSectionChangerPhrases] = useState<TransitionPhrase[]>([]);
    const [transitionPhrases, setTransitionPhrases] = useState<TransitionPhrase[]>([]);

    // Audio refs
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const questionAudioRef = useRef<HTMLAudioElement | null>(null);
    const transitionAudioRef = useRef<HTMLAudioElement | null>(null);
    const audioUrlRef = useRef<string | null>(null);

    // Ref to track if welcome audio has been fetched
    const welcomeAudioFetchedRef = useRef<boolean>(false);

    // Ref to track if transition phrases have been fetched
    const transitionPhrasesFetchedRef = useRef<boolean>(false);

    // Recording refs and state
    const [isRecording, setIsRecording] = useState(false);
    const [audioBase64, setAudioBase64] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Function to start recording
    const startRecording = async () => {
        audioChunksRef.current = [];
        try {
            console.log('Starting recording...');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('Recording stopped, processing audio...');
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
                convertBlobToBase64(audioBlob);

                // Stop all tracks of the stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            console.log('Recording started');
        } catch (error) {
            console.error('Error starting recording:', error);
            setIsRecording(false);
        }
    };

    // Function to stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            console.log('Stopping recording...');
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
                setAudioBase64(base64data);
                setUserAnswer(base64data); // Set the user answer to the base64 audio data
                console.log('Audio converted to base64');
            }
        };
        reader.readAsDataURL(blob);
    };

    // Function to play transition audio
    const playTransitionAudio = (audioBase64: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            try {
                // Clean up previous audio URL if it exists
                if (audioUrlRef.current) {
                    URL.revokeObjectURL(audioUrlRef.current);
                    audioUrlRef.current = null;
                }

                // Decode base64 string to binary data
                const binaryString = atob(audioBase64);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create blob from binary data
                const blob = new Blob([bytes], { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(blob);
                audioUrlRef.current = audioUrl;

                // Use the audio element from the ref
                if (!transitionAudioRef.current) {
                    console.error('Transition audio element ref is not available');
                    reject(new Error('Transition audio element ref is not available'));
                    return;
                }
                const audioElement = transitionAudioRef.current;

                // Set audio element attributes
                audioElement.preload = 'auto';
                audioElement.crossOrigin = 'anonymous';
                audioElement.volume = 1.0;
                audioElement.muted = false;
                audioElement.src = audioUrl;

                // Add event listener for when audio ends
                audioElement.onended = () => {
                    console.log('Transition audio playback ended');
                    resolve();
                };

                // Play the audio
                audioElement.load();
                audioElement.play()
                    .then(() => console.log('Transition audio playing successfully'))
                    .catch(error => {
                        console.error('Error playing transition audio:', error);
                        if (error.name === 'NotAllowedError') {
                            console.log('Autoplay prevented by browser. User interaction required.');
                        }
                        reject(error);
                    });
            } catch (error) {
                console.error('Error processing transition audio:', error);
                reject(error);
            }
        });
    };

    // Function to decode base64 audio and play it
    const playQuestionAudio = async () => {
        // Check if currentQuestionIndex is valid
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
            console.log('Invalid question index:', currentQuestionIndex);
            return;
        }

        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !currentQuestion.audio) {
            console.log('No audio available for this question');
            return;
        }

        try {
            console.log('Playing audio for question:', currentQuestionIndex + 1);

            // For questions after the first one, play transition audio first
            if (currentQuestionIndex > 0) {
                // Check if the current question has a different tag from the previous question
                const previousQuestion = questions[currentQuestionIndex - 1];
                const currentTags = currentQuestion.tags || [];
                const previousTags = previousQuestion.tags || [];

                // Check if there's any overlap in tags
                const hasTagChanged = !currentTags.some(tag => previousTags.includes(tag));

                // Select the appropriate transition phrase
                let transitionAudio: string | undefined;

                if (hasTagChanged && sectionChangerPhrases.length > 0) {
                    // Topic has changed, use section changer phrase
                    const randomIndex = Math.floor(Math.random() * sectionChangerPhrases.length);
                    transitionAudio = sectionChangerPhrases[randomIndex].audio;
                    console.log('Topic has changed, playing section changer phrase');
                } else if (transitionPhrases.length > 0) {
                    // Topic hasn't changed, use transition phrase
                    const randomIndex = Math.floor(Math.random() * transitionPhrases.length);
                    transitionAudio = transitionPhrases[randomIndex].audio;
                    console.log('Topic has not changed, playing transition phrase');
                }

                // Play transition audio if available
                if (transitionAudio) {
                    try {
                        await playTransitionAudio(transitionAudio);
                    } catch (error) {
                        console.error('Error playing transition audio:', error);
                        // Continue with question audio even if transition audio fails
                    }
                }
            }

            // Clean up previous audio URL if it exists
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }

            // Decode base64 string to binary data
            const binaryString = atob(currentQuestion.audio);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create blob from binary data
            const blob = new Blob([bytes], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(blob);
            audioUrlRef.current = audioUrl;

            // Use the audio element from the ref
            if (!questionAudioRef.current) {
                console.error('Question audio element ref is not available');
                return;
            }
            const audioElement = questionAudioRef.current;

            // Set audio element attributes
            audioElement.preload = 'auto';
            audioElement.crossOrigin = 'anonymous';
            audioElement.volume = 1.0;
            audioElement.muted = false;
            audioElement.src = audioUrl;

            // Add event listener for when audio ends
            audioElement.onended = () => {
                console.log('Audio playback ended, starting recording');
                startRecording();
            };

            // Play the audio
            audioElement.load();
            audioElement.play()
                .then(() => console.log('Audio playing successfully'))
                .catch(error => {
                    console.error('Error playing audio:', error);
                    if (error.name === 'NotAllowedError') {
                        console.log('Autoplay prevented by browser. User interaction required.');
                    }
                });
        } catch (error) {
            console.error('Error processing audio:', error);
        }
    };

    // Play audio when a new question is displayed
    useEffect(() => {
        if (questions.length > 0 && currentQuestionIndex >= 0 && interviewStarted && !isLoading) {
            // Add a small delay to ensure the UI is updated before playing audio
            const timeoutId = setTimeout(() => {
                playQuestionAudio();
            }, 500);

            // Clean up timeout if component unmounts or dependencies change
            return () => clearTimeout(timeoutId);
        }
    }, [currentQuestionIndex, questions, interviewStarted, isLoading]);


    // Function to fetch welcome audio (without playing it)
    const fetchWelcomeAudio = async (isRetry = false) => {
        // If this is not a retry and we've already fetched the welcome audio, don't fetch it again
        if (!isRetry && welcomeAudioFetchedRef.current) {
            console.log('Welcome audio already fetched, skipping duplicate call');
            return null;
        }

        try {
            // Get languageCode and voiceId from session storage
            const languageCode = sessionStorage.getItem('languageCode');
            const selectedInterviewerStr = sessionStorage.getItem('selectedInterviewer');

            if (!languageCode || !selectedInterviewerStr) {
                console.error('Missing language code or interviewer data.');
                return null;
            }

            // Parse the selectedInterviewer object
            const selectedInterviewer = JSON.parse(selectedInterviewerStr);
            const voiceId = selectedInterviewer.voiceId;

            if (!voiceId) {
                console.error('Missing voice ID in interviewer data.');
                return null;
            }

            console.log('Fetching welcome audio...');
            // Call the API to get the welcome audio
            const interviewService = InterviewService.getInstance();
            const response: GetAudioResponse = await interviewService.getAudio(languageCode, voiceId);

            if (response.success && response.audio) {
                // Mark that we've fetched the welcome audio
                welcomeAudioFetchedRef.current = true;
                return response.audio;
            } else {
                console.error('Failed to fetch welcome audio:', response.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching welcome audio:', error);
            return null;
        }
    };

    // Function to play welcome audio
    const playWelcomeAudio = (audioBase64: string) => {
        try {
            // Clean up previous audio URL if it exists
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }

            // Decode base64 string to binary data
            const binaryString = atob(audioBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create blob from binary data
            const blob = new Blob([bytes], { type: 'audio/mp3' });
            const audioUrl = URL.createObjectURL(blob);
            audioUrlRef.current = audioUrl;

            // Use the audio element from the ref
            if (!audioRef.current) {
                console.error('Audio element ref is not available');
                return;
            }
            const audioElement = audioRef.current;

            // Set audio element attributes
            audioElement.preload = 'auto';
            audioElement.crossOrigin = 'anonymous';
            audioElement.volume = 1.0;
            audioElement.muted = false;
            audioElement.src = audioUrl;

            // Add event listener for when audio ends
            audioElement.onended = () => {
                console.log('Welcome audio playback ended, waiting 3 seconds before starting interview');
                // Wait 3 seconds before starting the interview
                setTimeout(() => {
                    startInterviewAfterIntro();
                }, 3000);
            };

            // Play the audio
            audioElement.load();
            audioElement.play()
                .then(() => console.log('Welcome audio playing successfully'))
                .catch(error => {
                    console.error('Error playing welcome audio:', error);
                    if (error.name === 'NotAllowedError') {
                        console.log('Autoplay prevented by browser. User interaction required.');
                    }
                });
        } catch (error) {
            console.error('Error processing welcome audio:', error);
        }
    };

    // Clean up audio resources when component unmounts
    useEffect(() => {
        return () => {
            if (audioUrlRef.current) {
                URL.revokeObjectURL(audioUrlRef.current);
                audioUrlRef.current = null;
            }

            // Stop recording if active
            if (mediaRecorderRef.current && isRecording) {
                mediaRecorderRef.current.stop();
                setIsRecording(false);
            }
        };
    }, [isRecording]);


    useEffect(() => {
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
        setIsGeneratingInterview(true);
        setIsLoading(true);
        setInterviewStarted(true);
        setCurrentQuestionIndex(-1); // Set to -1 initially, will be set to 0 after welcome audio
        setUserAnswer('');
        setAudioBase64(''); // Reset audio base64 data
        setIsRecording(false); // Reset recording state

        // Generate interview questions first
        generateInterviewQuestions(interviewData);
    };

    // Function to actually start the interview after welcome audio
    const startInterviewAfterIntro = () => {
        // This function is called after the welcome audio finishes playing and the 3-second delay
        // Set currentQuestionIndex to 0 to trigger the useEffect hook that plays the first question
        setCurrentQuestionIndex(0);
    };

    // Function to handle moving to the next question
    const handleNextQuestion = async () => {
        if (!audioBase64) {
            setValidationError('Please record an answer before proceeding.');
            setShowValidationError(true);
            return;
        }

        // Check if currentQuestionIndex is valid
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
            console.error('Invalid question index:', currentQuestionIndex);
            setValidationError('An error occurred with the current question. Please try again.');
            setShowValidationError(true);
            return;
        }

        // Check if currentQuestionIndex is valid
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
            console.error('Invalid question index:', currentQuestionIndex);
            setValidationError('An error occurred with the current question. Please try again.');
            setShowValidationError(true);
            return;
        }

        setIsValidating(true);

        try {
            const interviewService = InterviewService.getInstance();
            const sessionId = sessionStorage.getItem('sessionId');
            const jobName = sessionStorage.getItem('jobName');

            const currentQuestion = questions[currentQuestionIndex];

            const request: ValidateAnswerRequest = {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                answer: userAnswer,
                sessionId: sessionId || undefined,
                jobName: jobName || undefined,
                tags: currentQuestion.tags,
                softSkill: currentQuestion.softSkill
            };

            const response = await interviewService.validateAnswer(request);

            if (response.success) {
                // If validation is successful, move to the next question
                if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                    setUserAnswer('');
                    setAudioBase64(''); // Reset audio base64 data
                    setIsRecording(false); // Reset recording state
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
        if (!audioBase64) {
            setValidationError('Please record an answer before finishing.');
            setShowValidationError(true);
            return;
        }

        // Check if currentQuestionIndex is valid
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
            console.error('Invalid question index:', currentQuestionIndex);
            setValidationError('An error occurred with the current question. Please try again.');
            setShowValidationError(true);
            return;
        }

        setIsValidating(true);

        try {
            const interviewService = InterviewService.getInstance();
            const sessionId = sessionStorage.getItem('sessionId');
            const jobName = sessionStorage.getItem('jobName');

            const currentQuestion = questions[currentQuestionIndex];

            const request: ValidateAnswerRequest = {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                answer: userAnswer,
                sessionId: sessionId || undefined,
                jobName: jobName || undefined,
                tags: currentQuestion.tags,
                softSkill: currentQuestion.softSkill
            };

            const response = await interviewService.validateAnswer(request);

            if (response.success) {
                // If validation is successful, mark the interview as completed
                setInterviewCompleted(true);
                setValidationError(null);

                // Call the finalize endpoint if we have a sessionId
                if (sessionId) {
                    setIsFinalizing(true);
                    try {
                        const finalizeRequest: FinalizeInterviewRequest = {
                            sessionId: sessionId
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

    // Function to fetch transition phrases
    const fetchTransitionPhrases = async () => {
        // If we've already fetched the transition phrases, don't fetch them again
        if (transitionPhrasesFetchedRef.current) {
            console.log('Transition phrases already fetched, skipping duplicate call');
            return;
        }

        try {
            // Get languageCode and voiceId from session storage
            const languageCode = sessionStorage.getItem('languageCode');
            const selectedInterviewerStr = sessionStorage.getItem('selectedInterviewer');

            if (!languageCode || !selectedInterviewerStr) {
                console.error('Missing language code or interviewer data.');
                return;
            }

            // Parse the selectedInterviewer object
            const selectedInterviewer = JSON.parse(selectedInterviewerStr);
            const voiceId = selectedInterviewer.voiceId;

            if (!voiceId) {
                console.error('Missing voice ID in interviewer data.');
                return;
            }

            console.log('Fetching transition phrases...');
            // Call the API to get the transition phrases
            const interviewService = InterviewService.getInstance();

            // Fetch section changer phrases
            const sectionChangerResponse = await interviewService.getSectionChangerPhrases(languageCode, voiceId);
            if (sectionChangerResponse.success && sectionChangerResponse.transitionPhrases) {
                setSectionChangerPhrases(sectionChangerResponse.transitionPhrases);
            } else {
                console.error('Failed to fetch section changer phrases:', sectionChangerResponse.message);
            }

            // Fetch transition phrases
            const transitionResponse = await interviewService.getTransitionPhrases(languageCode, voiceId);
            if (transitionResponse.success && transitionResponse.transitionPhrases) {
                setTransitionPhrases(transitionResponse.transitionPhrases);
            } else {
                console.error('Failed to fetch transition phrases:', transitionResponse.message);
            }

            // Mark that we've fetched the transition phrases
            transitionPhrasesFetchedRef.current = true;

        } catch (error) {
            console.error('Error fetching transition phrases:', error);
        }
    };

    const generateInterviewQuestions = async (data: {
        duration: number,
        jobName: string,
        softSkillsPercentage: number,
        tags: string[]
    }) => {
        try {
            // Get languageCode and interviewerId from session storage
            const languageCode = sessionStorage.getItem('languageCode');
            const selectedInterviewerStr = sessionStorage.getItem('selectedInterviewer');

            // Create a copy of the data object to add the new properties
            const requestData = { ...data };

            // Add language if available
            if (languageCode) {
                requestData.language = languageCode;
            }

            // Add interviewerId if available
            if (selectedInterviewerStr) {
                try {
                    const selectedInterviewer = JSON.parse(selectedInterviewerStr);
                    if (selectedInterviewer && selectedInterviewer.voiceId) {
                        requestData.interviewerId = selectedInterviewer.voiceId;
                    }
                } catch (error) {
                    console.error('Error parsing selectedInterviewer:', error);
                }
            }

            const interviewService = InterviewService.getInstance();
            const response = await interviewService.generateQuestions(requestData);

            if (response.success) {
                setQuestions(response.questions);

                // Store sessionId in sessionStorage if available
                if (response.sessionId) {
                    sessionStorage.setItem('sessionId', response.sessionId);
                }

                // Now that questions are generated, fetch transition phrases and welcome audio
                const results = await Promise.all([
                    fetchTransitionPhrases(),
                    fetchWelcomeAudio()
                ]);
                const welcomeAudio = results[1];

                // Only play welcome audio after all backend calls are complete
                if (welcomeAudio) {
                    playWelcomeAudio(welcomeAudio);
                }
            } else {
                setErrorMessage(response.message || 'Failed to generate interview questions.');
            }
        } catch (error) {
            console.error('Error generating questions:', error);
            setErrorMessage('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
            setIsGeneratingInterview(false);
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
            <style>{pulseKeyframes}</style>
            {/* Hidden audio element for welcome audio */}
            <audio
                id="welcome-audio"
                ref={audioRef}
                style={{ display: 'none' }}
                controls
                preload="auto"
                crossOrigin="anonymous"
            />

            {/* Hidden audio element for transition audio */}
            <audio
                id="transition-audio"
                ref={transitionAudioRef}
                style={{ display: 'none' }}
                controls
                preload="auto"
                crossOrigin="anonymous"
            />

            {/* Hidden audio element for transition audio */}
            <audio
                id="transition-audio"
                ref={transitionAudioRef}
                style={{ display: 'none' }}
                controls
                preload="auto"
                crossOrigin="anonymous"
            />

            {/* Validation Error Snackbar */}
            <Snackbar
                open={showValidationError}
                autoHideDuration={6000}
                onClose={handleCloseValidationError}
                message={validationError}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />

            {/* Hidden audio element for question audio */}
            <audio
                id="question-audio"
                ref={questionAudioRef}
                style={{ display: 'none' }}
                controls
                preload="auto"
                crossOrigin="anonymous"
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

            {isGeneratingInterview ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <Typography variant="h5" color="primary" sx={{ mb: 3, fontWeight: 500 }}>
                        We are preparing your interview
                    </Typography>
                    <CircularProgress size={60} sx={{ mb: 3 }} />
                    <Box sx={{ width: '100%', maxWidth: 400 }}>
                        <Box sx={{
                            width: '100%',
                            bgcolor: 'rgba(0,0,0,0.05)',
                            borderRadius: 2,
                            p: 0.5,
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
                        }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: 12,
                                    background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
                                    borderRadius: 1,
                                    animation: 'pulse 1.5s infinite ease-in-out',
                                    boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            ) : isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
                    <CircularProgress />
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
                                        // Navigate to interview results page
                                        const sessionId = sessionStorage.getItem('sessionId');
                                        window.location.href = `/interview/${sessionId}`;
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
                                    Question {currentQuestionIndex >= 0 ? currentQuestionIndex + 1 : 0} of {questions.length}
                                </Typography>

                                {questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" gutterBottom>
                                                    {questions[currentQuestionIndex].question}
                                                </Typography>
                                                {/* Hidden audio element for better browser compatibility */}
                                                <audio
                                                    id="question-audio"
                                                    ref={questionAudioRef}
                                                    style={{ display: 'none' }}
                                                    controls
                                                    preload="auto"
                                                    crossOrigin="anonymous"
                                                />
                                            </Box>
                                            <Typography 
                                                variant="body2" 
                                                color="text.secondary"
                                                gutterBottom
                                            >
                                                Tags:
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                {questions[currentQuestionIndex] && questions[currentQuestionIndex].tags &&
                                                 questions[currentQuestionIndex].tags.map((tag, index) => (
                                                    <Chip key={index} label={tag} variant="outlined" />
                                                ))}
                                            </Box>
                                        </Box>

                                        {isRecording ? (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 4,
                                                    bgcolor: 'rgba(244, 67, 54, 0.1)',
                                                    borderRadius: 2,
                                                    minHeight: '150px'
                                                }}
                                            >
                                                <MicIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                                                <Typography variant="h6" color="error.main">
                                                    Recording in progress...
                                                </Typography>
                                                <IconButton
                                                    color="error"
                                                    onClick={stopRecording}
                                                    aria-label="Stop recording"
                                                    sx={{ mt: 2 }}
                                                >
                                                    <MicOffIcon fontSize="large" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    p: 4,
                                                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                                                    borderRadius: 2,
                                                    minHeight: '150px'
                                                }}
                                            >
                                                {audioBase64 ? (
                                                    <Typography variant="h6" color="primary.main">
                                                        Recording completed. Ready to submit.
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="h6" color="text.secondary">
                                                        Waiting for question audio to finish...
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" 
                                                color="primary"
                                                onClick={currentQuestionIndex >= questions.length - 1 ? handleFinishInterview : handleNextQuestion}
                                                disabled={isValidating || isRecording}
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
