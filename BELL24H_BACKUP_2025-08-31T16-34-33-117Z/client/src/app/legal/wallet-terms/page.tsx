'use client';
import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  User, 
  Lock,
  Eye,
  EyeOff,
  Download,
  Printer
} from 'lucide-react';

export default function WalletTermsPage() {
  const [showFullTerms, setShowFullTerms] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const termsSections = [
    {
      title: "1. DEFINITIONS AND INTERPRETATION",
      content: `
        "Bell24h Wallet" means the digital wallet service provided by Bell24h.
        "User" means any person who registers for and uses the Bell24h Wallet service.
        "Transaction" means any credit, debit, or transfer of funds through the wallet.
        "KYC" means Know Your Customer procedures as mandated by RBI.
        "AML" means Anti-Money Laundering guidelines as per RBI regulations.
      `
    },
    {
      title: "2. ELIGIBILITY AND REGISTRATION",
      content: `
        2.1. You must be at least 18 years old and a resident of India to use Bell24h Wallet.
        2.2. You must provide accurate and complete information during registration.
        2.3. You must complete KYC verification as per RBI guidelines.
        2.4. You agree to maintain the security of your login credentials.
        2.5. You are responsible for all activities conducted through your wallet account.
      `
    },
    {
      title: "3. WALLET FEATURES AND LIMITS",
      content: `
        3.1. Daily Transaction Limit: ₹1,00,000 (₹1 lakh)
        3.2. Monthly Transaction Limit: ₹10,00,000 (₹10 lakhs)
        3.3. Maximum Wallet Balance: ₹2,00,000 (₹2 lakhs)
        3.4. Minimum Transaction Amount: ₹1
        3.5. Maximum Single Transaction: ₹50,000
        3.6. Limits may vary based on KYC level and compliance requirements.
      `
    },
    {
      title: "4. FEES AND CHARGES",
      content: `
        4.1. Wallet Top-up: 2% + ₹2 (via cards), Free (via UPI), ₹10 (via net banking)
        4.2. Wallet Withdrawal: ₹10 per transaction
        4.3. Failed Transaction: ₹25 (if applicable)
        4.4. Inactivity Fee: ₹50 per month after 12 months of inactivity
        4.5. All fees are subject to change with 30 days notice.
      `
    },
    {
      title: "5. SECURITY AND PRIVACY",
      content: `
        5.1. All data is stored on servers located in India as per RBI guidelines.
        5.2. We implement 256-bit SSL encryption for all transactions.
        5.3. Two-factor authentication is mandatory for high-value transactions.
        5.4. We maintain transaction logs for 10 years as per RBI requirements.
        5.5. Your personal information is protected as per our Privacy Policy.
      `
    },
    {
      title: "6. ANTI-MONEY LAUNDERING (AML) COMPLIANCE",
      content: `
        6.1. We are required to report suspicious transactions to FIU-India.
        6.2. We may freeze accounts if suspicious activity is detected.
        6.3. We reserve the right to request additional documentation.
        6.4. We may share information with regulatory authorities as required by law.
        6.5. You agree to cooperate with all compliance requirements.
      `
    },
    {
      title: "7. LIABILITY AND DISPUTE RESOLUTION",
      content: `
        7.1. Our liability is limited to the actual amount of the disputed transaction.
        7.2. We are not liable for losses due to user negligence or fraud.
        7.3. Disputes will be resolved through arbitration in Mumbai, India.
        7.4. You must report unauthorized transactions within 24 hours.
        7.5. We will investigate and resolve disputes within 30 days.
      `
    },
    {
      title: "8. ACCOUNT TERMINATION",
      content: `
        8.1. We may terminate your account for violation of these terms.
        8.2. You may close your account by contacting customer support.
        8.3. Remaining balance will be refunded to your linked bank account.
        8.4. We will maintain transaction records for 10 years post-termination.
        8.5. Termination does not affect our right to recover any amounts owed.
      `
    },
    {
      title: "9. GOVERNING LAW AND JURISDICTION",
      content: `
        9.1. These terms are governed by the laws of India.
        9.2. Any disputes will be subject to the jurisdiction of courts in Mumbai.
        9.3. We comply with all applicable RBI regulations and guidelines.
        9.4. These terms may be updated to comply with regulatory changes.
        9.5. Continued use constitutes acceptance of updated terms.
      `
    }
  ];

  const handleAcceptTerms = () => {
    if (accepted) {
      // Store acceptance in localStorage
      localStorage.setItem('bell24h-wallet-terms-accepted', 'true');
      localStorage.setItem('bell24h-wallet-terms-accepted-date', new Date().toISOString());
      
      // Redirect to wallet or dashboard
      window.location.href = '/dashboard/wallet';
    }
  };

  const downloadTerms = () => {
    const termsText = termsSections.map(section => 
      `${section.title}\n${section.content}\n`
    ).join('\n');
    
    const blob = new Blob([termsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Bell24h-Wallet-Terms-and-Conditions.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bell24h Digital Wallet</h1>
              <h2 className="text-xl font-semibold text-blue-600">Terms & Conditions</h2>
              <p className="text-gray-600">RBI Compliant Digital Wallet Service</p>
        </div>
      </div>

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-800">IMPORTANT NOTICE</h3>
            </div>
            <p className="text-red-700 mb-3">
              By using Bell24h Wallet, you agree to these terms and conditions. 
              This is a legally binding agreement between you and Bell24h.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">RBI Compliant</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Legally Binding</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">KYC Required</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={downloadTerms}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Terms
            </button>
                        <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
              <Printer className="w-4 h-4" />
              Print Terms
                        </button>
                  </div>
                </div>

        {/* Terms Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="mb-6">
            <button
              onClick={() => setShowFullTerms(!showFullTerms)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              {showFullTerms ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showFullTerms ? 'Hide Full Terms' : 'Show Full Terms'}
            </button>
          </div>

          {showFullTerms && (
            <div className="space-y-8">
              {termsSections.map((section, index) => (
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
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Points Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Transaction Limits</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Daily: ₹1,00,000</li>
                  <li>• Monthly: ₹10,00,000</li>
                  <li>• Max Balance: ₹2,00,000</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Security Features</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• 256-bit SSL encryption</li>
                  <li>• Two-factor authentication</li>
                  <li>• Real-time fraud detection</li>
                  <li>• RBI compliant data storage</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Accept Terms & Conditions</h3>
          
          <div className="mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700">
                I have read, understood, and agree to the Bell24h Digital Wallet Terms & Conditions
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleAcceptTerms}
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
              By accepting these terms, you acknowledge that you have read and understood all the terms and conditions 
              governing the use of Bell24h Digital Wallet service. This acceptance is legally binding and constitutes 
              your agreement to comply with all applicable laws and regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
