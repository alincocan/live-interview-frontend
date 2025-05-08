import React from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Typography } from '@mui/material'; 
import { Card, CardContent, Chip, Stack } from '@mui/material';

interface InterviewConfigurationProps {
    jobName: string;
    domain: string;
    tags: string[];
}

const InterviewConfiguration: React.FC<InterviewConfigurationProps> = () => {
    const location = useLocation();
    const { jobName, domain, tags } = location.state as InterviewConfigurationProps || { jobName: '', domain: '', tags: [] };

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

            <Card sx={{ width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Job Name: {jobName}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Domain: {domain}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Tags:
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 1, mb: 1, rowGap: 2 }}>
                        {tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                variant='outlined'
                            />
                        ))}
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    );
};

export default InterviewConfiguration;