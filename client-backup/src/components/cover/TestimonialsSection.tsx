import React from 'react';
import { Box, Typography, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const TestimonialCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: theme.shadows[2],
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const QuoteIcon = styled(Box)(({ theme }) => ({
  fontSize: '3rem',
  lineHeight: 1,
  color: theme.palette.primary.light,
  opacity: 0.2,
  marginBottom: theme.spacing(2),
  '&:before': {
    content: '"\201C"',
  },
}));

const testimonials = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    role: 'Procurement Manager, TechCorp India',
    avatar: '/avatars/rajesh.jpg',
    content:
      'Bell24H has transformed our procurement process. We\'ve reduced our sourcing time by 60% and found high-quality suppliers we can trust.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'CEO, FashionFusion',
    avatar: '/avatars/priya.jpg',
    content:
      'The platform\'s intuitive interface and extensive supplier network helped us expand our product line while maintaining quality standards.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Amit Sharma',
    role: 'Founder, GreenAgro',
    avatar: '/avatars/amit.jpg',
    content:
      'As a small business, finding reliable suppliers was always a challenge. Bell24H connected us with verified partners who understand our needs.',
    rating: 4,
  },
  {
    id: 4,
    name: 'Neha Gupta',
    role: 'Operations Director, HomeStyle',
    avatar: '/avatars/neha.jpg',
    content:
      'The customer support team is exceptional. They\'ve been instrumental in helping us navigate international trade regulations.',
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderRating = (rating: number) => {
    return (
      <Box sx={{ display: 'flex', gap: 0.5, mb: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Box
            key={i}
            component="span"
            sx={{
              color: i < rating ? theme.palette.warning.main : theme.palette.action.disabled,
            }}
          >
            ★
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ my: 12 }}>
      <Box sx={{ textAlign: 'center', maxWidth: 700, mx: 'auto', mb: 8 }}>
        <Typography
          variant="overline"
          color="primary"
          sx={{
            display: 'inline-block',
            mb: 2,
            fontWeight: 600,
            letterSpacing: 1,
          }}
        >
          TESTIMONIALS
        </Typography>
        <Typography
          variant={isMobile ? 'h4' : 'h3'}
          component="h2"
          sx={{
            mb: 3,
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          What Our Clients Say
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: isMobile ? '1rem' : '1.1rem',
            lineHeight: 1.7,
          }}
        >
          Don't just take our word for it. Here's what our clients have to say about their experience with our platform.
        </Typography>
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={isMobile ? 1 : 2}
          navigation={!isMobile}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          style={{
            padding: theme.spacing(0, 1, 6, 1),
            '--swiper-pagination-bullet-size': '10px',
            '--swiper-pagination-bullet-horizontal-gap': '6px',
            '--swiper-pagination-color': theme.palette.primary.main,
            '--swiper-navigation-size': '24px',
            '--swiper-navigation-color': theme.palette.primary.main,
          }}
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id}>
              <TestimonialCard>
                <QuoteIcon />
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    flexGrow: 1,
                    mb: 3,
                    fontStyle: 'italic',
                    lineHeight: 1.8,
                  }}
                >
                  {testimonial.content}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 56,
                      height: 56,
                      mr: 2,
                      border: `2px solid ${theme.palette.primary.light}`,
                    }}
                  >
                    {testimonial.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                    {renderRating(testimonial.rating)}
                  </Box>
                </Box>
              </TestimonialCard>
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Box>
  );
};

export default TestimonialsSection;
