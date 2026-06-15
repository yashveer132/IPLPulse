import { Box, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

function EmptyState({
  title = 'No Results Found',
  description = "We couldn't find anything matching your criteria.",
  icon: Icon = SearchOffIcon,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'action.hover', mb: 2 }}>
        <Icon sx={{ fontSize: 48, color: 'text.secondary' }} />
      </Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
        {description}
      </Typography>
    </Box>
  );
}

export default EmptyState;
