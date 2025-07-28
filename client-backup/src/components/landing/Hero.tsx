'use client';

import { MaterialButton } from '@/components/ui/MaterialButton';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="grid max-w-screen-xl px-4 py-8 mx-auto lg:gap-8 xl:gap-0 lg:py-16 lg:grid-cols-12">
        <div className="mr-auto place-self-center lg:col-span-7">
          <h1 className="max-w-2xl mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl xl:text-6xl dark:text-white">The Future of Business Management is Here</h1>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">Streamline your operations, boost productivity, and drive growth with Bell24H. Our all-in-one platform simplifies complexity so you can focus on what matters most.</p>
          <p className="max-w-2xl mb-6 font-light text-gray-500 lg:mb-8 md:text-lg lg:text-xl dark:text-gray-400">
            Go to <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">/signup</Link> to create a new account. You will be redirected to <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">/login</Link>. Sign in with the credentials you just created. You can also use the default test user: <strong>Email:</strong> <code>user@example.com</code>, <strong>Password:</strong> <code>password</code>.
          </p>
          <MaterialButton href="/signup" variant="filled" className="mr-4 !py-3 !px-5">
            Get Started for Free
          </MaterialButton>
          <MaterialButton href="/contact-sales" variant="outlined" className="!py-3 !px-5">
            Talk to Sales
          </MaterialButton>
        </div>
        <div className="hidden lg:mt-0 lg:col-span-5 lg:flex">
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400 text-lg">Illustration / App Screenshot</span>
          </div>
        </div>
      </div>
    </section>
  );
}
