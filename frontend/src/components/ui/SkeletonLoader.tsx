'use client'

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export default function SkeletonLoader({ 
  className = '', 
  count = 1 
}: SkeletonLoaderProps) {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  )
}
