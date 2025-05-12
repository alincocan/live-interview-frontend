import {
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Container,
    Stack,
} from '@mui/material';
import React from "react";
import { useNavigate } from 'react-router-dom';

const ChooseInterviewerPage: React.FC = () => {
    const navigate = useNavigate();
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
            <Typography sx={{ mb: 5, color: 'text.secondary' }} variant="h4">
                Select Interviewer
            </Typography>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                justifyContent="center"
                sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 2 }}
            >
                <Card
                    sx={{
                        width: 260,
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                        }
                    }}
                >
                    <CardActionArea onClick={() => navigate('/interview/upload')}>
                        <CardMedia
                            component="img"
                            height="260"
                            image="https://randomuser.me/api/portraits/men/5.jpg"
                            alt="John Smith"
                        />
                        <CardContent>
                            <Typography variant="h6" component="div" color="text.primary" align="center">
                                John Smith
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>

                <Card
                    sx={{
                        width: 260,
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                        }
                    }}
                >
                    <CardActionArea onClick={() => navigate('/interview/upload')}>
                        <CardMedia
                            component="img"
                            height="260"
                            image="https://randomuser.me/api/portraits/women/1.jpg"
                            alt="Sarah Johnson"
                        />
                        <CardContent>
                            <Typography variant="h6" component="div" color="text.primary" align="center">
                                Sarah Johnson
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>

                <Card
                    sx={{
                        width: 260,
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: 6
                        }
                    }}
                >
                    <CardActionArea onClick={() => navigate('/interview/upload')}>
                        <CardMedia
                            component="img"
                            height="260"
                            image="https://randomuser.me/api/portraits/men/11.jpg"
                            alt="Michael Chen"
                        />
                        <CardContent>
                            <Typography variant="h6" component="div" color="text.primary" align="center">
                                Michael Chen
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Stack>
        </Container>
    );
};

export default ChooseInterviewerPage;
