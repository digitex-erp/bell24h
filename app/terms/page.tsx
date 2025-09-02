import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Bell24h',
  description: 'Bell24h terms of service and user agreement'
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Terms of Service
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> January 1, 2024
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 mb-4">
                  By accessing and using Bell24h's B2B marketplace platform ("Service"), you accept and agree
                  to be bound by the terms and provision of this agreement.
                </p>
                <p className="text-gray-600">
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-gray-600 mb-4">
                  Bell24h provides a B2B marketplace platform that connects buyers and suppliers for business
                  transactions. Our services include:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Supplier discovery and verification</li>
                  <li>Request for Quotation (RFQ) creation and management</li>
                  <li>Payment processing and escrow services</li>
                  <li>AI-powered matching and recommendations</li>
                  <li>Communication tools and transaction management</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

                <h3 className="text-lg font-semibold mb-3">3.1 Registration</h3>
                <p className="text-gray-600 mb-4">
                  To use our services, you must create an account and provide accurate, complete information.
                  You are responsible for maintaining the confidentiality of your account credentials.
                </p>

                <h3 className="text-lg font-semibold mb-3">3.2 Account Responsibilities</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide accurate and up-to-date information</li>
                  <li>Maintain the security of your password</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>Be responsible for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
                <p className="text-gray-600 mb-4">
                  You agree not to use the service for any unlawful purpose or any purpose prohibited under this clause.
                  You may not use the service in any manner that could damage, disable, overburden, or impair any server.
                </p>

                <h3 className="text-lg font-semibold mb-3">4.1 Prohibited Activities</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Posting false, misleading, or fraudulent information</li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Infringing on intellectual property rights</li>
                  <li>Spamming or sending unsolicited communications</li>
                  <li>Attempting to gain unauthorized access to the system</li>
                  <li>Interfering with other users' use of the service</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Transactions and Payments</h2>

                <h3 className="text-lg font-semibold mb-3">5.1 Transaction Terms</h3>
                <p className="text-gray-600 mb-4">
                  All transactions between buyers and suppliers are subject to their own terms and conditions.
                  Bell24h facilitates these transactions but is not a party to the actual business agreements.
                </p>

                <h3 className="text-lg font-semibold mb-3">5.2 Payment Processing</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>We provide secure payment processing services</li>
                  <li>Transaction fees may apply as disclosed</li>
                  <li>Refunds are subject to supplier policies</li>
                  <li>We reserve the right to hold funds for security purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-gray-600 mb-4">
                  The service and its original content, features, and functionality are owned by Bell24h and are
                  protected by international copyright, trademark, patent, trade secret, and other intellectual
                  property laws.
                </p>
                <p className="text-gray-600">
                  You retain ownership of content you post, but grant us a license to use, display, and distribute
                  such content in connection with the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Privacy and Data Protection</h2>
                <p className="text-gray-600">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use
                  of the service, to understand our practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>

                <h3 className="text-lg font-semibold mb-3">8.1 Service Availability</h3>
                <p className="text-gray-600 mb-4">
                  We strive to provide continuous service availability but cannot guarantee uninterrupted access.
                  The service is provided "as is" without warranties of any kind.
                </p>

                <h3 className="text-lg font-semibold mb-3">8.2 Limitation of Liability</h3>
                <p className="text-gray-600">
                  Bell24h shall not be liable for any indirect, incidental, special, consequential, or punitive
                  damages resulting from your use of the service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
                <p className="text-gray-600">
                  You agree to defend, indemnify, and hold harmless Bell24h and its officers, directors, employees,
                  and agents from any claims, damages, or expenses arising from your use of the service or violation
                  of these terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we
                  believe violates these terms or is harmful to other users, us, or third parties.
                </p>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting our support team.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
                <p className="text-gray-600">
                  These terms shall be governed by and construed in accordance with the laws of India.
                  Any disputes arising from these terms shall be subject to the exclusive jurisdiction
                  of the courts in Gurgaon, Haryana.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Changes to Terms</h2>
                <p className="text-gray-600">
                  We reserve the right to modify these terms at any time. We will notify users of any material
                  changes via email or through the service. Continued use of the service after such modifications
                  constitutes acceptance of the updated terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> legal@bell24h.com<br />
                    <strong>Phone:</strong> +91 11 1234 5678<br />
                    <strong>Address:</strong> Bell24h Technologies Pvt. Ltd., Tech Park, Sector 5, Gurgaon, Haryana 122001, India
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
