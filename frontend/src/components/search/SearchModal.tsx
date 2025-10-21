'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Combobox, Transition } from '@headlessui/react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

// Mock data for search results
const mockResults = {
  suppliers: [
    { id: 1, name: 'TechCorp India', category: 'Electronics', rating: 4.8 },
    { id: 2, name: 'Global Manufacturing', category: 'Industrial', rating: 4.9 },
    { id: 3, name: 'Smart Solutions', category: 'Technology', rating: 4.7 },
  ],
  rfqs: [
    { id: 1, title: 'PCB Components', category: 'Electronics', status: 'Active' },
    { id: 2, title: 'Industrial Motors', category: 'Machinery', status: 'Active' },
    { id: 3, title: 'Network Equipment', category: 'IT', status: 'Active' },
  ],
  articles: [
    { id: 1, title: 'Procurement Best Practices', category: 'Guide' },
    { id: 2, title: 'GST Compliance Updates', category: 'Updates' },
    { id: 3, title: 'Supply Chain Innovation', category: 'Insights' },
  ],
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Filter results based on query and category
  const filteredResults = {
    suppliers: mockResults.suppliers.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    ),
    rfqs: mockResults.rfqs.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ),
    articles: mockResults.articles.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    ),
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        if (!isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Dialog.Overlay className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox
            onChange={(item: any) => {
              // Handle item selection
              console.log('Selected:', item)
              onClose()
            }}
            className="mx-auto max-w-3xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all"
          >
            <div className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
              <Combobox.Input
                className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search suppliers, RFQs, articles..."
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="absolute right-3 top-3.5 space-x-3">
                <kbd className="inline-flex items-center rounded border border-gray-200 px-2 text-xs text-gray-400">
                  esc
                </kbd>
              </div>
            </div>

            {query === '' && (
              <div className="px-6 py-14 text-center text-sm sm:px-14">
                <MagnifyingGlassIcon
                  className="mx-auto h-6 w-6 text-gray-400"
                  aria-hidden="true"
                />
                <p className="mt-4 text-gray-900">
                  Search for suppliers, RFQs, articles and more...
                </p>
                <p className="mt-2 text-gray-500">
                  Use keyboard shortcuts: <kbd className="font-sans">⌘</kbd> +{' '}
                  <kbd className="font-sans">K</kbd> to search
                </p>
              </div>
            )}

            {query !== '' && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="max-h-96 scroll-py-3 overflow-y-auto p-3"
                >
                  {/* Filter tabs */}
                  <div className="mb-4 flex space-x-2">
                    {['all', 'suppliers', 'rfqs', 'articles'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                          selectedCategory === category
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Results */}
                  {(selectedCategory === 'all' || selectedCategory === 'suppliers') && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 mb-2">Suppliers</h3>
                      {filteredResults.suppliers.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item}
                          className={({ active }) =>
                            `flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                              active ? 'bg-indigo-50' : ''
                            }`
                          }
                        >
                          <div>
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.category} • Rating: {item.rating}
                            </div>
                          </div>
                        </Combobox.Option>
                      ))}
                    </div>
                  )}

                  {(selectedCategory === 'all' || selectedCategory === 'rfqs') && (
                    <div className="mb-4">
                      <h3 className="text-xs font-semibold text-gray-500 mb-2">RFQs</h3>
                      {filteredResults.rfqs.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item}
                          className={({ active }) =>
                            `flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                              active ? 'bg-indigo-50' : ''
                            }`
                          }
                        >
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">
                              {item.category} • {item.status}
                            </div>
                          </div>
                        </Combobox.Option>
                      ))}
                    </div>
                  )}

                  {(selectedCategory === 'all' || selectedCategory === 'articles') && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 mb-2">Articles</h3>
                      {filteredResults.articles.map((item) => (
                        <Combobox.Option
                          key={item.id}
                          value={item}
                          className={({ active }) =>
                            `flex items-center px-4 py-3 rounded-lg cursor-pointer ${
                              active ? 'bg-indigo-50' : ''
                            }`
                          }
                        >
                          <div>
                            <div className="font-medium text-gray-900">{item.title}</div>
                            <div className="text-sm text-gray-500">{item.category}</div>
                          </div>
                        </Combobox.Option>
                      ))}
                    </div>
                  )}

                  {Object.values(filteredResults).every((arr) => arr.length === 0) && (
                    <div className="py-14 px-6 text-center text-sm sm:px-14">
                      <p className="text-gray-900">No results found</p>
                      <p className="mt-2 text-gray-500">
                        Try adjusting your search query
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </Combobox>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  )
}
