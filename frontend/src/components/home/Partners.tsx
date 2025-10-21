'use client'

import { motion } from 'framer-motion'
import AnimatedElement from '../ui/AnimatedElement'

const partners = [
  {
    name: 'TechCorp India',
    logo: '/logos/techcorp.svg',
    category: 'Technology'
  },
  {
    name: 'Global Manufacturing Ltd',
    logo: '/logos/global-mfg.svg',
    category: 'Manufacturing'
  },
  {
    name: 'Innovative Solutions',
    logo: '/logos/innovative.svg',
    category: 'Services'
  },
  {
    name: 'Prime Industries',
    logo: '/logos/prime.svg',
    category: 'Industrial'
  },
  {
    name: 'Future Electronics',
    logo: '/logos/future.svg',
    category: 'Electronics'
  },
  {
    name: 'Smart Logistics',
    logo: '/logos/smart.svg',
    category: 'Logistics'
  }
]

export default function Partners() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Industry Leaders
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of businesses that trust Bell24h for their procurement needs
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
            {partners.map((partner, index) => (
              <AnimatedElement
                key={partner.name}
                animation="scaleIn"
                delay={index * 0.1}
              >
                <div className="col-span-1 flex justify-center">
                  <motion.div
                    className="group relative h-24 w-full filter grayscale transition-all duration-200 hover:grayscale-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    {/* Placeholder for logo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                    </div>
                    {/* Overlay with name */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {partner.name}
                        </p>
                        <p className="text-xs text-gray-500">{partner.category}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: 'Active Partners', value: '500+' },
            { label: 'Countries', value: '10+' },
            { label: 'Industries', value: '25+' },
            { label: 'Success Rate', value: '98%' }
          ].map((stat, index) => (
            <AnimatedElement
              key={stat.label}
              animation="fadeIn"
              delay={index * 0.1 + 0.4}
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-base text-gray-600">{stat.label}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  )
}
