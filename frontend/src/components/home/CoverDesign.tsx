'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRef } from 'react'

export default function CoverDesign() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])

  return (
    <motion.div 
      ref={containerRef}
      style={{ opacity }}
      className="relative min-h-[90vh] md:min-h-screen overflow-hidden"
    >
      {/* Background */}
      <motion.div 
        className="absolute inset-0 hero-gradient"
        style={{ scale }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
      </motion.div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute glass-card w-16 md:w-24 h-16 md:h-24 rounded-xl"
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 0.5,
              scale: 1,
              x: Math.random() * 100 - 50,
              y: Math.random() * 100 - 50,
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative pt-16 md:pt-24 lg:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-4xl text-center"
            style={{ y }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight text-white">
              India's First AI-Powered
              <span className="text-yellow-300"> RFQ Marketplace</span>
            </h1>
            <p className="mt-4 md:mt-6 text-base md:text-lg leading-7 md:leading-8 text-gray-200 px-4">
              Connect with verified suppliers, get AI-powered matches, and secure your transactions with GST compliance.
            </p>
            <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-x-6">
              <Link
                href="/auth"
                className="w-full md:w-auto btn btn-primary text-base font-semibold leading-7 bg-white text-indigo-600 hover:bg-gray-50 hover:text-indigo-500"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="w-full md:w-auto text-base font-semibold leading-7 text-white hover:text-yellow-300 text-center"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-12 md:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {[
              { value: '10,000+', label: 'Active Users' },
              { value: '₹50Cr+', label: 'Monthly RFQ Volume' },
              { value: '98%', label: 'Success Rate' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 md:p-8"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <dt className="text-sm md:text-base leading-6 md:leading-7 text-gray-300">{stat.label}</dt>
                <dd className="text-2xl md:text-3xl font-semibold tracking-tight text-white mt-2">
                  {stat.value}
                </dd>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Wave Effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 md:h-24 fill-current text-background"
          viewBox="0 0 1440 74"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0,37 C240,74 480,74 720,37 C960,0 1200,0 1440,37 L1440,74 L0,74 Z" />
        </svg>
      </div>
    </motion.div>
  )
}
