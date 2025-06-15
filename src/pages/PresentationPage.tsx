import React from 'react';
import { 
    Box, 
    Button, 
    Card, 
    CardContent, 
    Container, 
    Grid, 
    Typography,
    Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import ComputerIcon from '@mui/icons-material/Computer';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';

const PresentationPage: React.FC = () => {
    const navigate = useNavigate();

    // Features data
    const features = [
        {
            title: "AI-Powered Interviews",
            description: "Experience realistic interview scenarios with our advanced AI interviewers that adapt to your responses.",
            icon: <ComputerIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: "Personalized Feedback",
            description: "Receive detailed feedback on your performance, highlighting strengths and areas for improvement.",
            icon: <BarChartIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: "Industry-Specific Training",
            description: "Practice with questions tailored to your industry and role, from entry-level to executive positions.",
            icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        },
        {
            title: "Skill Development",
            description: "Enhance your communication skills, confidence, and interview techniques with targeted practice sessions.",
            icon: <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        }
    ];

    // Testimonials data
    const testimonials = [
        {
            quote: "This platform completely transformed my interview preparation. I went from nervous and unprepared to confident and articulate.",
            author: "Sarah J., Software Engineer",
            rating: 5
        },
        {
            quote: "The AI interviewers feel incredibly realistic. The feedback I received helped me identify weaknesses I wasn't even aware of.",
            author: "Michael T., Marketing Director",
            rating: 5
        },
        {
            quote: "After just three practice sessions, I felt much more prepared for my actual interview. I got the job!",
            author: "Elena R., Data Scientist",
            rating: 5
        }
    ];

    return (
        <Box sx={{ 
            minHeight: '100vh',
            bgcolor: 'background.default'
        }}>
            {/* Hero Section */}
            <Box sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                color: 'white',
                py: { xs: 8, md: 12 },
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography 
                                variant="h2" 
                                component="h1" 
                                fontWeight="bold"
                                sx={{ 
                                    mb: 2,
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }
                                }}
                            >
                                Master Your Interview Skills
                            </Typography>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    mb: 4,
                                    opacity: 0.9,
                                    fontWeight: 'normal',
                                    lineHeight: 1.5
                                }}
                            >
                                Practice with AI-powered interviewers and get real-time feedback to land your dream job.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    color="secondary"
                                    onClick={() => navigate('/signup')}
                                    sx={{ 
                                        py: 1.5, 
                                        px: 4, 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        borderRadius: '30px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                        '&:hover': {
                                            transform: 'translateY(-3px)',
                                            boxShadow: '0 12px 20px rgba(0,0,0,0.3)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Get Started Free
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    onClick={() => navigate('/login')}
                                    sx={{ 
                                        py: 1.5, 
                                        px: 4, 
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        borderRadius: '30px',
                                        borderColor: 'white',
                                        color: 'white',
                                        '&:hover': {
                                            borderColor: 'white',
                                            backgroundColor: 'rgba(255,255,255,0.1)'
                                        }
                                    }}
                                >
                                    Log In
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Box 
                                component="img"
                                src="/images/interview-hero.png"
                                alt="AI Interview"
                                sx={{ 
                                    maxWidth: '100%',
                                    height: 'auto',
                                    borderRadius: '10px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                                    transform: { xs: 'scale(0.9)', md: 'scale(1)' }
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
                {/* Decorative elements */}
                <Box sx={{ 
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 0
                }} />
                <Box sx={{ 
                    position: 'absolute',
                    bottom: -150,
                    left: -150,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                    zIndex: 0
                }} />
            </Box>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        fontWeight="bold"
                        color="primary"
                        sx={{ mb: 2 }}
                    >
                        Why Choose Our Platform?
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ 
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        Our AI-powered interview platform offers everything you need to prepare for your next job interview.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card 
                                sx={{ 
                                    height: '100%',
                                    borderRadius: '16px',
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-10px)',
                                        boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                                    }
                                }}
                                elevation={2}
                            >
                                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                                    <Box sx={{ mb: 2 }}>
                                        {feature.icon}
                                    </Box>
                                    <Typography variant="h5" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Product Showcase Section */}
            <Box sx={{ 
                bgcolor: 'background.paper',
                py: { xs: 6, md: 10 }
            }}>
                <Container maxWidth="lg">
                    <Grid container spacing={6} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Box 
                                component="img"
                                src="/images/interview-dashboard.png"
                                alt="Platform Dashboard"
                                sx={{ 
                                    width: '100%',
                                    borderRadius: '10px',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography 
                                variant="h3" 
                                component="h2" 
                                fontWeight="bold"
                                color="primary"
                                sx={{ mb: 3 }}
                            >
                                Realistic Interview Experience
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
                                Our platform provides a realistic interview environment with AI-powered interviewers that respond to your answers in real-time. Practice with industry-specific questions and receive detailed feedback on your performance.
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Typography variant="body1">Realistic AI interviewers with natural conversations</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Typography variant="body1">Industry-specific questions tailored to your role</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Typography variant="body1">Detailed performance analytics and feedback</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CheckCircleIcon color="success" />
                                    <Typography variant="body1">Practice at your own pace, anytime, anywhere</Typography>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* How It Works Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        fontWeight="bold"
                        color="primary"
                        sx={{ mb: 2 }}
                    >
                        How It Works
                    </Typography>
                    <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ 
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        Get started in just a few simple steps
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={2}
                            sx={{ 
                                p: 4, 
                                textAlign: 'center',
                                borderRadius: '16px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}
                            >
                                1
                            </Box>
                            <Typography variant="h5" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
                                Create an Account
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Sign up for a free account to access our interview preparation platform.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={2}
                            sx={{ 
                                p: 4, 
                                textAlign: 'center',
                                borderRadius: '16px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}
                            >
                                2
                            </Box>
                            <Typography variant="h5" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
                                Choose Your Interview
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Select from various interview types, industries, and difficulty levels to match your needs.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper 
                            elevation={2}
                            sx={{ 
                                p: 4, 
                                textAlign: 'center',
                                borderRadius: '16px',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}
                        >
                            <Box 
                                sx={{ 
                                    width: 60, 
                                    height: 60, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 2,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '1.5rem'
                                }}
                            >
                                3
                            </Box>
                            <Typography variant="h5" component="h3" fontWeight="bold" sx={{ mb: 2 }}>
                                Practice & Improve
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Complete your interview, receive feedback, and track your progress over time.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Testimonials Section */}
            <Box sx={{ 
                bgcolor: 'background.paper',
                py: { xs: 6, md: 10 }
            }}>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography 
                            variant="h3" 
                            component="h2" 
                            fontWeight="bold"
                            color="primary"
                            sx={{ mb: 2 }}
                        >
                            What Our Users Say
                        </Typography>
                        <Typography 
                            variant="h6" 
                            color="text.secondary"
                            sx={{ 
                                maxWidth: '800px',
                                mx: 'auto',
                                lineHeight: 1.6
                            }}
                        >
                            Thousands of job seekers have improved their interview skills with our platform
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {testimonials.map((testimonial, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Card 
                                    sx={{ 
                                        height: '100%',
                                        borderRadius: '16px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    <CardContent sx={{ p: 4 }}>
                                        <Box sx={{ display: 'flex', mb: 2 }}>
                                            {[...Array(testimonial.rating)].map((_, i) => (
                                                <StarIcon key={i} sx={{ color: '#FFD700', fontSize: 20 }} />
                                            ))}
                                        </Box>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                mb: 3, 
                                                fontStyle: 'italic',
                                                lineHeight: 1.7,
                                                fontSize: '1.1rem'
                                            }}
                                        >
                                            "{testimonial.quote}"
                                        </Typography>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                            {testimonial.author}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Call to Action Section */}
            <Box sx={{ 
                background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
                color: 'white',
                py: { xs: 8, md: 12 },
                textAlign: 'center'
            }}>
                <Container maxWidth="md">
                    <Typography 
                        variant="h3" 
                        component="h2" 
                        fontWeight="bold"
                        sx={{ mb: 3 }}
                    >
                        Ready to Ace Your Next Interview?
                    </Typography>
                    <Typography 
                        variant="h6" 
                        sx={{ 
                            mb: 4,
                            opacity: 0.9,
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        Join thousands of job seekers who have improved their interview skills and landed their dream jobs.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        <Button 
                            variant="contained" 
                            size="large" 
                            color="secondary"
                            onClick={() => navigate('/signup')}
                            sx={{ 
                                py: 1.5, 
                                px: 4, 
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                borderRadius: '30px',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                '&:hover': {
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 12px 20px rgba(0,0,0,0.3)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Get Started Free
                        </Button>
                        <Button 
                            variant="outlined" 
                            size="large"
                            startIcon={<PlayArrowIcon />}
                            sx={{ 
                                py: 1.5, 
                                px: 4, 
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                borderRadius: '30px',
                                borderColor: 'white',
                                color: 'white',
                                '&:hover': {
                                    borderColor: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)'
                                }
                            }}
                        >
                            Watch Demo
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default PresentationPage;
