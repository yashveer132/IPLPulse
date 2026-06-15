import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FranchiseCard({ franchise }) {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/franchises/${franchise.shortName}`)}
      sx={{ 
        cursor: 'pointer', 
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <Box sx={{ height: 8, width: '100%', bgcolor: franchise.color || 'primary.main' }} />
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {franchise.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {franchise.city} • Est. {franchise.foundedYear}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              bgcolor: franchise.color || 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            {franchise.shortName}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {franchise.titles > 0 ? (
            <Chip 
              label={`${franchise.titles}x Champions`} 
              size="small" 
              sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText', fontWeight: 600 }} 
            />
          ) : (
            <Chip label="No Titles Yet" size="small" variant="outlined" />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Win Rate
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {franchise.winPct ? `${franchise.winPct}%` : 'N/A'}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Auction Spend
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              ₹{franchise.totalSpent ? Math.round(franchise.totalSpent / 100) : 0}Cr
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default FranchiseCard;
