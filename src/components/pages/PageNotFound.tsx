import { Link } from 'react-router-dom';
import { Card, CardContent, Typography, Button } from '@mui/material';

const PageNotFound = () => {
  return (
    <Card
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: 400,
        maxWidth: '100%',
        maxHeight: '100%',
        textAlign: 'center',
        padding: 2,
        margin: 'auto', // center the card
        boxShadow: 3, // Optional shadow for styling
      }}
    >
      <CardContent>
        <Typography variant="h4" gutterBottom>
          404
        </Typography>
        <Typography variant="h6" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          The page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/"
          sx={{ marginTop: 2 }}
        >
          Go to Home
        </Button>
      </CardContent>
    </Card>
  );
};

export default PageNotFound;