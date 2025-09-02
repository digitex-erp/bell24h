import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Bell24h',
  description: 'Bell24h privacy policy and data protection'
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Privacy Policy
        </h1>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> January 1, 2024
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-4">
                  Bell24h Technologies Pvt. Ltd. ("we," "our," or "us") is committed to protecting your privacy.
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you use our B2B marketplace platform.
                </p>
                <p className="text-gray-600">
                  By using our services, you agree to the collection and use of information in accordance with
                  this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

                <h3 className="text-lg font-semibold mb-3">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Name, email address, phone number</li>
                  <li>Company information and business details</li>
                  <li>Payment and billing information</li>
                  <li>Profile pictures and business documents</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">2.2 Usage Information</h3>
                <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                  <li>Pages visited and features used</li>
                  <li>Search queries and preferences</li>
                  <li>Transaction history and RFQ data</li>
                  <li>Device information and IP address</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">2.3 Cookies and Tracking</h3>
                <p className="text-gray-600">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns,
                  and provide personalized content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Provide and maintain our B2B marketplace services</li>
                  <li>Process transactions and facilitate payments</li>
                  <li>Match buyers with relevant suppliers</li>
                  <li>Send important updates and notifications</li>
                  <li>Improve our platform and develop new features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
                <p className="text-gray-600 mb-4">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>With suppliers/buyers as part of the B2B matching process</li>
                  <li>With payment processors for transaction processing</li>
                  <li>With service providers who assist in our operations</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In case of business transfers or mergers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
                <p className="text-gray-600 mb-4">
                  We implement appropriate security measures to protect your information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>End-to-end encryption for sensitive data</li>
                  <li>Secure servers and regular security audits</li>
                  <li>Access controls and authentication systems</li>
                  <li>Regular staff training on data protection</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                <p className="text-gray-600 mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Access and review your personal data</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your account and data</li>
                  <li>Opt-out of marketing communications</li>
                  <li>Data portability and transfer</li>
                  <li>Withdraw consent for data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-gray-600">
                  We retain your personal information for as long as necessary to provide our services,
                  comply with legal obligations, resolve disputes, and enforce our agreements.
                  Inactive accounts may be deleted after 3 years of inactivity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
                <p className="text-gray-600">
                  Your information may be transferred to and processed in countries other than your own.
                  We ensure appropriate safeguards are in place to protect your data during such transfers.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                <p className="text-gray-600">
                  Our services are not intended for individuals under 18 years of age.
                  We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                <p className="text-gray-600">
                  We may update this Privacy Policy from time to time. We will notify you of any changes
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">
                    <strong>Email:</strong> privacy@bell24h.com<br />
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
