import { 
    Box, 
    Button, 
    Card, 
    CardContent, 
    Chip, 
    Container, 
    Divider, 
    Grid, 
    List, 
    ListItem, 
    ListItemText, 
    Typography,
    ListItemIcon,
    Fade,
    CircularProgress,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SchoolIcon from '@mui/icons-material/School';
import InsightsIcon from '@mui/icons-material/Insights';
import StarIcon from '@mui/icons-material/Star';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardService } from '../service/dashboardService';
import { DashboardResponse } from '../bo/DashboardData';
import { UserService, User } from '../service/userService';
import {ScoreEnum} from "../util/ScoreEnum.ts";

const DashboardHome = () => {
    const navigate = useNavigate();
    const [section5Visible, setSection5Visible] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Function to show section 5 content
    const showSection5 = () => {
        setSection5Visible(true);
    };

    // Function to hide section 5 content
    const hideSection5 = () => {
        setSection5Visible(false);
    };

    // Prepare chart data based on interviews
    const chartData = dashboardData ? {
        xAxis: [
            {
                data: dashboardData.interviews.slice().reverse().map((_: any, index: number) => index + 1),
                label: 'Interview',
                tickMinStep: 1,
            },
        ],
        yAxis: [
            {
                min: 0,
                max: 100,
                tickMinStep: 1,
            },
        ],
        series: [
            {
                data: dashboardData.interviews.slice().reverse().map((interview: { score: any; }) => interview.score),
                label: 'Score',
            },
        ],
    } : {
        xAxis: [{ data: [], label: 'Interview', tickMinStep: 1 }],
        yAxis: [{ min: 1, max: 10, tickMinStep: 1 }],
        series: [{ data: [], label: 'Score' }],
    };

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const dashboardService = DashboardService.getInstance();
                const response = await dashboardService.getDashboardData();
                if (response.success) {
                    setDashboardData(response);

                    setError(null);
                } else {
                    setError(response.message || 'Failed to fetch dashboard data');
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Fetch user data
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userService = UserService.getInstance();
                const storedUser = userService.getUserFromStorage();
                if (storedUser) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* Loading and Error handling */}
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            )}


            {/* Section 1: Welcome and Score Card */}
            <Grid container spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Welcome!
                        </Typography>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                            {user ? `${user.lastName} ${user.firstName}` : 'Guest'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Another day of learning new things or testing your knowledge. Have fun!
                        </Typography>
                    </Box>
                </Grid>
                {(!loading && dashboardData && dashboardData.lastInterviewScore >= 0) && (
                    <Grid item xs={12} md={3}>
                        <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                                <Typography variant="body2" color="text.secondary">
                                    You've scored
                                </Typography>
                                <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                                    {dashboardData.lastInterviewScore.toFixed(1)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    on your last interview
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Section 2: Are you feeling prepared? */}
            <Grid container justifyContent="center" sx={{ mb: 2 }}>
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="h6">
                                Are you feeling prepared?
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 2, sm: 0 } }}>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    size="medium"
                                    onClick={() => navigate('/interview/choose')}
                                >
                                    Start Interview
                                </Button>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    or
                                </Typography>
                                <Button 
                                    variant="outlined" 
                                    color="primary" 
                                    size="medium"
                                    onClick={() => navigate('/training/choose')}
                                >
                                    Go to trainings
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Stats Heading */}
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, mt: 1 }}>
                <InsightsIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                <Typography variant="h6" color="text.primary">
                    Here are some of your stats
                </Typography>
            </Box>

            {/* Section 3 & 4: Statistics and Recent Interviews (Combined in a matrix layout) */}
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                gridTemplateRows: 'auto auto',
                gridTemplateAreas: {
                    xs: `
                        "pos1"
                        "pos2"
                        "pos4"
                        "pos5"
                        "pos3"
                        "pos3"
                    `,
                    sm: `
                        "pos1 pos2"
                        "pos4 pos5"
                        "pos3 pos3"
                        "pos3 pos3"  
                    `,
                    md: `
                        "pos1 pos2 pos3 pos3"
                        "pos4 pos5 pos3 pos3"
                    `
                },
                gap: 2,
                mb: 2
            }}>
                {/* Position 1: Interviews Taken */}
                <Box sx={{ gridArea: 'pos1' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                {loading ? '...' : dashboardData?.interviews.length || 0}
                            </Typography>
                            <AssignmentIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                Interviews Taken
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Position 2: Interviews Passed */}
                <Box sx={{ gridArea: 'pos2' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                {loading ? '...' : dashboardData?.interviewsPassed || 0}
                            </Typography>
                            <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                Interviews Passed
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Position 3: Recent Interviews (spans 2 rows and 2 columns) */}
                <Box sx={{ gridArea: 'pos3' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 1.5 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Recent Interviews
                            </Typography>
                            <Divider sx={{ mb: 1 }} />
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : dashboardData?.interviews && dashboardData.interviews.length > 0 ? (
                                <List>
                                    {dashboardData.interviews.slice(0,5).map((interview) => (
                                        <ListItem 
                                            key={interview.id} 
                                            divider 
                                            sx={{ 
                                                py: 0.5,
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                                }
                                            }}
                                            onClick={() => navigate(`/interview/${interview.id}`)}
                                        >
                                            <Chip 
                                                label={interview.score >= ScoreEnum.INTERVIEW_PASSING_SCORE ? "Passed" : "Failed"}
                                                color={interview.score >= ScoreEnum.INTERVIEW_PASSING_SCORE ? "success" : "error"}
                                                size="small" 
                                                sx={{ mr: 1, height: '20px', '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                                            />
                                            <ListItemText 
                                                primary={interview.jobName}
                                                primaryTypographyProps={{ variant: 'body2' }}
                                            />
                                            <Chip 
                                                label={interview.score.toFixed(1)}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                sx={{ height: '20px', '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                                    No data available
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Position 4: Interviews Failed */}
                <Box sx={{ gridArea: 'pos4' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                {loading ? '...' : dashboardData?.interviewsFailed || 0}
                            </Typography>
                            <CancelIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                Interviews Failed
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {/* Position 5: Trainings Completed */}
                <Box sx={{ gridArea: 'pos5' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                {loading ? '...' : dashboardData?.trainingsCompleted || 0}
                            </Typography>
                            <SchoolIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.primary" fontWeight="medium">
                                Trainings Completed
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </Box>

            {/* Show content button - shown only when section 5 is not visible */}
            {!section5Visible && (
                <Box 
                    sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 2, 
                        mt: 1,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onClick={showSection5}
                >
                    <Button 
                        variant="outlined" 
                        color="primary"
                        size="small"
                        endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                        sx={{ 
                            borderRadius: '20px',
                            animation: 'pulse 1.5s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'translateY(0)' },
                                '50%': { transform: 'translateY(5px)' },
                                '100%': { transform: 'translateY(0)' }
                            }
                        }}
                    >
                        Show more stats
                    </Button>
                </Box>
            )}

            {/* Section 5: Best Topics and Line Chart - conditionally visible */}
            {section5Visible && (
                <Box>
                    <Fade in={section5Visible} timeout={1000}>
                        <Box>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                {/* Part 1: Recent Topics */}
                                <Grid item xs={12} sm={12} md={4}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent sx={{ p: 1.5 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Recent Topics
                                            </Typography>
                                            <Divider sx={{ mb: 1 }} />
                                            {loading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : dashboardData?.recentTags && dashboardData.recentTags.length > 0 ? (
                                                <List>
                                                    {dashboardData.recentTags.map((tag, index) => (
                                                        <ListItem key={index} sx={{ py: 0.5 }}>
                                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                                <StarIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                                            </ListItemIcon>
                                                            <ListItemText 
                                                                primary={tag} 
                                                                primaryTypographyProps={{ variant: 'body2' }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                                                    No data available
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>

                                {/* Part 2: Line Chart */}
                                <Grid item xs={12} sm={12} md={8}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent sx={{ p: 1.5 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Interview Performance
                                            </Typography>
                                            <Divider sx={{ mb: 1 }} />
                                            {loading ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                                    <CircularProgress size={24} />
                                                </Box>
                                            ) : dashboardData?.interviews && dashboardData.interviews.length > 0 ? (
                                                <Box sx={{ height: 250, width: '100%' }}>
                                                    <LineChart
                                                        xAxis={chartData.xAxis}
                                                        yAxis={chartData.yAxis}
                                                        series={chartData.series}
                                                        height={200}
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                </Box>
                                            ) : (
                                                <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
                                                    No data available
                                                </Typography>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Show less content button */}
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    mb: 2, 
                                    mt: 1,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                onClick={hideSection5}
                            >
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    size="small"
                                    endIcon={<KeyboardArrowUpIcon sx={{ fontSize: 18 }} />}
                                    sx={{ 
                                        borderRadius: '20px',
                                        animation: 'pulse 1.5s infinite',
                                        '@keyframes pulse': {
                                            '0%': { transform: 'translateY(0)' },
                                            '50%': { transform: 'translateY(-5px)' },
                                            '100%': { transform: 'translateY(0)' }
                                        }
                                    }}
                                >
                                    Show less stats
                                </Button>
                            </Box>
                        </Box>
                    </Fade>
                </Box>
            )}
        </Container>
    );
};

export default DashboardHome;
