// components/Footer.tsx - Footer with legal links for Razorpay compliance
'use client';

import Link from 'next/link';
import { Bell, Mail, Phone, MapPin, Shield, FileText, CreditCard, Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Bell24h</span>
            </div>
            <p className="text-gray-300 mb-4">
              India's leading B2B marketplace connecting verified suppliers with buyers for secure and efficient business transactions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>digitex.studio@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+91 9004962871</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/suppliers" className="text-gray-300 hover:text-white transition-colors">
                  Browse Suppliers
                </Link>
              </li>
              <li>
                <Link href="/rfq" className="text-gray-300 hover:text-white transition-colors">
                  Post RFQ
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal & Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy-policy" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-service" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/cancellation-refund-policy" className="text-gray-300 hover:text-white transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/escrow-terms" className="text-gray-300 hover:text-white transition-colors">
                  Escrow Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/wallet-terms" className="text-gray-300 hover:text-white transition-colors">
                  Wallet Terms
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Additional Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Additional Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/shipping-policy" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/pricing-policy" className="text-gray-300 hover:text-white transition-colors">
                  Pricing Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/aml-policy" className="text-gray-300 hover:text-white transition-colors">
                  AML Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/escrow-services" className="text-gray-300 hover:text-white transition-colors">
                  Escrow Services
                </Link>
              </li>
              <li>
                <Link href="/upload-invoice" className="text-gray-300 hover:text-white transition-colors">
                  Upload Invoice
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 Bell24h Technologies Pvt Ltd. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
              <Link href="/legal/privacy-policy" className="text-gray-300 hover:text-white text-sm transition-colors" rel="noopener">
                Privacy Policy
              </Link>
              <Link href="/legal/terms-of-service" className="text-gray-300 hover:text-white text-sm transition-colors" rel="noopener">
                Terms of Service
              </Link>
              <Link href="/legal/cancellation-refund-policy" className="text-gray-300 hover:text-white text-sm transition-colors" rel="noopener">
                Refund Policy
              </Link>
              <Link href="/legal/escrow-terms" className="text-gray-300 hover:text-white text-sm transition-colors" rel="noopener">
                Escrow Terms
              </Link>
              <Link href="/sitemap.xml" className="text-gray-300 hover:text-white text-sm transition-colors" rel="noopener">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
