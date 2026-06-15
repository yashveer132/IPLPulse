import { Skeleton, Box, Card, CardContent } from '@mui/material';

export function CardSkeleton() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Skeleton variant="text" width="40%" height={24} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
        <Skeleton variant="text" width="60%" height={48} />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1, borderRadius: 1 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" width="100%" height={52} sx={{ mb: 1, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

export function ChartSkeleton() {
  return (
    <Card>
      <CardContent>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={300} sx={{ borderRadius: 1 }} />
      </CardContent>
    </Card>
  );
}

export function PageSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="40%" height={48} sx={{ mb: 4 }} />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 3, mb: 4 }}>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </Box>
      <TableSkeleton rows={5} />
    </Box>
  );
}
