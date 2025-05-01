import {
    Typography,
    Card,
    CardActionArea,
    CardMedia,
    CardContent,
    Container,
} from '@mui/material';

const ChooseInterviewerPage: React.FC = () => {
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
            <Typography variant="h4" sx={{ mb: 4, color: theme => theme.palette.text.primary }}>
                Choose Interviewer
            </Typography>
            <Card
                sx={{
                    maxWidth: 345,
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: 3,
                }}
            >
                <CardActionArea>
                    <CardMedia
                        component="img"
                        height="300"
                        image="https://randomuser.me/api/portraits/men/45.jpg"
                        alt="John Smith"
                    />
                    <CardContent sx={{ backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" component="div" color="black">
                            John Smith
                        </Typography>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Container>
    );
};

export default ChooseInterviewerPage;