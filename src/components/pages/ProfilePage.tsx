import { Box, Typography, Avatar, Paper, Divider, Button, Grid } from '@mui/material';

const ProfilePage: React.FC = () => {
    return (
        <Box
            sx={{
                p: 4,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '80vh',
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 500,
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 3,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Avatar
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User Avatar"
                        sx={{ width: 100, height: 100, margin: '0 auto' }}
                    />
                    <Typography variant="h5" sx={{ mt: 2 }}>
                        John Doe
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        johndoe@example.com
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Role:</Typography>
                        <Typography variant="body1">Software Engineer</Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="subtitle2">Joined:</Typography>
                        <Typography variant="body1">Jan 2023</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle2">Bio:</Typography>
                        <Typography variant="body2">
                            Passionate developer who loves building beautiful and functional user interfaces.
                        </Typography>
                    </Grid>
                </Grid>

                <Button variant="contained" fullWidth sx={{ mt: 4 }}>
                    Edit Profile
                </Button>
            </Paper>
        </Box>
    );
};

export default ProfilePage;