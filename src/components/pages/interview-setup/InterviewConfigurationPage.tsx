import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    TextField,
    Slider,
    Box,
    Button,
    Tooltip,
    FormHelperText,
    FormControl,
    Select,
    MenuItem,
    SelectChangeEvent,
    Grid,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import WorkIcon from '@mui/icons-material/Work';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LanguageIcon from '@mui/icons-material/Language';
import { InterviewService, Country } from '../../../service/InterviewService';

const InterviewConfiguration: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if this is for training based on the path
    const isTraining = location.pathname.includes('/training/');

    // Get tag from location state if available
    const stateTag = location.state?.tag;

    // Get selectedInterviewer from location state if available
    const selectedInterviewer = location.state?.selectedInterviewer;

    // Get jobName from sessionStorage
    const storedJobName = sessionStorage.getItem('jobName') || '';

    // Get tags from location state if available
    const tagsFromState = location.state?.tags;

    // State management for form fields
    const [difficultyLevel, setDifficultyLevel] = useState<string>('');
    const [jobName, setJobName] = useState<string>(storedJobName);
    const [softSkills, setSoftSkills] = useState<string>('');
    const [duration, setDuration] = useState<number>(60);
    const [numQuestions, setNumQuestions] = useState<number>(15); // For training mode

    // Initialize tags with stateTag if available, otherwise use tagsFromState
    const initialTags = stateTag ? [stateTag] : tagsFromState || [];
    const [tags, setTags] = useState<string[]>(initialTags);
    const [newTag, setNewTag] = useState<string>('');
    const [countries, setCountries] = useState<Country[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // Error state management
    const [errors, setErrors] = useState<{
        difficultyLevel?: string;
        jobName?: string;
        softSkills?: string;
        duration?: string;
        numQuestions?: string; // For training mode
        tags?: string;
        country?: string;
        form?: string;
    }>({});

    // Fetch countries when component mounts
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                setLoading(true);
                const interviewService = InterviewService.getInstance();
                const response = await interviewService.getCountries();

                if (response.success && response.countries) {
                    setCountries(response.countries);
                    // Set default country if available
                    if (response.countries.length > 0) {
                        setSelectedCountry(response.countries[0].id);
                    }
                } else {
                    console.error('Failed to fetch countries:', response.message);
                }
            } catch (error) {
                console.error('Error fetching countries:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCountries();
    }, []);

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

    const handleCountryChange = (event: SelectChangeEvent) => {
        setSelectedCountry(event.target.value);
        // Clear error when field is updated
        if (errors.country) {
            setErrors(prev => ({ ...prev, country: undefined }));
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

    const handleNumQuestionsChange = (_event: Event, newValue: number | number[]) => {
        setNumQuestions(newValue as number);
        // Clear error when field is updated
        if (errors.numQuestions) {
            setErrors(prev => ({ ...prev, numQuestions: undefined }));
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            // In training mode, only allow one tag
            if (isTraining) {
                setTags([newTag.trim()]);
            } else {
                setTags([...tags, newTag.trim()]);
            }
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
        const newErrors: { [key: string]: string } = {};
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

        // Validate softSkills in interview mode
        if (!isTraining && !["0", "25", "50"].includes(softSkills)) {
            newErrors.softSkills = "Please select a valid soft skills option";
            isValid = false;
        }

        // Validate language
        if (!selectedCountry) {
            newErrors.country = "Please select a language";
            isValid = false;
        }

        if (isTraining) {
            // Validate numQuestions in training mode
            if (numQuestions < 5 || numQuestions > 30) {
                newErrors.numQuestions = "Number of questions must be between 5 and 30";
                isValid = false;
            }
        } else {
            // Validate duration in interview mode
            if (duration < 10 || duration > 90) {
                newErrors.duration = "Duration must be between 10 and 90 minutes";
                isValid = false;
            }
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

        // Find the selected country's languageCode
        const selectedCountryObj = countries.find(country => country.id === selectedCountry);
        const languageCode = selectedCountryObj ? selectedCountryObj.languageCode : '';

        // Prepare values to pass as state
        let stateToPass;

        if (isTraining) {
            // For training mode, pass numQuestions instead of duration and set softSkillsPercentage to 0
            stateToPass = {
                duration: '0', // Not used in training mode
                numQuestions: numQuestions.toString(),
                jobName,
                softSkillsPercentage: '0', // No soft skills in training mode
                difficulty: difficultyLevel,
                tags,
                languageCode,
                selectedInterviewer
            };

            // Log the values being passed
            console.log('Passing as state (Training mode):', stateToPass);
        } else {
            // For interview mode, pass duration and softSkillsPercentage
            stateToPass = {
                duration: duration.toString(),
                jobName,
                softSkillsPercentage: softSkills,
                difficulty: difficultyLevel,
                tags,
                languageCode,
                selectedInterviewer
            };

            // Log the values being passed
            console.log('Passing as state (Interview mode):', stateToPass);
        }

        // Navigate to the InterviewPage with all values in state
        navigate('/interview/questions', {
            state: stateToPass
        });
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: 8,
            }}
        >
            <Card sx={{ width: '100%', mb: 4 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        {/* Difficulty Level Chip Selection */}
                        <Grid item xs={12} md={6}>
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
                                        onClick={() => handleDifficultyChange("MIDLEVEL")}
                                        color={difficultyLevel === "MIDLEVEL" ? "info" : "info"}
                                        variant={difficultyLevel === "MIDLEVEL" ? "filled" : "outlined"}
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
                        </Grid>

                        {/* Job Name Input */}
                        <Grid item xs={12} md={6}>
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
                        </Grid>

                        {/* Soft Skills Chip Selection - Only show in interview mode */}
                        {!isTraining && (
                            <Grid item xs={12} md={6}>
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
                            </Grid>
                        )}

                        {/* Language Dropdown */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LanguageIcon sx={{ mr: 1 }} />
                                    Language
                                </Typography>
                                <FormControl fullWidth error={isSubmitted && !!errors.country}>
                                    <Select
                                        value={selectedCountry}
                                        onChange={handleCountryChange}
                                        displayEmpty
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return <em>Select a language</em>;
                                            }

                                            const country = countries.find(c => c.id === selected);
                                            if (!country) return <em>Select a language</em>;

                                            const countryCode = country.languageCode.split('-')[1] || country.languageCode;

                                            return (
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <img 
                                                        src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`} 
                                                        alt={`${country.name} flag`}
                                                        style={{ marginRight: '8px', width: '24px', height: '18px' }}
                                                    />
                                                    {country.name}
                                                </Box>
                                            );
                                        }}
                                    >
                                        {loading ? (
                                            <MenuItem value="" disabled>
                                                Loading languages...
                                            </MenuItem>
                                        ) : countries.length === 0 ? (
                                            <MenuItem value="" disabled>
                                                No languages available
                                            </MenuItem>
                                        ) : (
                                            countries.map((country) => {
                                                // Extract country code from languageCode (e.g., 'en-US' -> 'US')
                                                const countryCode = country.languageCode.split('-')[1] || country.languageCode;
                                                return (
                                                    <MenuItem key={country.id} value={country.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <img 
                                                            src={`https://flagcdn.com/24x18/${countryCode.toLowerCase()}.png`} 
                                                            alt={`${country.name} flag`}
                                                            style={{ marginRight: '8px', width: '24px', height: '18px' }}
                                                        />
                                                        {country.name}
                                                    </MenuItem>
                                                );
                                            })
                                        )}
                                    </Select>
                                    {isSubmitted && errors.country && (
                                        <FormHelperText>{errors.country}</FormHelperText>
                                    )}
                                </FormControl>
                            </Box>
                        </Grid>

                        {/* Duration Slider or Number of Questions Slider based on mode */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                {isTraining ? (
                                    <>
                                        <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTimeIcon sx={{ mr: 1 }} />
                                            Number of Questions: {numQuestions}
                                        </Typography>
                                        <Slider
                                            value={numQuestions}
                                            onChange={handleNumQuestionsChange}
                                            step={5}
                                            marks
                                            min={5}
                                            max={30}
                                            valueLabelDisplay="auto"
                                        />
                                        {isSubmitted && errors.numQuestions && (
                                            <FormHelperText error>{errors.numQuestions}</FormHelperText>
                                        )}
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </Box>
                        </Grid>

                        {/* Tags Section */}
                        <Grid item xs={12} md={6}>
                            <Box>
                                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocalOfferIcon sx={{ mr: 1 }} />
                                    {isTraining ? 'Tag' : 'Tags'}
                                </Typography>
                                {isTraining ? (
                                    <TextField
                                        fullWidth
                                        label="Enter a tag"
                                        value={tags.length > 0 ? tags[0] : newTag}
                                        onChange={(e) => {
                                            if (stateTag) {
                                                // Don't allow changes if stateTag exists
                                                return;
                                            }
                                            if (tags.length > 0) {
                                                setTags([e.target.value]);
                                            } else {
                                                setNewTag(e.target.value);
                                            }
                                            // Clear error when field is updated
                                            if (errors.tags) {
                                                setErrors(prev => ({ ...prev, tags: undefined }));
                                            }
                                        }}
                                        onKeyPress={(e) => {
                                            if (stateTag) {
                                                // Don't allow changes if stateTag exists
                                                return;
                                            }
                                            if (e.key === 'Enter' && newTag.trim()) {
                                                e.preventDefault();
                                                setTags([newTag.trim()]);
                                                setNewTag('');
                                                if (errors.tags) {
                                                    setErrors(prev => ({ ...prev, tags: undefined }));
                                                }
                                            }
                                        }}
                                        InputProps={{
                                            readOnly: !!stateTag,
                                        }}
                                        error={isSubmitted && !!errors.tags}
                                        helperText={isSubmitted && errors.tags ? errors.tags : stateTag ? "Tag is pre-filled and cannot be changed" : "Only one tag allowed in training mode"}
                                    />
                                ) : (
                                    <>
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
                                    </>
                                )}
                                {isSubmitted && errors.tags && !isTraining && (
                                    <FormHelperText error>{errors.tags}</FormHelperText>
                                )}
                            </Box>
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSubmit}
                                >
                                    Submit
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};

export default InterviewConfiguration;
