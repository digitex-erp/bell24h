import React from 'react';
import { Box, Container, Typography, Grid, Avatar, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { 
  FormatQuote as QuoteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
} from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Procurement Manager, EcoFashion Inc.',
    avatar: '/avatars/avatar1.jpg',
    content: 'Bell24H has completely transformed our sourcing process. We found reliable suppliers for our organic cotton needs within days, and the platform\'s verification system gave us peace of mind.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Operations Director, TechGadgets Ltd.',
    avatar: '/avatars/avatar2.jpg',
    content: 'The AI-powered matching is incredibly accurate. We were connected with suppliers that perfectly matched our technical requirements, saving us countless hours of research and vetting.',
    rating: 4.5,
  },
  {
    id: 3,
    name: 'Priya Patel',
    role: 'Founder, GreenHome Solutions',
    avatar: '/avatars/avatar3.jpg',
    content: 'As a small business, finding trustworthy suppliers was always a challenge. Bell24H made it easy to connect with verified suppliers who understand our sustainability values.',
    rating: 5,
  },
];

const StyledTestimonialCard = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4, 3),
  height: '100%',
  position: 'relative',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
  '&::before': {
    content: '"\201C"',
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    fontSize: '5rem',
    color: theme.palette.primary.light,
    fontFamily: 'Georgia, serif',
    lineHeight: 1,
    opacity: 0.2,
  },
}));

const RatingStars = ({ value }: { value: number }) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalfStar = value % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<StarIcon key={i} color="primary" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<StarHalfIcon key={i} color="primary" />);
    } else {
      stars.push(<StarBorderIcon key={i} color="primary" />);
    }
  }

  return <Box display="flex">{stars}</Box>;
};

const Testimonials = () => {
  const theme = useTheme();

  return (
    <Container>
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
          }}
        >
          What Our Customers Say
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
          Don't just take our word for it. Here's what our users have to say about their experience with Bell24H.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={testimonial.id}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StyledTestimonialCard>
                <Box position="relative" zIndex={1}>
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                    {testimonial.content}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" mb={2}>
                    <RatingStars value={testimonial.rating} />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      {testimonial.rating.toFixed(1)}/5.0
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box>
                      <Typography variant="subtitle1" component="div" fontWeight={600}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </StyledTestimonialCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>
      
      <Box textAlign="center" mt={6}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Join thousands of satisfied businesses using Bell24H to streamline their procurement process.
        </Typography>
      </Box>
    </Container>
  );
};

export default Testimonials;
