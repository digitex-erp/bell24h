import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/">
              <a className="text-2xl font-bold text-primary-600">Bell24h</a>
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              AI-Powered RFQ Marketplace connecting buyers with the perfect suppliers.
              Our platform uses advanced AI to match RFQs based on price, delivery time,
              past performance, and GST compliance.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              For Buyers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/how-it-works/buyers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    How It Works
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/rfq/create">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Post an RFQ
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing/buyers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resources/buyers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Resources
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
              For Suppliers
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/how-it-works/suppliers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    How It Works
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/auth/register">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Join as Supplier
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/pricing/suppliers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Pricing
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/resources/suppliers">
                  <a className="text-base text-gray-500 hover:text-gray-900">
                    Resources
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Bell24h. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
