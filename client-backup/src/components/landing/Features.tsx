'use client';

import { GlobeAltIcon, ScaleIcon, BoltIcon, ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';

const features = [
  {
    name: 'Unified Dashboard',
    description:
      'Get a 360-degree view of your business with all your data, tasks, and communication in one place. Make informed decisions faster.',
    icon: GlobeAltIcon,
  },
  {
    name: 'Seamless Integrations',
    description:
      'Connect Bell24H with your favorite tools. Our platform works with hundreds of popular apps to automate your workflows.',
    icon: ScaleIcon,
  },
  {
    name: 'Real-time Collaboration',
    description:
      'Empower your team to work together effortlessly. Share files, manage projects, and communicate in real-time, from anywhere.',
    icon: BoltIcon,
  },
  {
    name: 'Advanced Analytics',
    description:
      'Turn your data into actionable insights. Track key metrics, visualize trends, and understand your business performance like never before.',
    icon: ChatBubbleOvalLeftEllipsisIcon,
  },
];

export function Features() {
  return (
    <div className="py-24 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Everything You Need</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            A better way to manage your business
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 lg:mx-auto">
            Bell24H provides a comprehensive suite of tools designed to help you operate more efficiently and effectively.
          </p>
        </div>

        <div className="mt-20">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500 dark:text-gray-400">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
