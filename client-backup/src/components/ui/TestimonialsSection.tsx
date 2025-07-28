'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Stack,
  IconButton,
  Container
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { motion, AnimatePresence } from 'framer-motion';

// Define testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'CEO, TechGadgets Inc.',
    company: 'TechGadgets Inc.',
    content: 'Bell24H has revolutionized how we connect with suppliers. The AI-powered RFQ matching system saves us hours every week.',
    rating: 5,
    avatar: '/images/avatars/avatar1.jpg'
  },
  {
    id: 2,
    name: 'Raj Patel',
    role: 'Procurement Manager',
    company: 'Global Manufacturing Co.',
    content: 'The supplier risk scoring dashboard gives us confidence in our decisions. It\'s a game-changer for B2B procurement.',
    rating: 4,
    avatar: '/images/avatars/avatar2.jpg'
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Operations Director',
    company: 'Logistics Solutions Ltd.',
    content: 'I was blown away by the AI explainability features. Being able to see why a supplier was matched helps build trust across our team.',
    rating: 5,
    avatar: '/images/avatars/avatar3.jpg'
  },
  {
    id: 4,
    name: 'Ahmed Hassan',
    role: 'Supply Chain Lead',
    company: 'Middle East Distributors',
    content: 'As someone working in Arabic, I appreciate the RTL support and multilingual capabilities of Bell24H. The interface feels natural and intuitive.',
    rating: 5,
    avatar: '/images/avatars/avatar4.jpg'
  }
];

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1); // -1 for left, 1 for right
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalTestimonials = testimonials.length;
  const testimonialsToShow = 1; // Can be changed to 2 or 3 for multi-card view

  // Auto-play testimonials
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeIndex]);

  const nextSlide = () => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % totalTestimonials);
    resetAutoPlay();
  };

  const prevSlide = () => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + totalTestimonials) % totalTestimonials);
    resetAutoPlay();
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 6000);
  };

  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box textAlign="center" mb={6}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            What Our Users Say
          </Typography>
          <Typography variant="body1" color="text.secondary" maxWidth="700px" mx="auto">
            Hear from businesses and suppliers who've transformed their operations with Bell24H.
          </Typography>
        </Box>

        {/* Testimonial Carousel */}
        <Box sx={{ position: 'relative', overflow: 'hidden', height: 320, maxWidth: '1000px', mx: 'auto', mb: 4 }}>
          <Box sx={{ display: 'flex', position: 'relative', height: '100%' }}>
            <AnimatePresence initial={false} mode="wait">
              {testimonials.slice(activeIndex, activeIndex + testimonialsToShow).map((testimonial) => (
                <motion.div
                  key={testimonial.id}
                  custom={direction}
                  variants={{
                    enter: (dir) => ({
                      x: dir > 0 ? 300 : -300,
                      opacity: 0,
                      scale: 0.95
                    }),
                    center: {
                      zIndex: 1,
                      x: 0,
                      opacity: 1,
                      scale: 1
                    },
                    exit: (dir) => ({
                      zIndex: 0,
                      x: dir < 0 ? 300 : -300,
                      opacity: 0,
                      scale: 0.95
                    })
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'spring', stiffness: 300, damping: 30 },
                    opacity: { duration: 0.4 },
                    scale: { type: 'spring', stiffness: 300, damping: 30 }
                  }}
                  style={{
                    width: `${100 / testimonialsToShow}%`,
                    padding: testimonialsToShow > 1 ? '0 8px' : '0'
                  }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    boxShadow: 3,
                    p: 2,
                    bgcolor: 'background.paper'
                  }}>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Box sx={{ position: 'relative' }}>
                        <FormatQuoteIcon sx={{ fontSize: 48, color: 'primary.light', opacity: 0.2, position: 'absolute', top: -20, left: -10 }} />
                        <Typography variant="body1" sx={{ mt: 1, pl: 2, fontStyle: 'italic' }}>
                          "{testimonial.content}"
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Rating
                          value={testimonial.rating}
                          readOnly
                          precision={0.5}
                          sx={{ mb: 2 }}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={testimonial.avatar} alt={testimonial.name} sx={{ mr: 2 }} />
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">{testimonial.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                            {testimonial.company && (
                              <Typography variant="caption" color="text.disabled">{testimonial.company}</Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        </Box>

        {/* Navigation Controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 2 }}>
          <IconButton
            onClick={prevSlide}
            color="primary"
            sx={{
              mr: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Stack direction="row" spacing={1}>
            {testimonials.map((_, index) => (
              <Button
                key={index}
                size="small"
                onClick={() => {
                  setDirection(index > activeIndex ? 1 : -1);
                  setActiveIndex(index);
                  resetAutoPlay();
                }}
                sx={{
                  minWidth: 10,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: index === activeIndex ? 'primary.main' : 'grey.300',
                  p: 0,
                  '&:hover': {
                    bgcolor: index === activeIndex ? 'primary.dark' : 'grey.400'
                  }
                }}
              />
            ))}
          </Stack>

          <IconButton
            onClick={nextSlide}
            color="primary"
            sx={{
              ml: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white'
              }
            }}
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
}
