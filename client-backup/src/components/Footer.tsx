import React from 'react';
import { Box, Container, Grid, Typography, Link, Divider, IconButton, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

const FooterContainer = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  padding: theme.spacing(6, 0),
  marginTop: 'auto',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const FooterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    bottom: -8,
    width: '40px',
    height: '3px',
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '3px',
  },
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: 'block',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    paddingLeft: '8px',
    textDecoration: 'none',
  },
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  '& svg': {
    marginRight: theme.spacing(1.5),
    color: theme.palette.primary.main,
    marginTop: '4px',
  },
}));

const socialLinks = [
  { icon: <FacebookIcon />, url: 'https://facebook.com' },
  { icon: <TwitterIcon />, url: 'https://twitter.com' },
  { icon: <LinkedInIcon />, url: 'https://linkedin.com' },
  { icon: <InstagramIcon />, url: 'https://instagram.com' },
];

const Footer = () => {
  const theme = useTheme();

  const footerLinks = [
    {
      title: 'Company',
      links: [
        { text: 'About Us', url: '/about' },
        { text: 'Careers', url: '/careers' },
        { text: 'Blog', url: '/blog' },
        { text: 'Press', url: '/press' },
        { text: 'Contact Us', url: '/contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { text: 'Help Center', url: '/help' },
        { text: 'Guides', url: '/guides' },
        { text: 'API Documentation', url: '/api-docs' },
        { text: 'Community', url: '/community' },
        { text: 'Webinars', url: '/webinars' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Terms of Service', url: '/terms' },
        { text: 'Cookie Policy', url: '/cookies' },
        { text: 'GDPR', url: '/gdpr' },
        { text: 'Sitemap', url: '/sitemap' },
      ],
    },
  ];

  return (
    <FooterContainer>
      <Container maxWidth="lg">
        <Grid container spacing={6}>
          <Grid item xs={12} md={5}>
            <Box mb={3}>
              <Box 
                component="img" 
                src="/logo.svg" 
                alt="Bell24H Logo" 
                sx={{ height: 40, mb: 2 }} 
              />
              <Typography variant="body1" paragraph>
                Bell24H is a leading B2B marketplace connecting buyers with trusted suppliers worldwide. 
                Our platform streamlines the procurement process with AI-powered matching and secure transactions.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                {socialLinks.map((social, index) => (
                  <IconButton 
                    key={index} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      color: theme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                      },
                    }}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </Box>
          </Grid>

          {footerLinks.map((column, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <FooterTitle variant="h6">{column.title}</FooterTitle>
              <Box component="nav">
                {column.links.map((link, linkIndex) => (
                  <FooterLink 
                    href={link.url} 
                    key={linkIndex}
                    underline="none"
                  >
                    {link.text}
                  </FooterLink>
                ))}
              </Box>
            </Grid>
          ))}

          <Grid item xs={12} md={3}>
            <FooterTitle variant="h6">Contact Us</FooterTitle>
            <ContactItem>
              <LocationIcon />
              <Box>
                <Typography variant="body2">123 Business Ave, Suite 100</Typography>
                <Typography variant="body2">San Francisco, CA 94107</Typography>
              </Box>
            </ContactItem>
            <ContactItem>
              <PhoneIcon />
              <Typography variant="body2">+1 (555) 123-4567</Typography>
            </ContactItem>
            <ContactItem>
              <EmailIcon />
              <Typography variant="body2">info@bell24h.com</Typography>
            </ContactItem>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Bell24H. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, md: 0 } }}>
            <Typography variant="body2" color="text.secondary">
              <Link href="/privacy" color="inherit" underline="none">Privacy Policy</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/terms" color="inherit" underline="none">Terms of Service</Link>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/cookies" color="inherit" underline="none">Cookie Policy</Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </FooterContainer>
  );
};

export default Footer;
