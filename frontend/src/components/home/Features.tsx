'use client'

import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import {
  ArrowPathIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'AI-Powered Matching',
    description: 'Our advanced AI algorithms match your RFQs with the most suitable suppliers based on multiple parameters.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Secure Escrow',
    description: 'Protect your transactions with our secure escrow system. Money is released only after order fulfillment.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'GST Compliant',
    description: 'All transactions are GST compliant with automatic invoice generation and tax calculations.',
    icon: BanknotesIcon,
  },
  {
    name: 'Analytics Dashboard',
    description: 'Track your RFQs, analyze supplier performance, and make data-driven decisions.',
    icon: ChartBarIcon,
  },
  {
    name: 'Smart Contracts',
    description: 'Automated contract generation with customizable templates and digital signatures.',
    icon: DocumentTextIcon,
  },
  {
    name: 'Verified Network',
    description: 'Access our network of verified suppliers and buyers with detailed performance history.',
    icon: UserGroupIcon,
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
}

const iconVariants = {
  hidden: { 
    scale: 0,
    rotate: -180
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20
    }
  }
}

export default function Features() {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to streamline your RFQ process
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Powerful features to help you find the right suppliers and manage transactions securely.
            </p>
          </motion.div>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              variants={itemVariants}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
            >
              <div className="feature-card group">
                <motion.div
                  className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors duration-200"
                  variants={iconVariants}
                >
                  <feature.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </motion.div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.name}
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
