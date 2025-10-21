'use client'

import { useState, useEffect } from 'react'
import { CurrencyRupeeIcon, ArrowUpIcon, ArrowDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'

interface Transaction {
  id: number
  type: string
  amount: number
  status: string
  description: string
  created_at: string
}

interface WalletState {
  balance: number
  kyc_verified: boolean
  recent_transactions: Transaction[]
}

export default function WalletDashboard() {
  const [walletState, setWalletState] = useState<WalletState | null>(null)
  const [loading, setLoading] = useState(true)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [showKycModal, setShowKycModal] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    account_name: '',
    account_number: '',
    ifsc: ''
  })

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const response = await fetch('/api/v1/wallet/balance')
      if (!response.ok) throw new Error('Failed to fetch wallet data')
      const data = await response.json()
      setWalletState(data)
    } catch (error) {
      console.error('Error fetching wallet:', error)
      toast.error('Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    try {
      const amount = parseFloat(depositAmount)
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }

      const response = await fetch('/api/v1/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      if (!response.ok) throw new Error('Failed to create deposit')
      const data = await response.json()

      // Redirect to payment link
      window.location.href = data.payment_link
    } catch (error) {
      console.error('Error creating deposit:', error)
      toast.error('Failed to process deposit')
    }
  }

  const handleWithdraw = async () => {
    try {
      const amount = parseFloat(withdrawAmount)
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }

      if (!walletState?.kyc_verified) {
        setShowKycModal(true)
        return
      }

      const response = await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      })

      if (!response.ok) throw new Error('Failed to process withdrawal')
      const data = await response.json()

      toast.success('Withdrawal processed successfully')
      setWithdrawAmount('')
      fetchWalletData()
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      toast.error('Failed to process withdrawal')
    }
  }

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/v1/wallet/verify-kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bankDetails)
      })

      if (!response.ok) throw new Error('Failed to verify KYC')

      toast.success('KYC verified successfully')
      setShowKycModal(false)
      fetchWalletData()
    } catch (error) {
      console.error('Error verifying KYC:', error)
      toast.error('Failed to verify KYC')
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-6">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Balance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Wallet Balance</h2>
            {!walletState?.kyc_verified && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                KYC Pending
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-gray-900">
              ₹{walletState?.balance.toFixed(2)}
            </p>
          </div>
          
          {/* Deposit/Withdraw Section */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deposit Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={handleDeposit}
                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowUpIcon className="mr-2 h-4 w-4" />
                Deposit
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Withdraw Amount
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={handleWithdraw}
                className="mt-2 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Transactions
            </h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {walletState?.recent_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center">
                  {transaction.type === 'DEPOSIT' ? (
                    <ArrowUpIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-500" />
                  )}
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm font-medium ${
                      transaction.type === 'DEPOSIT'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'DEPOSIT' ? '+' : '-'}₹
                    {transaction.amount.toFixed(2)}
                  </p>
                  <p
                    className={`text-xs ${
                      transaction.status === 'COMPLETED'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KYC Modal */}
      {showKycModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <ExclamationCircleIcon
                    className="h-6 w-6 text-yellow-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Complete KYC Verification
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please verify your KYC by linking your bank account to enable withdrawals.
                    </p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleKycSubmit} className="mt-5 sm:mt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankDetails.account_name}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          account_name: e.target.value
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankDetails.account_number}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          account_number: e.target.value
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankDetails.ifsc}
                      onChange={(e) =>
                        setBankDetails({
                          ...bankDetails,
                          ifsc: e.target.value
                        })
                      }
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                  >
                    Verify KYC
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowKycModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
