import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    TextField,
    Slider,
    Box,
    Button,
    Tooltip,
    FormHelperText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

const InterviewConfiguration: React.FC = () => {
    const navigate = useNavigate();

    // Get jobName and tags from sessionStorage
    const storedJobName = sessionStorage.getItem('jobName') || '';
    const storedTags = sessionStorage.getItem('tags') ? JSON.parse(sessionStorage.getItem('tags') || '[]') : [];

    // State management for form fields
    const [difficultyLevel, setDifficultyLevel] = useState<string>('');
    const [jobName, setJobName] = useState<string>(storedJobName);
    const [softSkills, setSoftSkills] = useState<string>('');
    const [duration, setDuration] = useState<number>(60);
    const [tags, setTags] = useState<string[]>(storedTags);
    const [newTag, setNewTag] = useState<string>('');

    // Error state management
    const [errors, setErrors] = useState<{
        difficultyLevel?: string;
        jobName?: string;
        softSkills?: string;
        duration?: string;
        tags?: string;
        form?: string;
    }>({});

    // Track if form has been submitted
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

    // Handlers
    const handleDifficultyChange = (level: string) => {
        setDifficultyLevel(level);
        // Clear error when field is updated
        if (errors.difficultyLevel) {
            setErrors(prev => ({ ...prev, difficultyLevel: undefined }));
        }
    };

    const handleJobNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setJobName(event.target.value);
        // Clear error when field is updated
        if (errors.jobName) {
            setErrors(prev => ({ ...prev, jobName: undefined }));
        }
    };

    const handleSoftSkillsChange = (level: string) => {
        setSoftSkills(level);
        // Clear error when field is updated
        if (errors.softSkills) {
            setErrors(prev => ({ ...prev, softSkills: undefined }));
        }
    };

    const handleDurationChange = (_event: Event, newValue: number | number[]) => {
        setDuration(newValue as number);
        // Clear error when field is updated
        if (errors.duration) {
            setErrors(prev => ({ ...prev, duration: undefined }));
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
            // Clear error when tags are updated
            if (errors.tags) {
                setErrors(prev => ({ ...prev, tags: undefined }));
            }
        }
    };

    const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewTag(event.target.value);
    };

    const handleTagInputKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddTag();
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
        // Clear error when tags are updated
        if (errors.tags) {
            setErrors(prev => ({ ...prev, tags: undefined }));
        }
    };

    // Validate form fields
    const validateForm = () => {
        let newErrors: { [key: string]: string } = {};
        let isValid = true;

        // Validate difficultyLevel
        if (!difficultyLevel) {
            newErrors.difficultyLevel = "Please select a difficulty level";
            isValid = false;
        }

        // Validate jobName
        if (!jobName.trim()) {
            newErrors.jobName = "Job name is required";
            isValid = false;
        } else if (jobName.trim().length < 3) {
            newErrors.jobName = "Job name must be at least 3 characters";
            isValid = false;
        }

        // Validate softSkills (already has a default value, but checking for completeness)
        if (!["0", "25", "50"].includes(softSkills)) {
            newErrors.softSkills = "Please select a valid soft skills option";
            isValid = false;
        }

        // Validate duration (already constrained by slider, but checking for completeness)
        if (duration < 10 || duration > 90) {
            newErrors.duration = "Duration must be between 10 and 90 minutes";
            isValid = false;
        }

        // Validate tags
        if (tags.length === 0) {
            newErrors.tags = "Please add at least one tag";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        // Set form as submitted
        setIsSubmitted(true);

        // Validate form before submission
        const isValid = validateForm();

        // If validation failed, return early
        if (!isValid) {
            return;
        }

        // Use the values directly from the chips

        // Save values to session storage
        sessionStorage.setItem('duration', duration.toString());
        sessionStorage.setItem('jobName', jobName);
        sessionStorage.setItem('softSkillsPercentage', softSkills);
        sessionStorage.setItem('difficulty', difficultyLevel);
        sessionStorage.setItem('tags', JSON.stringify(tags));

        // Log the saved values
        console.log('Saved to session storage:', {
            duration,
            jobName,
            softSkillsPercentage: softSkills,
            difficulty: difficultyLevel,
            tags
        });

        // Navigate to the InterviewPage
        navigate('/interview/questions');
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

            <Card sx={{ width: '100%', mb: 4 }}>
                <CardContent>
                    <Stack spacing={3}>
                        {/* Difficulty Level Chip Selection */}
                        <Box>
                            <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <TuneIcon sx={{ mr: 1 }} />
                                Difficulty Level
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip
                                    label="Junior"
                                    onClick={() => handleDifficultyChange("JUNIOR")}
                                    color={difficultyLevel === "JUNIOR" ? "success" : "success"}
                                    variant={difficultyLevel === "JUNIOR" ? "filled" : "outlined"}
                                    sx={{ cursor: 'pointer' }}
                                />
                                <Chip
                                    label="Mid"
                                    onClick={() => handleDifficultyChange("MID")}
                                    color={difficultyLevel === "MID" ? "info" : "info"}
                                    variant={difficultyLevel === "MID" ? "filled" : "outlined"}
                                    sx={{ cursor: 'pointer' }}
                                />
                                <Chip
                                    label="Senior"
                                    onClick={() => handleDifficultyChange("SENIOR")}
                                    color={difficultyLevel === "SENIOR" ? "warning" : "warning"}
                                    variant={difficultyLevel === "SENIOR" ? "filled" : "outlined"}
                                    sx={{ cursor: 'pointer' }}
                                />
                                <Chip
                                    label="Expert"
                                    onClick={() => handleDifficultyChange("EXPERT")}
                                    color={difficultyLevel === "EXPERT" ? "error" : "error"}
                                    variant={difficultyLevel === "EXPERT" ? "filled" : "outlined"}
                                    sx={{ cursor: 'pointer' }}
                                />
                            </Box>
                            {isSubmitted && errors.difficultyLevel && (
                                <FormHelperText error>{errors.difficultyLevel}</FormHelperText>
                            )}
                        </Box>

                        {/* Job Name Input */}
                        <Box>
                            <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <WorkIcon sx={{ mr: 1 }} />
                                Job Title
                            </Typography>
                            <TextField
                                fullWidth
                                value={jobName}
                                onChange={handleJobNameChange}
                                error={isSubmitted && !!errors.jobName}
                                helperText={isSubmitted ? errors.jobName : ''}
                            />
                        </Box>

                        {/* Soft Skills Chip Selection */}
                        <Box>
                            <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <PsychologyIcon sx={{ mr: 1 }} />
                                Soft Skills
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Tooltip title="No soft skills questions">
                                    <Chip
                                        label="Purely Technical"
                                        onClick={() => handleSoftSkillsChange("0")}
                                        color={softSkills === "0" ? "primary" : "default"}
                                        variant={softSkills === "0" ? "filled" : "outlined"}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Some soft skills questions">
                                    <Chip
                                        label="Mostly Technical"
                                        onClick={() => handleSoftSkillsChange("25")}
                                        color={softSkills === "25" ? "primary" : "default"}
                                        variant={softSkills === "25" ? "filled" : "outlined"}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>
                                <Tooltip title="Mix of technical and soft skill questions">
                                    <Chip
                                        label="Mixed"
                                        onClick={() => handleSoftSkillsChange("50")}
                                        color={softSkills === "50" ? "primary" : "default"}
                                        variant={softSkills === "50" ? "filled" : "outlined"}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                </Tooltip>
                            </Box>
                            {isSubmitted && errors.softSkills && (
                                <FormHelperText error>{errors.softSkills}</FormHelperText>
                            )}
                        </Box>

                        {/* Duration Slider */}
                        <Box>
                            <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <AccessTimeIcon sx={{ mr: 1 }} />
                                Duration: {duration} minutes
                            </Typography>
                            <Slider
                                value={duration}
                                onChange={handleDurationChange}
                                step={10}
                                marks
                                min={10}
                                max={90}
                                valueLabelDisplay="auto"
                            />
                            {isSubmitted && errors.duration && (
                                <FormHelperText error>{errors.duration}</FormHelperText>
                            )}
                        </Box>

                        {/* Tags Section */}
                        <Box>
                            <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalOfferIcon sx={{ mr: 1 }} />
                                Tags
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {tags.map((tag, index) => (
                                    <Chip
                                        key={index}
                                        label={tag}
                                        onDelete={() => handleRemoveTag(tag)}
                                        deleteIcon={<CloseIcon />}
                                    />
                                ))}
                            </Box>
                            <TextField
                                fullWidth
                                label="Add a tag"
                                value={newTag}
                                onChange={handleTagInputChange}
                                onKeyPress={handleTagInputKeyPress}
                                error={isSubmitted && !!errors.tags}
                                InputProps={{
                                    endAdornment: (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={handleAddTag}
                                            disabled={!newTag.trim()}
                                        >
                                            Add
                                        </Button>
                                    ),
                                }}
                            />
                            {isSubmitted && errors.tags && (
                                <FormHelperText error>{errors.tags}</FormHelperText>
                            )}
                        </Box>

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default InterviewConfiguration;
