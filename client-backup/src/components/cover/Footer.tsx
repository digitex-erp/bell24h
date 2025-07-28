import { Box, Typography, Link, Stack } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" bgcolor="grey.100" py={4} px={2} mt={8}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="body2">© 2025 Bell24H. All rights reserved.</Typography>
        <Stack direction="row" spacing={3}>
          <Link href="/about" underline="hover" color="inherit">About</Link>
          <Link href="/contact" underline="hover" color="inherit">Contact</Link>
          <Link href="/privacy" underline="hover" color="inherit">Privacy Policy</Link>
        </Stack>
      </Stack>
    </Box>
  );
}
