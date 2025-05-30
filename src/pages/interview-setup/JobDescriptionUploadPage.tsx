import React, { useState, useEffect } from 'react';
import {
    Typography,
    Card,
    Box,
    Input,
    CardContent,
    Container,
    Button,
    TextField,
    Stack,
    Alert,
    CircularProgress,
    Modal,
    IconButton,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { JobDescriptionParserService } from '../../service/jobDescriptionParserService.ts';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import CloseIcon from '@mui/icons-material/Close';

const JobDescriptionUploadPage: React.FC = () => {
    const jobDescriptionParserService = JobDescriptionParserService.getInstance();
    const [file, setFile] = useState(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [openFileModal, setOpenFileModal] = useState(false);
    const [openTextModal, setOpenTextModal] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get selectedInterviewer from location state if available
    const selectedInterviewer = location.state?.selectedInterviewer;

    // Clear sessionStorage items when component mounts
    useEffect(() => {
        sessionStorage.removeItem('jobName');
        sessionStorage.removeItem('tags');
        sessionStorage.removeItem('duration');
        sessionStorage.removeItem('softSkillsPercentage');
        sessionStorage.removeItem('difficulty');
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // First, get the text content from the file
            const fileContent = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = async (event) => {
                    try {
                        const arrayBuffer = event.target?.result;
                        if (!arrayBuffer) {
                            return reject('Failed to read file content.');
                        }

                        if (file.type === 'application/pdf') {
                            const pdfjsLib = await import('pdfjs-dist');
                            pdfjsLib.GlobalWorkerOptions.workerSrc =
                                '../../node_modules/pdfjs-dist/build/pdf.worker.mjs';

                            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                            let text = '';
                            for (let i = 1; i <= pdf.numPages; i++) {
                                const page = await pdf.getPage(i);
                                const content = await page.getTextContent();
                                text += content.items.map((item: { str: string }) => item.str).join(' ');
                            }
                            resolve(text);
                        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                            const mammoth = await import('mammoth');
                            const result = await mammoth.extractRawText({ arrayBuffer });
                            resolve(result.value);
                        } else {
                            reject('Unsupported file type. Please upload a PDF or DOCX file.');
                        }
                    } catch (error) {
                        reject(`Error parsing file content: ${error}`);
                    }
                };

                reader.onerror = () => {
                    reject('Error reading file.');
                };

                reader.readAsArrayBuffer(file);
            });

            // Now process the job description
            const { jobName, tags, success, message } = await jobDescriptionParserService.processJobDescriptionFile(file);
            if (!success) {
                setAlertMessage(message || 'Failed to process the job description file. Please try again.');
                return;
            }
            // Save jobName in sessionStorage, but pass tags, jobDescription, and selectedInterviewer as state
            sessionStorage.setItem('jobName', jobName || '');
            // Don't store tags in sessionStorage, pass them as state instead
            navigate('/interview/setup', { 
                state: { 
                    tags,
                    selectedInterviewer,
                    jobDescription: fileContent
                } 
            });
        } catch (error) {
            if (error instanceof Error) {
                setAlertMessage(`Error processing file: ${error.message}`);
            } else {
                setAlertMessage('Error processing file: Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleTextSubmit = async () => {
        const textField = document.getElementById('job-description-textfield') as HTMLTextAreaElement;
        const jobDescriptionText = textField?.value;

        if (!jobDescriptionText) {
            setAlertMessage("Please enter a job description.");
            return;
        }

        setIsLoading(true);
        try {
            const { jobName, tags, success, message } = await jobDescriptionParserService.processJobDescriptionText(jobDescriptionText);
            if (!success) {
                setAlertMessage(message || 'Failed to process the job description text. Please try again.');
                return;
            }
            // Save jobName in sessionStorage, but pass tags, jobDescription, and selectedInterviewer as state
            sessionStorage.setItem('jobName', jobName || '');
            // Don't store tags in sessionStorage, pass them as state instead
            navigate('/interview/setup', { 
                state: { 
                    tags,
                    selectedInterviewer,
                    jobDescription: jobDescriptionText
                } 
            });
        } catch (error) {
            if (error instanceof Error) {
                setAlertMessage(`Error processing text: ${error.message}`);
            } else {
                setAlertMessage('Error processing text: Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSkip = () => {
        navigate('/interview/setup', { 
            state: { 
                selectedInterviewer,
                jobDescription: '' // Pass empty job description when skipping
            } 
        });
    };

    const baseModalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
    };

    const fileModalStyle = {
        ...baseModalStyle,
        width: 500, // Original width for file upload modal
    };

    const textModalStyle = {
        ...baseModalStyle,
        width: 800, // Current width for text input modal
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 8,
            }}
        >
            <Typography sx={{ mb: 5, color: 'text.secondary' }} variant="h4">
                Interview Setup
            </Typography>
            {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={50} sx={{ mb: 2 }} />
                    <Typography variant="body1" color={theme => theme.palette.text.primary} sx={{ mb: 3 }}>Processing the job description...</Typography>
                </Box>
            ) : (
                <>
                    <Stack
                        direction="row"
                        spacing={3}
                        justifyContent="center"
                        sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2 }}
                    >
                        <Card
                            sx={{
                                width: 260,
                                height: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => setOpenFileModal(true)}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h6" component="div">
                                    Upload job description
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                width: 260,
                                height: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={() => setOpenTextModal(true)}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <EditNoteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 1 }} />
                                <Typography variant="h6" component="div">
                                    Write job description
                                </Typography>
                            </CardContent>
                        </Card>

                        <Card
                            sx={{
                                width: 260,
                                height: 180,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: 6
                                }
                            }}
                            onClick={handleSkip}
                        >
                            <CardContent sx={{ textAlign: 'center' }}>
                                <SkipNextIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 1 }} />
                                <Typography variant="h6" component="div" color="text.secondary">
                                    Skip to setup page
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* File Upload Modal */}
                        <Modal
                            open={openFileModal}
                            onClose={() => setOpenFileModal(false)}
                            aria-labelledby="file-upload-modal"
                            aria-describedby="modal-for-uploading-job-description-file"
                        >
                            <Box sx={{...fileModalStyle, position: 'relative'}}>
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setOpenFileModal(false)}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
                                    Upload job description
                                </Typography>
                                <Typography variant="body2" gutterBottom sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                    You can upload a job description to pre-configure the interview settings.
                                </Typography>
                                {alertMessage && (
                                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                        {alertMessage}
                                    </Alert>
                                )}
                                <Box component="form" onSubmit={handleFileSubmit} sx={{ mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        fullWidth
                                        sx={{
                                            textTransform: 'none',
                                            justifyContent: 'flex-start',
                                            color: 'text.secondary',
                                            borderColor: 'text.secondary',
                                        }}
                                    >
                                        {file ? file.name : 'Choose File'}
                                        <Input
                                            type="file"
                                            onChange={handleFileChange}
                                            inputProps={{ accept: '.pdf,.docx' }}
                                            sx={{ display: 'none' }}
                                        />
                                    </Button>
                                    <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                                        {file && (
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                color="primary"
                                                onClick={(e) => {
                                                    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                                                        e.preventDefault();
                                                        setAlertMessage("Invalid file format. Please upload a PDF or DOCX file.");
                                                        return;
                                                    }
                                                }}
                                            >
                                                Upload
                                            </Button>
                                        )}
                                    </Box>
                                </Box>
                            </Box>
                        </Modal>

                        {/* Text Input Modal */}
                        <Modal
                            open={openTextModal}
                            onClose={() => setOpenTextModal(false)}
                            aria-labelledby="text-input-modal"
                            aria-describedby="modal-for-writing-job-description"
                        >
                            <Box sx={{...textModalStyle, position: 'relative'}}>
                                <IconButton
                                    aria-label="close"
                                    onClick={() => setOpenTextModal(false)}
                                    sx={{
                                        position: 'absolute',
                                        right: 8,
                                        top: 8,
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>
                                <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', color: 'primary.main' }}>
                                    Write the job description
                                </Typography>
                                <Typography variant="body2" gutterBottom  sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                    Type below the job description to preconfigure the interview settings.
                                </Typography>
                                {alertMessage && (
                                    <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                                        {alertMessage}
                                    </Alert>
                                )}

                                <TextField
                                    id="job-description-textfield"
                                    multiline
                                    rows={20}
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Enter your message..."
                                    sx={{ mt: 2, minHeight: '250px' }}
                                />

                                <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleTextSubmit}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            </Box>
                        </Modal>
                    </Stack>
                </>)}
        </Container>
    );
};

export default JobDescriptionUploadPage;
