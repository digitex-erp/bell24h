'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                B
              </div>
              <div>
                <div className="font-bold text-xl">Bell24h</div>
                <div className="text-sm text-neutral-400">Enterprise B2B</div>
              </div>
            </div>
            <p className="text-neutral-300 mb-6 leading-relaxed">
              India's leading AI-powered B2B marketplace connecting verified suppliers and buyers with advanced matching technology and secure escrow payments.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                <span className="text-lg">🐦</span>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                <span className="text-lg">💼</span>
              </a>
              <a href="#" className="w-10 h-10 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                <span className="text-lg">📺</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-neutral-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/marketplace" className="text-neutral-300 hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link href="/suppliers" className="text-neutral-300 hover:text-white transition-colors">Suppliers</Link></li>
              <li><Link href="/rfq/create" className="text-neutral-300 hover:text-white transition-colors">Post RFQ</Link></li>
              <li><Link href="/pricing" className="text-neutral-300 hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-neutral-300 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services/verification" className="text-neutral-300 hover:text-white transition-colors">Supplier Verification</Link></li>
              <li><Link href="/services/escrow" className="text-neutral-300 hover:text-white transition-colors">Escrow Services</Link></li>
              <li><Link href="/services/logistics" className="text-neutral-300 hover:text-white transition-colors">Logistics</Link></li>
              <li><Link href="/services/rfq-writing" className="text-neutral-300 hover:text-white transition-colors">RFQ Writing</Link></li>
              <li><Link href="/services/trade-assurance" className="text-neutral-300 hover:text-white transition-colors">Trade Assurance</Link></li>
              <li><Link href="/fintech" className="text-neutral-300 hover:text-white transition-colors">Fintech Solutions</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/help" className="text-neutral-300 hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/help/faq" className="text-neutral-300 hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-neutral-300 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/help/how-to-buy" className="text-neutral-300 hover:text-white transition-colors">How to Buy</Link></li>
              <li><Link href="/help/how-to-sell" className="text-neutral-300 hover:text-white transition-colors">How to Sell</Link></li>
              <li><Link href="/report-issue" className="text-neutral-300 hover:text-white transition-colors">Report Issue</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold mb-4">Stay Updated</h3>
            <p className="text-neutral-300 mb-6">Get the latest B2B insights and marketplace updates delivered to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-primary px-6 py-3">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-neutral-400 text-sm">
              © 2024 Bell24h. All rights reserved. | Made in India 🇮🇳
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">Terms of Service</Link>
              <Link href="/refund-policy" className="text-neutral-400 hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}