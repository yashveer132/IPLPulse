import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        gap: 2,
        p: 3,
      }}
    >
      <Typography variant="h1" sx={{ fontSize: '8rem', fontWeight: 800, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Page not found
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ mt: 2 }}>
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default NotFound;
