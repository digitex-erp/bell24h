'use client';

import Link from 'next/link';

type FooterLink = {
  title: string;
  links: { name: string; href: string }[];
};

const footerLinks: FooterLink[] = [
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Press', href: '/press' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'Partners', href: '/partners' },
      { name: 'Developers', href: '/developers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR', href: '/gdpr' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { name: 'support@bell24h.com', href: 'mailto:support@bell24h.com' },
      { name: '+1 (555) 123-4567', href: 'tel:+15551234567' },
      { name: '123 Business Ave, Suite 100', href: '#' },
      { name: 'San Francisco, CA 94107', href: '#' },
    ],
  },
];

const socialLinks = [
  {name:'twitter', path: 'M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z'},
  {name:'facebook', path: 'M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15h-2v-3h2V9.5c0-1.62 1.15-2.83 2.8-2.83.71 0 1.49.13 1.49.13V8.5h-1.09c-.84 0-1.16.52-1.16 1.26V12h2.58l-.34 3H13v6.79C17.56 20.87 22 16.84 22 12z'},
  {name:'linkedin', path: 'M20.447 20.452h-3.554v-5.563c0-1.309-.46-2.197-1.636-2.197-1.309 0-2.073.992-2.073 2.197v5.563h-3.554V9.692h3.554V11.23c.523-.938 1.42-1.791 3.253-1.791 2.473 0 4.306 1.627 4.306 5.088v5.925zM7.559 7.766c-.004-.84-.683-1.521-1.522-1.521-.84 0-1.52.682-1.52 1.521 0 .84.682 1.523 1.522 1.523.84-.001 1.522-.684 1.522-1.523zm-1.776 12.686H4.223V9.692h3.56V20.452h-.002zM22.227 0H1.771C.792 0 0 .792 0 1.771v20.456C0 23.209.792 24 1.771 24h20.456C23.208 24 24 23.208 24 22.229V1.771C24 .792 23.208 0 22.227 0z'},
  {name:'instagram', path: 'M12 2.163c3.167 0 3.533.013 4.792.068 1.147.05 1.772.235 2.222.404.492.186.855.437 1.227.809.372.372.623.735.809 1.227.169.45.354 1.075.404 2.222.055 1.26.068 1.625.068 4.792s-.013 3.533-.068 4.792c-.05 1.147-.235 1.772-.404 2.222-.186.492-.437.855-.809 1.227-.372-.372-.735-.623-1.227.809-.45.169-1.075.354-2.222.404-1.26.055-1.625.068-4.792.068s-3.533-.013-4.792-.068c-1.147-.05-1.772-.235-2.222-.404-.492-.186-.855-.437-1.227-.809-.372-.372-.623-.735-.809-1.227-.169-.45-.354-1.075-.404-2.222-.055 1.26-.068 1.625-.068 4.792s.013-3.533.068-4.792c.05-1.147.235-1.772.404 2.222.186-.492.437-.855.809-1.227.372-.372.735-.623.809-1.227.45-.169 1.075-.354 2.222-.404C8.467 2.176 8.833 2.163 12 2.163zm0-2.163C8.743 0 8.368.013 7.108.068 5.959.118 5.244.303 4.542.571 3.784.86 3.125 1.272 2.502 1.896.938 3.46.013 5.438.068 7.108.118 8.368.163 8.743.163 12s-.013 3.533-.068 4.792c-.05 1.147-.235 1.772-.404 2.222-.186.492-.437.855-.809 1.227-.372-.372-.735-.623-.809 1.227-.169.45-.354 1.075-.404 2.222-.055 1.26-.068 1.625-.068 4.792s.013-3.533.068-4.792c.05-1.147.235-1.772.404 2.222.186-.492.437-.855.809-1.227.372-.372-.735-.623-.809-1.227-.169.45-.354 1.075-.404 2.222-.055 1.26-.068 1.625-.068 4.792s-.013-3.533-.068-4.792c-.05-1.147-.235-1.772-.404-2.222-.186-.492-.437-.855-.809-1.227-.372-.372-.735-.623-.809-1.227-.45-.169-1.075-.354-2.222-.404C15.533 0 15.167.013 12 0zM12 7.51a4.49 4.49 0 100 8.98 4.49 4.49 0 000-8.98zm0 7.31c-1.55 0-2.802-1.253-2.802-2.802S10.45 9.208 12 9.208s2.802 1.253 2.802 2.802-1.253 2.802-2.802 2.802zm5.725-8.497c-.82 0-1.482.663-1.482 1.482s.663 1.482 1.482 1.482 1.482-.663 1.482-1.482-.663-1.482-1.482-1.482z'},
];

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">Bell24H</h3>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Connecting businesses worldwide through our secure and efficient B2B marketplace platform.
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={`https://${social.name}.com/bell24h`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={`${social.name} link`}
                >
                  <span className="sr-only">{social.name}</span>
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((column) => (
            <div key={column.title}>
              <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">
                {column.title}
              </h4>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Bell24H. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}; 