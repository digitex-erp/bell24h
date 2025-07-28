'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  IconButton,
  Container,
  Stack,
  Skeleton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '@/hooks/useApi';
import { ApiStateHandler } from '@/components/ui/ApiStateHandler';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

const defaultTestimonials: Testimonial[] = [
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
  const [imgErrorMap, setImgErrorMap] = useState<{ [key: number]: boolean }>({});

  const { data: testimonials = defaultTestimonials, isLoading, error, refetch } = useApi<Testimonial[]>(
    ['testimonials'],
    '/api/testimonials',
    {
      timeout: 5000,
      retries: 2,
      queryOptions: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retryOnMount: true,
      },
    }
  );

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

  const handleImgError = (id: number) => {
    setImgErrorMap((prev) => ({ ...prev, [id]: true }));
  };

  const renderLoadingState = () => (
    <Box sx={{ position: 'relative', overflow: 'hidden', height: 320, maxWidth: '1000px', mx: 'auto', mb: 4 }}>
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 6,
        p: 4,
        bgcolor: '#ffffff',
        borderRadius: 2,
      }}>
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box sx={{ position: 'relative' }}>
            <FormatQuoteIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.1, position: 'absolute', top: -30, left: -20 }} />
            <Skeleton variant="text" height={100} sx={{ mt: 1, pl: 2 }} />
          </Box>
          
          <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Skeleton variant="rectangular" width={200} height={24} sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box>
                <Skeleton variant="text" width={150} height={24} />
                <Skeleton variant="text" width={200} height={20} />
                <Skeleton variant="text" width={180} height={20} />
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
  
  return (
    <Box sx={{ py: 16, bgcolor: '#f8f9fa' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box textAlign="center" mb={8}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }} gutterBottom>
            What Our Clients Say
          </Typography>
          <Typography variant="body1" sx={{ color: '#666', maxWidth: '800px', mx: 'auto' }}>
            Discover how Bell24H is transforming B2B connections and procurement processes across industries.
          </Typography>
        </Box>

        <ApiStateHandler
          isLoading={isLoading}
          error={error}
          retry={refetch}
          loadingComponent={renderLoadingState()}
        >
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
                      }),
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
                      boxShadow: 6,
                      p: 4,
                      bgcolor: '#ffffff',
                      borderRadius: 2,
                    }}>
                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <Box sx={{ position: 'relative' }}>
                          <FormatQuoteIcon sx={{ fontSize: 56, color: 'primary.light', opacity: 0.1, position: 'absolute', top: -30, left: -20 }} />
                          <Typography variant="body1" sx={{ mt: 1, pl: 2, fontStyle: 'italic', color: '#444' }}>
                            "{testimonial.content}"
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                          <Rating
                            value={testimonial.rating}
                            readOnly
                            precision={0.5}
                            sx={{ mb: 2 }}
                          />
                          
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={!imgErrorMap[testimonial.id] ? testimonial.avatar : undefined}
                              alt={testimonial.name} 
                              sx={{ mr: 2, bgcolor: imgErrorMap[testimonial.id] ? 'primary.main' : undefined }}
                              onError={() => handleImgError(testimonial.id)}
                              aria-label={`Avatar of ${testimonial.name}`}
                            >
                              {imgErrorMap[testimonial.id] ? testimonial.name.charAt(0) : null}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>{testimonial.name}</Typography>
                              <Typography variant="body2" sx={{ color: '#777' }}>{testimonial.company}</Typography>
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#888' }}>{testimonial.role}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>
            <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
              <IconButton onClick={prevSlide} disabled={activeIndex === 0} size="large" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={nextSlide} disabled={activeIndex === totalTestimonials - testimonialsToShow} size="large" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                <ArrowForwardIcon />
              </IconButton>
            </Stack>
          </Box>
        </ApiStateHandler>
      </Container>
    </Box>
  );
}
