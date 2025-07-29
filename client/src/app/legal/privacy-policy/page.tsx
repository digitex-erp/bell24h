'use client';
import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Printer,
  CheckCircle,
  AlertTriangle,
  Database,
  User,
  Globe,
  FileText
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [showFullPolicy, setShowFullPolicy] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const policySections = [
    {
      title: "1. INFORMATION WE COLLECT",
      content: `
        1.1. Personal Information:
        • Name, email address, phone number
        • Date of birth, gender, address
        • PAN number, Aadhaar number (for KYC)
        • Bank account details (for wallet operations)
        • Company information (for business accounts)
        
        1.2. Financial Information:
        • Transaction history and patterns
        • Wallet balance and usage data
        • Payment method preferences
        • Risk assessment data
        
        1.3. Technical Information:
        • IP address and device information
        • Browser type and version
        • Operating system and platform
        • Usage patterns and preferences
      `
    },
    {
      title: "2. HOW WE USE YOUR INFORMATION",
      content: `
        2.1. Service Provision:
        • Process wallet transactions and payments
        • Provide customer support and assistance
        • Send transaction notifications and updates
        • Manage your account and preferences
        
        2.2. Compliance and Security:
        • Verify your identity (KYC requirements)
        • Prevent fraud and money laundering
        • Comply with RBI regulations
        • Maintain security and prevent abuse
        
        2.3. Business Operations:
        • Improve our services and user experience
        • Conduct analytics and research
        • Send marketing communications (with consent)
        • Develop new features and products
      `
    },
    {
      title: "3. DATA STORAGE AND LOCALIZATION",
      content: `
        3.1. Data Storage Location:
        • All data is stored on servers located in India
        • We comply with RBI's data localization requirements
        • No data is stored outside India without explicit permission
        • Backup servers are also located within India
        
        3.2. Data Retention:
        • Transaction records: 10 years (RBI requirement)
        • KYC documents: 10 years (regulatory requirement)
        • Account information: Until account closure + 7 years
        • Log data: 2 years for security purposes
        
        3.3. Data Security:
        • 256-bit SSL encryption for data transmission
        • AES-256 encryption for data at rest
        • Regular security audits and penetration testing
        • Access controls and authentication mechanisms
      `
    },
    {
      title: "4. INFORMATION SHARING AND DISCLOSURE",
      content: `
        4.1. With Your Consent:
        • Share information with third-party service providers
        • Send marketing communications
        • Use data for research and analytics
        
        4.2. Legal Requirements:
        • Comply with RBI regulations and guidelines
        • Respond to government requests and court orders
        • Report suspicious transactions to FIU-India
        • Share information for fraud prevention
        
        4.3. Business Partners:
        • RazorpayX for payment processing
        • Banking partners for fund transfers
        • KYC service providers for identity verification
        • Cloud service providers (India-based only)
      `
    },
    {
      title: "5. YOUR RIGHTS AND CHOICES",
      content: `
        5.1. Access and Control:
        • View and update your personal information
        • Download your transaction history
        • Request data deletion (subject to legal requirements)
        • Opt-out of marketing communications
        
        5.2. Data Portability:
        • Export your data in machine-readable format
        • Transfer data to another service provider
        • Request data in specific formats
        
        5.3. Consent Management:
        • Withdraw consent for data processing
        • Update communication preferences
        • Control third-party data sharing
        • Manage notification settings
      `
    },
    {
      title: "6. COOKIES AND TRACKING",
      content: `
        6.1. Essential Cookies:
        • Session management and authentication
        • Security and fraud prevention
        • Basic functionality and performance
        
        6.2. Analytics Cookies:
        • Website usage and performance analysis
        • User behavior and preferences
        • Service improvement and optimization
        
        6.3. Marketing Cookies:
        • Personalized content and advertisements
        • Social media integration
        • Third-party tracking (with consent)
        
        6.4. Cookie Management:
        • Control cookie preferences in browser settings
        • Opt-out of non-essential cookies
        • Clear cookies and browsing data
      `
    },
    {
      title: "7. SECURITY MEASURES",
      content: `
        7.1. Technical Security:
        • End-to-end encryption for all communications
        • Multi-factor authentication for sensitive operations
        • Regular security audits and vulnerability assessments
        • Intrusion detection and prevention systems
        
        7.2. Organizational Security:
        • Employee training on data protection
        • Access controls and role-based permissions
        • Incident response and breach notification procedures
        • Regular security policy reviews and updates
        
        7.3. Physical Security:
        • Secure data centers with 24/7 monitoring
        • Environmental controls and backup systems
        • Restricted access to server facilities
        • Disaster recovery and business continuity plans
      `
    },
    {
      title: "8. CHILDREN'S PRIVACY",
      content: `
        8.1. Age Requirements:
        • Our services are not intended for children under 18
        • We do not knowingly collect personal information from minors
        • Parental consent required for users under 18
        • Immediate deletion of data if minor usage is detected
        
        8.2. Protection Measures:
        • Age verification during registration
        • Parental notification for minor accounts
        • Restricted features for underage users
        • Educational content about online safety
      `
    },
    {
      title: "9. INTERNATIONAL DATA TRANSFERS",
      content: `
        9.1. Data Localization Compliance:
        • All data processing occurs within India
        • No cross-border data transfers without explicit consent
        • Compliance with RBI data localization requirements
        • Local data centers and infrastructure
        
        9.2. International Operations:
        • Separate data processing for international transactions
        • Compliance with local data protection laws
        • Data residency requirements for different jurisdictions
        • Cross-border data transfer agreements
      `
    },
    {
      title: "10. CHANGES TO THIS POLICY",
      content: `
        10.1. Policy Updates:
        • We may update this policy from time to time
        • Changes will be notified via email and website
        • Continued use constitutes acceptance of changes
        • Major changes require explicit consent
        
        10.2. Notification Process:
        • 30-day advance notice for significant changes
        • Email notification to all registered users
        • Website banner for policy updates
        • Option to accept or decline changes
        
        10.3. Version Control:
        • Version history maintained for all changes
        • Previous versions available upon request
        • Clear documentation of policy evolution
        • Audit trail for compliance purposes
      `
    },
    {
      title: "11. CONTACT INFORMATION",
      content: `
        11.1. Data Protection Officer:
        • Email: dpo@bell24h.com
        • Phone: +91-1800-123-4567
        • Address: Bell24h Technologies Pvt Ltd, Mumbai, India
        
        11.2. Privacy Complaints:
        • Submit complaints via email or phone
        • Response within 30 days of receipt
        • Escalation process for unresolved issues
        • Right to lodge complaint with regulatory authority
        
        11.3. General Inquiries:
        • Email: privacy@bell24h.com
        • Customer Support: support@bell24h.com
        • Legal Team: legal@bell24h.com
        • Compliance: compliance@bell24h.com
      `
    }
  ];

  const handleAcceptPolicy = () => {
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('bell24h-privacy-policy-accepted', 'true');
      localStorage.setItem('bell24h-privacy-policy-accepted-date', new Date().toISOString());
      
      // Redirect to wallet or dashboard
      window.location.href = '/dashboard/wallet';
    }
  };

  const downloadPolicy = () => {
    const policyText = policySections.map(section => 
      `${section.title}\n${section.content}\n`
    ).join('\n');
    
    const blob = new Blob([policyText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bell24h-Privacy-Policy.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bell24h Privacy Policy</h1>
              <h2 className="text-xl font-semibold text-green-600">Data Protection & Privacy</h2>
              <p className="text-gray-600">RBI Compliant • GDPR Ready • Data Localized in India</p>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Lock className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">YOUR PRIVACY IS OUR PRIORITY</h3>
            </div>
            <p className="text-green-700 mb-3">
              We are committed to protecting your personal information and ensuring transparency in how we collect, 
              use, and safeguard your data. This policy complies with RBI regulations and international standards.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">RBI Compliant</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">GDPR Ready</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">Data in India</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">256-bit Encryption</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={downloadPolicy}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Policy
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Policy
            </button>
          </div>
        </div>

        {/* Policy Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <button
              onClick={() => setShowFullPolicy(!showFullPolicy)}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              {showFullPolicy ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFullPolicy ? 'Hide Full Policy' : 'Show Full Policy'}
            </button>
          </div>

          {showFullPolicy && (
            <div className="space-y-8">
              {policySections.map((section, index) => (
                <div key={index} className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{section.title}</h3>
                  <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-green-900 mb-4">Key Privacy Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Data Protection</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• All data stored in India</li>
                  <li>• 256-bit SSL encryption</li>
                  <li>• Multi-factor authentication</li>
                  <li>• Regular security audits</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Your Rights</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Access and control your data</li>
                  <li>• Request data deletion</li>
                  <li>• Opt-out of marketing</li>
                  <li>• Download your data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Accept Privacy Policy</h3>
          
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <span className="text-gray-700">
                I have read, understood, and agree to the Bell24h Privacy Policy
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAcceptPolicy}
              disabled={!accepted}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                accepted
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              Accept & Continue
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              By accepting this privacy policy, you acknowledge that you have read and understood how we collect, 
              use, and protect your personal information. This acceptance is required to use Bell24h services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}