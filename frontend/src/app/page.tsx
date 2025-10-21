'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowPathIcon, ShieldCheckIcon, BanknotesIcon, ChartBarIcon, DocumentTextIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import CoverDesign from '@/components/home/CoverDesign'
import Features from '@/components/home/Features'
import Testimonials from '@/components/home/Testimonials'
import CallToAction from '@/components/home/CallToAction'
import Navbar from '@/components/navigation/Navbar'
import AnimatedElement from '@/components/ui/AnimatedElement'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import FAQ from '@/components/home/FAQ'
import BlogPreview from '@/components/home/BlogPreview'
import Partners from '@/components/home/Partners'
import { Suspense } from 'react'

const features = [
  {
    name: 'AI-Powered Matching',
    description: 'Get intelligent supplier recommendations with explainable AI insights.',
    icon: ArrowPathIcon,
  },
  {
    name: 'GST Compliance',
    description: 'Automatic GST validation and compliance checks for all suppliers.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Secure Escrow',
    description: 'RazorpayX-powered escrow system for safe transactions.',
    icon: BanknotesIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Real-time insights into your RFQs and supplier performance.',
    icon: ChartBarIcon,
  },
  {
    name: 'Invoice Discounting',
    description: 'Access working capital through M1 Exchange integration.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Verified Network',
    description: 'Connect with KYC-verified suppliers and buyers.',
    icon: UserGroupIcon,
  },
]

const stats = [
  { label: 'Active Users', value: '10,000+' },
  { label: 'Monthly RFQs', value: '50,000+' },
  { label: 'Supplier Network', value: '5,000+' },
  { label: 'Success Rate', value: '95%' },
]

const testimonials = [
  {
    content: "Bell24h has transformed how we handle RFQs. The AI matching is incredibly accurate.",
    author: "Rajesh Kumar",
    role: "Procurement Manager",
    company: "Tech Solutions Ltd"
  },
  {
    content: "The escrow system gives us confidence in every transaction. Highly recommended!",
    author: "Priya Sharma",
    role: "Supply Chain Director",
    company: "Manufacturing Plus"
  },
  {
    content: "Invoice discounting through M1 Exchange has helped us maintain healthy cash flow.",
    author: "Amit Patel",
    role: "Finance Head",
    company: "Industrial Supplies Co"
  }
]

export default function Home() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <CoverDesign />
      </Suspense>
      <AnimatedElement>
        <Features />
      </AnimatedElement>
      <AnimatedElement animation="slideUp">
        <Partners />
      </AnimatedElement>
      <AnimatedElement animation="fadeIn">
        <Testimonials />
      </AnimatedElement>
      <AnimatedElement animation="slideUp">
        <FAQ />
      </AnimatedElement>
      <AnimatedElement animation="fadeIn">
        <BlogPreview />
      </AnimatedElement>
      <AnimatedElement animation="fadeIn">
        <CallToAction />
      </AnimatedElement>
    </main>
  )
}
