'use client';

import Link from 'next/link';

const Logo = () => (
  <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
    Bell24H
  </Link>
);

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-gray-500 hover:text-gray-900 transition-colors text-sm">
    {children}
  </Link>
);

export function Footer() {
  const sections = [
    {
      title: 'Product',
      links: [
        { href: '/features', label: 'Features' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/integrations', label: 'Integrations' },
        { href: '/changelog', label: 'Changelog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press' },
        { href: '/contact', label: 'Contact' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { href: '/blog', label: 'Blog' },
        { href: '/help-center', label: 'Help Center' },
        { href: '/api-docs', label: 'API Docs' },
        { href: '/status', label: 'Status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { href: '/terms', label: 'Terms of Service' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/cookies', label: 'Cookie Policy' },
      ],
    },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
                <Logo />
            </div>
            <p className="mt-8 md:mt-0 text-sm text-gray-500 md:order-1">
                &copy; {new Date().getFullYear()} Bell24H, Inc. All rights reserved.
            </p>
        </div>
      </div>
    </footer>
  );
}
