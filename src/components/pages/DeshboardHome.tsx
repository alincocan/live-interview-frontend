import { Card, CardActionArea, CardContent, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DashboardHome = () => {
    const navigate = useNavigate();
    return (
        <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center',}}>
            <Card sx={{ maxWidth: 400, opacity: 0.95, mt: 10 }}>
                <CardActionArea onClick={() => navigate('/dashboard/choose')}>
                    <CardContent>
                        <Typography gutterBottom variant="h5">
                            Click Me!
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This card links to another feature.
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Container>
    );
};

export default DashboardHome;