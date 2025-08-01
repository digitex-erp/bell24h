'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>About BELL24H</h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Revolutionizing B2B commerce with AI-powered marketplace solutions
            </p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>
                  At BELL24H, we're committed to transforming the way businesses connect, trade, and
                  grow. Our AI-powered platform bridges the gap between buyers and suppliers,
                  creating a seamless ecosystem for global commerce.
                </p>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-3'>
                    <Badge variant='default'>Innovation</Badge>
                    <span className='text-gray-600'>Leading with cutting-edge AI technology</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Badge variant='default'>Trust</Badge>
                    <span className='text-gray-600'>Building secure, reliable partnerships</span>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <Badge variant='default'>Growth</Badge>
                    <span className='text-gray-600'>Empowering business success</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-4'>
                  We envision a world where every business, regardless of size or location, has
                  equal access to global markets and opportunities through intelligent, automated
                  solutions.
                </p>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h3 className='font-semibold text-blue-800 mb-2'>Key Goals:</h3>
                  <ul className='text-blue-700 text-sm space-y-1'>
                    <li>• Democratize access to global markets</li>
                    <li>• Reduce trade barriers and complexity</li>
                    <li>• Enable data-driven business decisions</li>
                    <li>• Foster sustainable business practices</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='text-center'>
                      <div className='bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-2xl font-bold text-blue-600'>2019</span>
                      </div>
                      <h3 className='font-semibold text-gray-800 mb-2'>Foundation</h3>
                      <p className='text-gray-600 text-sm'>
                        BELL24H was founded with a vision to revolutionize B2B commerce through
                        intelligent automation and AI-driven solutions.
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-2xl font-bold text-green-600'>2021</span>
                      </div>
                      <h3 className='font-semibold text-gray-800 mb-2'>Growth</h3>
                      <p className='text-gray-600 text-sm'>
                        Expanded to serve 50+ countries with over 100,000 registered businesses and
                        advanced AI capabilities.
                      </p>
                    </div>
                    <div className='text-center'>
                      <div className='bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'>
                        <span className='text-2xl font-bold text-purple-600'>2024</span>
                      </div>
                      <h3 className='font-semibold text-gray-800 mb-2'>Innovation</h3>
                      <p className='text-gray-600 text-sm'>
                        Leading the industry with voice-enabled RFQs, predictive analytics, and
                        comprehensive marketplace solutions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='text-center'>
                    <div className='bg-blue-50 p-4 rounded-lg mb-4'>
                      <h3 className='font-semibold text-blue-800 mb-2'>Innovation</h3>
                      <p className='text-blue-700 text-sm'>
                        Continuously pushing boundaries with cutting-edge technology
                      </p>
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='bg-green-50 p-4 rounded-lg mb-4'>
                      <h3 className='font-semibold text-green-800 mb-2'>Integrity</h3>
                      <p className='text-green-700 text-sm'>
                        Building trust through transparency and ethical business practices
                      </p>
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='bg-purple-50 p-4 rounded-lg mb-4'>
                      <h3 className='font-semibold text-purple-800 mb-2'>Excellence</h3>
                      <p className='text-purple-700 text-sm'>
                        Delivering exceptional value and service to our customers
                      </p>
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='bg-orange-50 p-4 rounded-lg mb-4'>
                      <h3 className='font-semibold text-orange-800 mb-2'>Collaboration</h3>
                      <p className='text-orange-700 text-sm'>
                        Fostering partnerships that drive mutual success
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='text-center'>
                    <div className='bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4'></div>
                    <h3 className='font-semibold text-gray-800 mb-1'>Sarah Johnson</h3>
                    <p className='text-gray-600 text-sm mb-2'>CEO & Founder</p>
                    <Badge variant='secondary'>Leadership</Badge>
                  </div>
                  <div className='text-center'>
                    <div className='bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4'></div>
                    <h3 className='font-semibold text-gray-800 mb-1'>Michael Chen</h3>
                    <p className='text-gray-600 text-sm mb-2'>CTO</p>
                    <Badge variant='secondary'>Technology</Badge>
                  </div>
                  <div className='text-center'>
                    <div className='bg-gray-200 w-24 h-24 rounded-full mx-auto mb-4'></div>
                    <h3 className='font-semibold text-gray-800 mb-1'>Emily Rodriguez</h3>
                    <p className='text-gray-600 text-sm mb-2'>Head of Product</p>
                    <Badge variant='secondary'>Product</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='mb-12'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>Our Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-blue-600 mb-2'>534,281+</div>
                    <p className='text-gray-600'>Active Users</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-green-600 mb-2'>50+</div>
                    <p className='text-gray-600'>Countries Served</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-purple-600 mb-2'>125,000+</div>
                    <p className='text-gray-600'>Successful Transactions</p>
                  </div>
                  <div className='text-center'>
                    <div className='text-3xl font-bold text-orange-600 mb-2'>98.5%</div>
                    <p className='text-gray-600'>Customer Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='text-center'>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-semibold text-gray-900'>
                  Join Our Journey
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-gray-600 mb-6'>
                  Ready to transform your business with AI-powered B2B commerce?
                </p>
                <div className='space-x-4'>
                  <Badge variant='default' className='text-lg px-6 py-3'>
                    Start Free Trial
                  </Badge>
                  <Badge variant='outline' className='text-lg px-6 py-3'>
                    Contact Sales
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
