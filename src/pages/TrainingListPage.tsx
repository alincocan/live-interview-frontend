import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';
import { TrainingService, TrainingListItem } from '../service/TrainingService.tsx';

const TrainingListPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [sessions, setSessions] = useState<TrainingListItem[]>([]);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const trainingService = TrainingService.getInstance();
                const response = await trainingService.getSessions();

                if (response.success) {
                    setSessions(response.sessions);
                    setErrorMessage(null);
                } else {
                    setErrorMessage(response.message || 'Failed to fetch training sessions. Please try again.');
                }
            } catch (error) {
                console.error('Error fetching training sessions:', error);
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSessions();
    }, []);

    // Format difficulty level for display
    const formatDifficulty = (difficulty: string) => {
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1).toLowerCase();
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
        }
    };

    // Handle view session details
    const handleViewSession = (sessionId: string) => {
        navigate(`/training/${sessionId}`);
    };

    // Handle page change
    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    // Handle rows per page change
    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom align="left" color="text.primary" sx={{ mb: 4 }}>
                Your Trainings
            </Typography>

            {isLoading ? (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    my: 8,
                    py: 6
                }}>
                    <CircularProgress 
                        size={60} 
                        thickness={4} 
                        sx={{ 
                            color: 'primary.main',
                            mb: 3
                        }} 
                    />
                    <Typography 
                        variant="h6" 
                        align="center" 
                        sx={{ 
                            fontWeight: 'medium',
                            color: 'text.secondary',
                            animation: 'pulse 1.5s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { opacity: 0.6 },
                                '50%': { opacity: 1 },
                                '100%': { opacity: 0.6 }
                            }
                        }}
                    >
                        Loading training sessions...
                    </Typography>
                </Box>
            ) : errorMessage ? (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        my: 4, 
                        p: 3, 
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'error.light',
                        backgroundColor: 'error.lighter',
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            bgcolor: 'error.main',
                            color: 'white',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            flexShrink: 0
                        }}>
                            <Typography variant="h6">!</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6" color="error.dark" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                Error Loading Training Sessions
                            </Typography>
                            <Typography variant="body1" color="error.dark">
                                {errorMessage}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            ) : sessions.length > 0 ? (
                <TableContainer component={Paper} sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    border: '1px solid rgba(0,0,0,0.05)'
                }}>
                    <Table sx={{ minWidth: 650 }} aria-label="training sessions table">
                        <TableHead sx={{ bgcolor: 'background.paper' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Job Name</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Difficulty</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Questions</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Score</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sessions
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((session) => (
                                <TableRow
                                    key={session.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
                                >
                                    <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                                        {session.jobName}
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'inline-block',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: session.difficulty.toLowerCase() === 'hard' ? 'error.light' : 
                                                    session.difficulty.toLowerCase() === 'medium' ? 'warning.light' : 'success.light',
                                            color: session.difficulty.toLowerCase() === 'hard' ? 'error.dark' : 
                                                  session.difficulty.toLowerCase() === 'medium' ? 'warning.dark' : 'success.dark',
                                            fontWeight: 'medium',
                                            fontSize: '0.875rem'
                                        }}>
                                            {formatDifficulty(session.difficulty)}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        {session.duration}
                                    </TableCell>
                                    <TableCell>{formatDate(session.createTime)}</TableCell>
                                    <TableCell>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Box sx={{ 
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                bgcolor: session.score >= 70 ? 'success.main' : 
                                                        session.score >= 40 ? 'warning.main' : 'error.main',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}>
                                                {session.score.toFixed(0)}
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                / 100
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="View Training Session Details">
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleViewSession(session.id)}
                                                aria-label="view training session details"
                                            >
                                                <VisibilityIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        component="div"
                        count={sessions.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25]}
                        sx={{ 
                            bgcolor: 'background.paper',
                            color: 'white'
                        }}
                    />
                </TableContainer>
            ) : (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        my: 6, 
                        p: 4, 
                        borderRadius: 2,
                        border: '1px solid rgba(0,0,0,0.08)',
                        backgroundColor: 'info.lighter',
                        boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    }}
                >
                    <Box 
                        sx={{ 
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: 'info.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}
                    >
                        <Typography variant="h4" color="info.dark">0</Typography>
                    </Box>
                    <Typography variant="h5" color="info.dark" sx={{ fontWeight: 'medium', mb: 1 }}>
                        No Training Sessions Found
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mb: 3 }}>
                        You haven't completed any training sessions yet. Start a new training session to see your results here.
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate('/training/choose')}
                        sx={{ 
                            px: 3, 
                            py: 1,
                            borderRadius: 2,
                            fontWeight: 'medium'
                        }}
                    >
                        Start New Training
                    </Button>
                </Paper>
            )}
        </Container>
    );
};

export default TrainingListPage;
