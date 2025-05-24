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
    Fade
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
import { useState } from 'react';

// Mock data for recent interviews
const recentInterviews = [
    { id: 1, name: 'Frontend Developer Interview', grade: 4.3, date: '2023-12-15' },
    { id: 2, name: 'React Developer Interview', grade: 8.2, date: '2023-12-10' },
    { id: 3, name: 'Full Stack Developer Interview', grade: 5.5, date: '2023-12-05' },
    { id: 4, name: 'Senior React Developer Interview', grade: 9.3, date: '2023-11-28' },
    { id: 5, name: 'JavaScript Developer Interview', grade: 3.2, date: '2023-11-20' },
];

// Mock data for the line chart
const chartData = {
    xAxis: [
        {
            data: [1, 2, 3, 4, 5, 6, 7, 8],
            label: 'Interview Number',
            tickMinStep: 1,
        },
    ],
    yAxis: [
            {
                min: 1,
                max: 10,
                tickMinStep: 1,
            },
    ],
    series: [
        {
            data: [4.3, 6.5, 5.3, 7.5, 5.1, 8.9, 6.3, 8.4],
            label: 'Score',
        },
    ],
};

// Mock data for best topics
const bestTopics = [
    { id: 1, topic: 'Java 17+' },
    { id: 2, topic: 'Spring Boot' },
    { id: 3, topic: 'AWS' },
    { id: 4, topic: 'Cloud Formation' },
    { id: 5, topic: 'Microservices Architecture' },
];

const DashboardHome = () => {
    const [section5Visible, setSection5Visible] = useState(false);

    // Function to show section 5 content
    const showSection5 = () => {
        setSection5Visible(true);
    };

    // Function to hide section 5 content
    const hideSection5 = () => {
        setSection5Visible(false);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            {/* Section 1: Welcome and Score Card */}
            <Grid container spacing={2} sx={{ mb: 3, justifyContent: 'space-between' }}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Welcome!
                        </Typography>
                        <Typography variant="h4" color="primary.main" fontWeight="bold">
                            John Doe
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Another day of learning new things or testing your knowledge. Have fun!
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                        <CardContent sx={{ textAlign: 'center', width: '100%' }}>
                            <Typography variant="body2" color="text.secondary">
                                You've scored
                            </Typography>
                            <Typography variant="h3" fontWeight="bold" sx={{ my: 1 }}>
                                7.5
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                on your last interview
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
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
                                <Button variant="contained" color="primary" size="medium">
                                    Start Interview
                                </Button>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                    or
                                </Typography>
                                <Button variant="outlined" color="primary" size="medium">
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
                                10
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
                                5
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
                            <List>
                                {recentInterviews.map((interview) => (
                                    <ListItem key={interview.id} divider sx={{ py: 0.5 }}>
                                        <Chip 
                                            label={interview.grade >= 5 ? "Passed" : "Failed"} 
                                            color={interview.grade >= 5 ? "success" : "error"} 
                                            size="small" 
                                            sx={{ mr: 1, height: '20px', '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                                        />
                                        <ListItemText 
                                            primary={interview.name}
                                            secondary={interview.date}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <Chip 
                                            label={interview.grade}
                                            color="primary"
                                            variant="outlined"
                                            size="small"
                                            sx={{ height: '20px', '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Box>

                {/* Position 4: Interviews Failed */}
                <Box sx={{ gridArea: 'pos4' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 1.5, alignItems: 'center', textAlign: 'center', justifyContent: 'center' }}>
                            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                                5
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
                                10
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
                                {/* Part 1: Best Topics */}
                                <Grid item xs={12} sm={12} md={4}>
                                    <Card sx={{ height: '100%' }}>
                                        <CardContent sx={{ p: 1.5 }}>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Best Topics
                                            </Typography>
                                            <Divider sx={{ mb: 1 }} />
                                            <List>
                                                {bestTopics.map((topic) => (
                                                    <ListItem key={topic.id} sx={{ py: 0.5 }}>
                                                        <ListItemIcon sx={{ minWidth: 30 }}>
                                                            <StarIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                                        </ListItemIcon>
                                                        <ListItemText 
                                                            primary={topic.topic} 
                                                            primaryTypographyProps={{ variant: 'body2' }}
                                                        />
                                                    </ListItem>
                                                ))}
                                            </List>
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
                                            <Box sx={{ height: 250, width: '100%' }}>
                                                <LineChart
                                                    xAxis={chartData.xAxis}
                                                    yAxis={chartData.yAxis}
                                                    series={chartData.series}
                                                    height={200}
                                                    sx={{ fontSize: '0.75rem' }}
                                                />
                                            </Box>
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
