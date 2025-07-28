'use client';

import React from 'react';

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-100 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-12">
          What Our Users Say
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow">
            <p className="text-gray-700 dark:text-gray-300 italic mb-4">
              "Bell24H has cut our procurement time by 50%. The real-time bidding feature is revolutionary."
            </p>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center text-white mr-4">
                JD
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  John Doe
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Procurement Manager
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-lg shadow">
            <p className="text-gray-700 dark:text-gray-300 italic mb-4">
              "I've doubled my business since joining Bell24H. The platform makes it easy to find new buyers."
            </p>
            <div className="flex items-center">
              <div className="h-12 w-12 bg-indigo-500 rounded-full flex items-center justify-center text-white mr-4">
                SM
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-semibold">
                  Sarah M.
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Supplier
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
