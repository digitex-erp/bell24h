'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function ContactPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!mounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center'>
        <div className='animate-pulse'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contact Us</h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Get in touch with our team. We're here to help you succeed with BELL24H.
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>
                  Send Us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label
                        htmlFor='name'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Full Name *
                      </label>
                      <Input
                        id='name'
                        name='name'
                        type='text'
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder='Enter your full name'
                      />
                    </div>
                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Email Address *
                      </label>
                      <Input
                        id='email'
                        name='email'
                        type='email'
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder='Enter your email'
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor='company'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Company Name
                    </label>
                    <Input
                      id='company'
                      name='company'
                      type='text'
                      value={formData.company}
                      onChange={handleChange}
                      placeholder='Enter your company name'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='subject'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Subject *
                    </label>
                    <Input
                      id='subject'
                      name='subject'
                      type='text'
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder='What can we help you with?'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor='message'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Message *
                    </label>
                    <Textarea
                      id='message'
                      name='message'
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder='Tell us more about your inquiry...'
                      rows={6}
                    />
                  </div>

                  <Button type='submit' className='w-full'>
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-xl font-semibold text-gray-900'>
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-start space-x-4'>
                    <div className='bg-blue-100 p-3 rounded-lg'>
                      <svg
                        className='w-6 h-6 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-800'>Email</h3>
                      <p className='text-gray-600'>contact@bell24h.com</p>
                      <p className='text-gray-600'>support@bell24h.com</p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='bg-green-100 p-3 rounded-lg'>
                      <svg
                        className='w-6 h-6 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-800'>Phone</h3>
                      <p className='text-gray-600'>+1 (555) 123-4567</p>
                      <p className='text-gray-600'>+1 (555) 987-6543</p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-4'>
                    <div className='bg-purple-100 p-3 rounded-lg'>
                      <svg
                        className='w-6 h-6 text-purple-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-800'>Address</h3>
                      <p className='text-gray-600'>123 Business Street</p>
                      <p className='text-gray-600'>Suite 100</p>
                      <p className='text-gray-600'>City, State 12345</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-xl font-semibold text-gray-900'>
                    Business Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-3'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Monday - Friday</span>
                      <span className='font-semibold text-gray-800'>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Saturday</span>
                      <span className='font-semibold text-gray-800'>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Sunday</span>
                      <span className='font-semibold text-gray-800'>Closed</span>
                    </div>
                  </div>
                  <div className='mt-4 p-3 bg-blue-50 rounded-lg'>
                    <p className='text-blue-800 text-sm'>
                      <strong>24/7 Support:</strong> Emergency support available outside business
                      hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className='mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>
                  Get in Touch by Department
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='text-center p-6 bg-blue-50 rounded-lg'>
                    <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-blue-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-800 mb-2'>Sales</h3>
                    <p className='text-gray-600 text-sm mb-3'>Get pricing and demos</p>
                    <Badge variant='default'>sales@bell24h.com</Badge>
                  </div>

                  <div className='text-center p-6 bg-green-50 rounded-lg'>
                    <div className='bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-green-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-800 mb-2'>Support</h3>
                    <p className='text-gray-600 text-sm mb-3'>Technical assistance</p>
                    <Badge variant='default'>support@bell24h.com</Badge>
                  </div>

                  <div className='text-center p-6 bg-purple-50 rounded-lg'>
                    <div className='bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-purple-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-800 mb-2'>Partnerships</h3>
                    <p className='text-gray-600 text-sm mb-3'>Business collaborations</p>
                    <Badge variant='default'>partners@bell24h.com</Badge>
                  </div>

                  <div className='text-center p-6 bg-orange-50 rounded-lg'>
                    <div className='bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-6 h-6 text-orange-600'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                        />
                      </svg>
                    </div>
                    <h3 className='font-semibold text-gray-800 mb-2'>Careers</h3>
                    <p className='text-gray-600 text-sm mb-3'>Join our team</p>
                    <Badge variant='default'>careers@bell24h.com</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='text-center'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>
                  Ready to Get Started?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-6'>
                  Experience the power of AI-driven B2B commerce with BELL24H.
                </p>
                <div className='space-x-4'>
                  <Button variant='default' size='lg'>
                    Start Free Trial
                  </Button>
                  <Button variant='outline' size='lg'>
                    Schedule Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
