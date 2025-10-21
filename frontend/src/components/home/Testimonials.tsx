'use client'

import { motion } from 'framer-motion'
import { StarIcon } from '@heroicons/react/24/solid'

const testimonials = [
  {
    content: "Bell24h's AI matching system has revolutionized how we find suppliers. We've reduced our sourcing time by 60% and found better quality vendors.",
    author: "Rajesh Kumar",
    role: "Procurement Head",
    company: "Tech Solutions India",
    rating: 5
  },
  {
    content: "The escrow system gives us complete peace of mind. We no longer worry about payment security or delivery guarantees.",
    author: "Priya Sharma",
    role: "Finance Director",
    company: "Global Traders Ltd",
    rating: 5
  },
  {
    content: "GST compliance was a major concern for us. Bell24h handles everything automatically - from invoicing to tax calculations.",
    author: "Amit Patel",
    role: "CEO",
    company: "Innovative Exports",
    rating: 5
  }
]

export default function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Trusted by industry leaders
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            See what our customers have to say about Bell24h
          </p>
        </motion.div>

        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.author}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <div className="testimonial-card">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                  <div className="mt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {testimonial.author[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {testimonial.author}
                        </p>
                        <div className="flex space-x-1 text-sm text-gray-500">
                          <p>{testimonial.role}</p>
                          <span>&middot;</span>
                          <p>{testimonial.company}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <p className="text-base text-gray-600">
            Join hundreds of satisfied businesses using Bell24h
          </p>
          <div className="mt-8 flex justify-center space-x-6 opacity-50">
            {['Company A', 'Company B', 'Company C', 'Company D'].map((company) => (
              <div
                key={company}
                className="h-8 w-32 bg-gray-400 rounded animate-pulse"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
