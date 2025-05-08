import React, { useState } from 'react';
import {
    Typography,
    Card,
    Box,
    Input,
    CardContent,
    Container,
    Button,
    TextField,
    Divider,
    Stack,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { JobDescriptionParserService } from '../../../service/jobDescriptionParserService.ts';

const JobDescriptionUploadPage: React.FC = () => {
    const jobDescriptionParserService = JobDescriptionParserService.getInstance();
    const [file, setFile] = useState(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleFileSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setAlertMessage("Please select a file first.");
            return;
        }

        try {
            const { jobName, tags, success, message } = await jobDescriptionParserService.processJobDescriptionFile(file);
            if (!success) {
                setAlertMessage(message || 'Failed to process the job description file. Please try again.');
                return;
            }
            navigate('/interview/setup', { state: { jobName, tags } });
        } catch (error) {
            if (error instanceof Error) {
                setAlertMessage(`Error processing file: ${error.message}`);
            } else {
                setAlertMessage('Error processing file: Something went wrong');
            }
        }
    };

    const handleTextSubmit = async () => {
        const textField = document.getElementById('job-description-textfield') as HTMLTextAreaElement;
        const jobDescriptionText = textField?.value;

        if (!jobDescriptionText) {
            setAlertMessage("Please enter a job description.");
            return;
        }

        try {
            const { jobName, tags, success, message } = await jobDescriptionParserService.processJobDescriptionText(jobDescriptionText);
            if (!success) {
                setAlertMessage(message || 'Failed to process the job description text. Please try again.');
                return;
            }
            navigate('/interview/setup', { state: { jobName, tags } });
        } catch (error) {
            if (error instanceof Error) {
                setAlertMessage(`Error processing text: ${error.message}`);
            } else {
                setAlertMessage('Error processing text: Something went wrong');
            }
        }
    };

    const handleSkip = () => {
        navigate('/interview/setup');
    };

    const OrDivider = () => (
        <Box
            display="flex"
            alignItems="center"
            width="100%"
            sx={{ my: 2 }}
        >
            <Divider sx={{ flex: 1 }} />
            <Typography sx={{ mx: 2, color: 'text.secondary' }}>OR</Typography>
            <Divider sx={{ flex: 1 }} />
        </Box>
    );

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
            {alertMessage && (
                <Box sx={{ mb: 2, width: '100%' }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {alertMessage}
                    </Alert>
                </Box>
            )}
            <Stack spacing={2} alignItems="center">
                <Card sx={{ width: 500 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Upload job description
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            You can upload a job description to pre-configure the interview settings.
                        </Typography>
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
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    onClick={(e) => {
                                        if (file && !['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                                            e.preventDefault();
                                            setAlertMessage("Invalid file format. Please upload a PDF or DOCX file.");
                                            return;
                                        }
                                    }}
                                >
                                    Upload
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <OrDivider />

                <Card sx={{ width: 500 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Write the job description
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            Type below the job description to preconfigure the interview settings.
                        </Typography>

                        <TextField
                            id="job-description-textfield"
                            multiline
                            rows={4}
                            fullWidth
                            variant="outlined"
                            placeholder="Enter your message..."
                            sx={{ mt: 2 }}
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
                    </CardContent>
                </Card>

                <OrDivider />

                <Button
                    variant="outlined"
                    onClick={handleSkip}
                    sx={{ width: 350, padding: '1rem' }}
                >
                    Skip to setup page
                </Button>
            </Stack>
        </Container>
    );
};

export default JobDescriptionUploadPage;