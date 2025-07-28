import { Box, Typography, Avatar, Stack, Rating } from '@mui/material';

export default function Testimonials() {
  return (
    <Box sx={{ my: 10, textAlign: 'center' }}>
      <Typography variant="h4" fontWeight="bold" mb={5}>
        What Our Users Say
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} justifyContent="center" alignItems="center">
        <Box p={3} border={1} borderColor="grey.300" borderRadius={2} maxWidth={300} width="100%">
          <Avatar alt="John Doe" src="https://picsum.photos/200/300" sx={{ width: 56, height: 56, mb: 2, mx: 'auto' }} />
          <Typography fontWeight="bold">John Doe</Typography>
          <Rating value={4} readOnly sx={{ color: 'gold', mb: 1 }} />
          <Typography variant="body2">Great platform for finding reliable suppliers!</Typography>
        </Box>
        <Box p={3} border={1} borderColor="grey.300" borderRadius={2} maxWidth={300} width="100%">
          <Avatar alt="Jane Smith" src="https://picsum.photos/201/300" sx={{ width: 56, height: 56, mb: 2, mx: 'auto' }} />
          <Typography fontWeight="bold">Jane Smith</Typography>
          <Rating value={5} readOnly sx={{ color: 'gold', mb: 1 }} />
          <Typography variant="body2">Fast and secure RFQ matching with AI insights.</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
