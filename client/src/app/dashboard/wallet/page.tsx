'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Banknote,
  History,
  Settings,
  Plus,
  Minus,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Eye,
  Clock,
  Star,
  Building2,
  Phone,
  Mail,
  Calendar,
  Zap,
  Award,
  AlertTriangle,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock wallet data
const mockWalletData = {
  user: {
    name: 'Rajesh Kumar',
    email: 'rajesh@techcorp.com',
    phone: '+91-98765-43210',
    company: 'TechCorp Industries',
  },
  wallet: {
    balance: 125000,
    escrowBalance: 45000,
    totalTransactions: 89,
    monthlySpent: 25000,
    kycStatus: 'verified',
    bankAccountLinked: true,
    subscriptionActive: true,
  },
  transactions: [
    {
      id: 'TXN001',
      type: 'credit',
      amount: 50000,
      description: 'Payment received from SteelWorks Ltd',
      date: '2024-09-29',
      status: 'completed',
      category: 'RFQ Payment',
    },
    {
      id: 'TXN002',
      type: 'debit',
      amount: 15000,
      description: 'Escrow payment for Order #1234',
      date: '2024-09-28',
      status: 'completed',
      category: 'Escrow',
    },
    {
      id: 'TXN003',
      type: 'credit',
      amount: 25000,
      description: 'Refund from cancelled order',
      date: '2024-09-27',
      status: 'completed',
      category: 'Refund',
    },
    {
      id: 'TXN004',
      type: 'debit',
      amount: 5000,
      description: 'Platform fee',
      date: '2024-09-26',
      status: 'completed',
      category: 'Fees',
    },
  ],
  escrowTransactions: [
    {
      id: 'ESC001',
      amount: 45000,
      description: 'Steel Beams Order - Milestone 1',
      supplier: 'SteelWorks Ltd',
      status: 'active',
      releaseDate: '2024-10-15',
      milestones: 3,
      completedMilestones: 1,
    },
    {
      id: 'ESC002',
      amount: 25000,
      description: 'Custom Parts Manufacturing',
      supplier: 'AutoParts Inc',
      status: 'pending_release',
      releaseDate: '2024-10-05',
      milestones: 2,
      completedMilestones: 2,
    },
  ],
  kredxInvoices: [
    {
      id: 'INV001',
      amount: 100000,
      supplier: 'SteelWorks Ltd',
      invoiceDate: '2024-09-15',
      dueDate: '2024-10-15',
      status: 'eligible',
      discountRate: 2.5,
      discountAmount: 2500,
      netAmount: 97500,
    },
    {
      id: 'INV002',
      amount: 75000,
      supplier: 'AutoParts Inc',
      invoiceDate: '2024-09-20',
      dueDate: '2024-10-20',
      status: 'discounted',
      discountRate: 3.0,
      discountAmount: 2250,
      netAmount: 72750,
    },
  ],
};

// Wallet Balance Card
const WalletBalanceCard = ({ wallet }) => (
  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-xl text-white">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold">Wallet Balance</h3>
        <p className="text-blue-100">Available for transactions</p>
      </div>
      <Wallet className="w-8 h-8 text-blue-200" />
    </div>
    <div className="text-3xl font-bold mb-2">
      ₹{wallet.balance.toLocaleString()}
    </div>
    <div className="flex items-center text-sm text-blue-100">
      <TrendingUp className="w-4 h-4 mr-1" />
      +12% from last month
    </div>
  </div>
);

// Escrow Balance Card
const EscrowBalanceCard = ({ wallet }) => (
  <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl text-white">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold">Escrow Balance</h3>
        <p className="text-green-100">Secured payments</p>
      </div>
      <Shield className="w-8 h-8 text-green-200" />
    </div>
    <div className="text-3xl font-bold mb-2">
      ₹{wallet.escrowBalance.toLocaleString()}
    </div>
    <div className="flex items-center text-sm text-green-100">
      <CheckCircle className="w-4 h-4 mr-1" />
      {wallet.escrowBalance > 0 ? 'Active escrow' : 'No active escrow'}
    </div>
  </div>
);

// Transaction Item
const TransactionItem = ({ transaction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'debit':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'escrow':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Banknote className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shadow-sm">
          {getTypeIcon(transaction.type)}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
          <p className="text-xs text-gray-500">{transaction.date} • {transaction.category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${
          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
        }`}>
          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
        </p>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(transaction.status)}`}>
          {transaction.status}
        </span>
      </div>
    </div>
  );
};

// Escrow Transaction Item
const EscrowTransactionItem = ({ escrow }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-blue-600 bg-blue-100';
      case 'pending_release':
        return 'text-yellow-600 bg-yellow-100';
      case 'released':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const progressPercentage = (escrow.completedMilestones / escrow.milestones) * 100;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{escrow.description}</h4>
          <p className="text-sm text-gray-600">Supplier: {escrow.supplier}</p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(escrow.status)}`}>
          {escrow.status.replace('_', ' ')}
        </span>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress: {escrow.completedMilestones}/{escrow.milestones} milestones</span>
          <span>{progressPercentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          <Calendar className="w-4 h-4 inline mr-1" />
          Release: {escrow.releaseDate}
        </div>
        <div className="text-lg font-semibold text-gray-900">
          ₹{escrow.amount.toLocaleString()}
        </div>
      </div>
    </div>
  );
};

// KredX Invoice Discounting Card
const KredXInvoiceCard = ({ invoice }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'eligible':
        return 'text-green-600 bg-green-100';
      case 'discounted':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Invoice #{invoice.id}</h4>
          <p className="text-sm text-gray-600">Supplier: {invoice.supplier}</p>
        </div>
        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(invoice.status)}`}>
          {invoice.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Invoice Amount</p>
          <p className="text-lg font-semibold text-gray-900">₹{invoice.amount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Discount Rate</p>
          <p className="text-lg font-semibold text-green-600">{invoice.discountRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Discount Amount</p>
          <p className="text-lg font-semibold text-blue-600">₹{invoice.discountAmount.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Net Amount</p>
          <p className="text-lg font-semibold text-gray-900">₹{invoice.netAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
        <span>Invoice Date: {invoice.invoiceDate}</span>
        <span>Due Date: {invoice.dueDate}</span>
      </div>

      {invoice.status === 'eligible' && (
        <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
          Apply for Discount
        </button>
      )}
    </div>
  );
};

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const user = mockWalletData.user;
  const wallet = mockWalletData.wallet;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Wallet & Escrow</h1>
            <p className="text-gray-600 mt-1">Manage your funds, escrow payments, and invoice discounting</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button 
              onClick={() => setShowAddFunds(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Funds
            </button>
            <button 
              onClick={() => setShowWithdraw(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Withdraw
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WalletBalanceCard wallet={wallet} />
          <EscrowBalanceCard wallet={wallet} />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{wallet.totalTransactions}</p>
              </div>
              <History className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Spent</p>
                <p className="text-2xl font-bold text-gray-900">₹{wallet.monthlySpent.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">KYC Status</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">{wallet.kycStatus}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bank Account</p>
                <p className="text-lg font-semibold text-gray-900">
                  {wallet.bankAccountLinked ? 'Linked' : 'Not Linked'}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: 'Overview', icon: Wallet },
                { id: 'transactions', name: 'Transactions', icon: History },
                { id: 'escrow', name: 'Escrow', icon: Shield },
                { id: 'kredx', name: 'KredX Discounting', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                    <div className="space-y-3">
                      {mockWalletData.transactions.slice(0, 3).map((transaction) => (
                        <TransactionItem key={transaction.id} transaction={transaction} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Escrow</h3>
                    <div className="space-y-3">
                      {mockWalletData.escrowTransactions.slice(0, 2).map((escrow) => (
                        <EscrowTransactionItem key={escrow.id} escrow={escrow} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
                  <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
                <div className="space-y-3">
                  {mockWalletData.transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} />
                  ))}
                </div>
              </div>
            )}

            {/* Escrow Tab */}
            {activeTab === 'escrow' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Escrow Transactions</h3>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Escrow
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockWalletData.escrowTransactions.map((escrow) => (
                    <EscrowTransactionItem key={escrow.id} escrow={escrow} />
                  ))}
                </div>
              </div>
            )}

            {/* KredX Tab */}
            {activeTab === 'kredx' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">KredX Invoice Discounting</h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="w-4 h-4 mr-1" />
                    Powered by KredX
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-200">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-purple-600 mr-2" />
                    <h4 className="text-lg font-semibold text-gray-900">Invoice Discounting Benefits</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">2-5%</div>
                      <div className="text-sm text-gray-600">Discount Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">24-48hrs</div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">₹10L+</div>
                      <div className="text-sm text-gray-600">Min Invoice Value</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {mockWalletData.kredxInvoices.map((invoice) => (
                    <KredXInvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}