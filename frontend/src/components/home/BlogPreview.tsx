'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRightIcon } from '@heroicons/react/24/outline'
import AnimatedElement from '../ui/AnimatedElement'

const posts = [
  {
    title: 'Revolutionizing B2B Procurement with AI',
    description: 'Learn how artificial intelligence is transforming the way businesses handle RFQs and supplier matching.',
    image: '/blog/ai-procurement.jpg',
    date: '2025-03-28',
    readTime: '5 min read',
    category: 'Technology'
  },
  {
    title: 'GST Compliance Made Simple',
    description: 'A comprehensive guide to managing GST compliance in your procurement process with Bell24h.',
    image: '/blog/gst-guide.jpg',
    date: '2025-03-25',
    readTime: '4 min read',
    category: 'Finance'
  },
  {
    title: 'Building Trust in B2B Transactions',
    description: 'How escrow systems and verification processes are creating a safer B2B marketplace.',
    image: '/blog/trust-b2b.jpg',
    date: '2025-03-22',
    readTime: '6 min read',
    category: 'Business'
  }
]

export default function BlogPreview() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement>
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Latest Insights
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Stay updated with the latest trends and best practices in B2B procurement
            </p>
          </div>
        </AnimatedElement>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <AnimatedElement
              key={index}
              animation="slideUp"
              delay={index * 0.1}
            >
              <article className="flex flex-col overflow-hidden rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl">
                <div className="flex-shrink-0">
                  <div className="h-48 w-full bg-gray-200 animate-pulse" />
                </div>
                <div className="flex flex-1 flex-col justify-between bg-white p-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-indigo-600">
                      {post.category}
                    </p>
                    <div className="mt-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-base text-gray-500">
                        {post.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-600">
                        <span className="sr-only">Author</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="flex space-x-1 text-sm text-gray-500">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </time>
                        <span aria-hidden="true">&middot;</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            </AnimatedElement>
          ))}
        </div>

        <AnimatedElement animation="fadeIn" delay={0.4}>
          <div className="mt-12 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
            >
              View all posts
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </AnimatedElement>
      </div>
    </section>
  )
}
