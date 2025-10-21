'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import AnimatedElement from '../ui/AnimatedElement'

const faqs = [
  {
    question: "How does Bell24h's AI matching work?",
    answer: "Our AI algorithm analyzes multiple parameters including supplier history, performance metrics, pricing patterns, and delivery reliability to find the best matches for your RFQs. The system continuously learns from successful transactions to improve match quality."
  },
  {
    question: "Is the platform GST compliant?",
    answer: "Yes, Bell24h is fully GST compliant. We automatically generate GST-compliant invoices, handle tax calculations, and maintain proper documentation for all transactions on the platform."
  },
  {
    question: "How secure is the escrow system?",
    answer: "Our escrow system is bank-grade secure. Funds are held in dedicated escrow accounts and only released when both parties confirm successful delivery. We use advanced encryption and follow strict security protocols."
  },
  {
    question: "What happens if there's a dispute?",
    answer: "We have a structured dispute resolution process. Our team mediates between parties, reviews evidence, and ensures fair resolution. The escrow system protects both parties during the dispute process."
  },
  {
    question: "How do you verify suppliers?",
    answer: "Suppliers undergo a rigorous verification process including document verification, business registration checks, GST validation, and performance history review. We also collect and verify bank details and contact information."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Have more questions? {' '}
              <a href="/contact" className="text-indigo-600 hover:text-indigo-500">
                Contact our support team
              </a>
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-16 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <AnimatedElement
              key={index}
              animation="slideUp"
              delay={index * 0.1}
            >
              <div className="mb-4">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center p-6 text-left bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <span className="text-lg font-medium text-gray-900">
                    {faq.question}
                  </span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 bg-white border-t border-gray-100">
                        <p className="text-gray-600">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  )
}
