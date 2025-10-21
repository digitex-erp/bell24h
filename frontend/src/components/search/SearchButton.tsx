'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import SearchModal from './SearchModal'

interface SearchButtonProps {
  className?: string
  isScrolled?: boolean
}

export default function SearchButton({ className = '', isScrolled = false }: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsSearchOpen(true)}
        className={`group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
          isScrolled
            ? 'text-gray-700 hover:text-gray-900'
            : 'text-gray-200 hover:text-white'
        } ${className}`}
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-gray-400/50 bg-gray-400/10 px-1.5 font-mono text-xs">
          <abbr title="Command" className="no-underline">
            ⌘
          </abbr>
          K
        </kbd>
      </button>

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}
