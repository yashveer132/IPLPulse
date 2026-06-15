import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function PlayerCard({ player }) {
  const navigate = useNavigate();

  return (
    <Card 
      onClick={() => navigate(`/players/${player.id}`)}
      sx={{ 
        cursor: 'pointer', 
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {player.name}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip label={player.role} size="small" variant="outlined" color="primary" />
          <Chip label={player.nationality} size="small" variant="outlined" />
        </Box>

        {player.career && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            {player.role.includes('Bat') || player.role.includes('All') ? (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Runs</Typography>
                <Typography variant="body2" fontWeight={600}>{player.career.totalRuns}</Typography>
              </Box>
            ) : null}
            {player.role.includes('Bowl') || player.role.includes('All') ? (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Wickets</Typography>
                <Typography variant="body2" fontWeight={600}>{player.career.totalWickets}</Typography>
              </Box>
            ) : null}
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">Matches</Typography>
              <Typography variant="body2" fontWeight={600}>{player.career.totalMatches}</Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default PlayerCard;
