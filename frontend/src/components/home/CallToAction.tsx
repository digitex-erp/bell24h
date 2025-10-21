'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

export default function CallToAction() {
  return (
    <section className="relative">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700 opacity-90" />
      
      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Ready to transform your procurement?
          </h2>
          <p className="mt-6 text-xl leading-8 text-gray-100">
            Join Bell24h today and experience the future of B2B marketplace with AI-powered matching, secure transactions, and seamless GST compliance.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="btn btn-primary bg-white text-indigo-600 hover:bg-gray-50 hover:text-indigo-500"
            >
              Get Started
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="btn btn-outline text-white border-white hover:bg-white/10"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          {[
            { label: 'Active Users', value: '10,000+' },
            { label: 'Monthly RFQs', value: '50,000+' },
            { label: 'Transaction Volume', value: '₹100Cr+' },
            { label: 'Supplier Network', value: '5,000+' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card p-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
            >
              <dt className="text-base font-medium text-gray-100">{stat.label}</dt>
              <dd className="mt-2 text-3xl font-bold tracking-tight text-white">
                {stat.value}
              </dd>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          className="mt-16 flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {['ISO Certified', 'DPIIT Registered', 'GST Compliant', 'Secure Payments'].map((badge) => (
            <div
              key={badge}
              className="flex items-center space-x-2 glass-card px-4 py-2"
            >
              <div className="h-2 w-2 rounded-full bg-green-400" />
              <span className="text-sm font-medium text-white">{badge}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
