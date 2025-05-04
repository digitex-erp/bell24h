import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function Wallet({ auth }) {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add funds form state
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [addFundsLoading, setAddFundsLoading] = useState(false);
  const [addFundsError, setAddFundsError] = useState(null);
  
  // Withdraw funds form state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!auth.loading && !auth.isAuthenticated) {
      router.push('/auth/login?redirect=/wallet');
      return;
    }
    
    const fetchWalletData = async () => {
      try {
        // Fetch wallet balance
        const balanceResponse = await fetch('/api/wallet/balance');
        const balanceData = await balanceResponse.json();
        
        if (!balanceResponse.ok) {
          throw new Error(balanceData.message || 'Failed to fetch wallet balance');
        }
        
        setBalance(balanceData.balance);
        
        // Fetch recent transactions
        const txResponse = await fetch('/api/wallet/transactions?limit=5');
        const txData = await txResponse.json();
        
        if (!txResponse.ok) {
          throw new Error(txData.message || 'Failed to fetch transactions');
        }
        
        setTransactions(txData);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (auth.isAuthenticated) {
      fetchWalletData();
    }
  }, [auth.isAuthenticated, auth.loading, router]);
  
  const handleAddFunds = async (e) => {
    e.preventDefault();
    setAddFundsLoading(true);
    setAddFundsError(null);
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setAddFundsError('Please enter a valid amount');
      setAddFundsLoading(false);
      return;
    }
    
    try {
      // Create order
      const orderResponse = await fetch('/api/wallet/add-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amountValue }),
      });
      
      const orderData = await orderResponse.json();
      
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create payment order');
      }
      
      // Initialize RazorpayX payment
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Bell24h',
        description: 'Add funds to wallet',
        order_id: orderData.id,
        handler: async function (response) {
          // Verify payment on server
          const verifyResponse = await fetch('/api/wallet/verify-payment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          
          const verifyData = await verifyResponse.json();
          
          if (!verifyResponse.ok) {
            throw new Error(verifyData.message || 'Payment verification failed');
          }
          
          // Update balance after successful payment
          setBalance(verifyData.balance);
          
          // Add new transaction to the list
          setTransactions(prev => [verifyData.transaction, ...prev]);
          
          // Close the form
          setShowAddFunds(false);
          setAmount('');
        },
        prefill: {
          name: orderData.user_name,
          email: orderData.user_email,
        },
        theme: {
          color: '#0ea5e9',
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setAddFundsError(error.message);
    } finally {
      setAddFundsLoading(false);
    }
  };
  
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setWithdrawLoading(true);
    setWithdrawError(null);
    
    const amountValue = parseFloat(withdrawAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setWithdrawError('Please enter a valid amount');
      setWithdrawLoading(false);
      return;
    }
    
    if (amountValue > balance) {
      setWithdrawError('Withdrawal amount exceeds available balance');
      setWithdrawLoading(false);
      return;
    }
    
    if (!accountNo || !ifscCode || !accountName) {
      setWithdrawError('Please fill in all bank account details');
      setWithdrawLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountValue,
          account_number: accountNo,
          ifsc_code: ifscCode,
          account_name: accountName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process withdrawal');
      }
      
      // Update balance
      setBalance(data.balance);
      
      // Add new transaction to the list
      setTransactions(prev => [data.transaction, ...prev]);
      
      // Close the form
      setShowWithdraw(false);
      setWithdrawAmount('');
      setAccountNo('');
      setIfscCode('');
      setAccountName('');
    } catch (error) {
      console.error('Withdrawal error:', error);
      setWithdrawError(error.message);
    } finally {
      setWithdrawLoading(false);
    }
  };
  
  const getTransactionBadgeClass = (type) => {
    switch (type) {
      case 'deposit':
        return 'bg-green-100 text-green-800';
      case 'withdrawal':
        return 'bg-yellow-100 text-yellow-800';
      case 'payment':
        return 'bg-blue-100 text-blue-800';
      case 'refund':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatTransactionType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  if (auth.loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Your Wallet
            </h2>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {/* Balance and Actions Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Wallet Balance
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {loading ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded w-36"></div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">₹{balance.toFixed(2)}</div>
                )}
                <p className="mt-1 text-sm text-gray-500">Available balance</p>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFunds(true);
                      setShowWithdraw(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Add Funds
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWithdraw(true);
                      setShowAddFunds(false);
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
            
            {/* Add Funds Form */}
            {showAddFunds && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Add Funds to Your Wallet
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Securely add money using RazorpayX
                  </p>
                </div>
                
                {addFundsError && (
                  <div className="mx-4 mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{addFundsError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <form onSubmit={handleAddFunds}>
                    <div className="sm:col-span-3">
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Amount (₹) *
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          required
                          min="100"
                          step="1"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter amount (minimum ₹100)"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowAddFunds(false)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addFundsLoading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {addFundsLoading ? 'Processing...' : 'Proceed to Pay'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Withdraw Form */}
            {showWithdraw && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Withdraw Funds
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Withdraw money to your bank account
                  </p>
                </div>
                
                {withdrawError && (
                  <div className="mx-4 mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                          Error
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{withdrawError}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <form onSubmit={handleWithdraw}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700">
                          Amount (₹) *
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="withdraw-amount"
                            id="withdraw-amount"
                            required
                            min="100"
                            max={balance}
                            step="1"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter amount (minimum ₹100)"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="account-name" className="block text-sm font-medium text-gray-700">
                          Account Holder Name *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="account-name"
                            id="account-name"
                            required
                            value={accountName}
                            onChange={(e) => setAccountName(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter account holder name"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="account-no" className="block text-sm font-medium text-gray-700">
                          Account Number *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="account-no"
                            id="account-no"
                            required
                            value={accountNo}
                            onChange={(e) => setAccountNo(e.target.value)}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter account number"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="ifsc-code" className="block text-sm font-medium text-gray-700">
                          IFSC Code *
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="ifsc-code"
                            id="ifsc-code"
                            required
                            value={ifscCode}
                            onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Enter IFSC code"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowWithdraw(false)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={withdrawLoading}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {withdrawLoading ? 'Processing...' : 'Submit Withdrawal'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {/* Recent Transactions */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Recent Transactions
                  </h3>
                  <Link href="/wallet/transactions">
                    <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      View All
                    </a>
                  </Link>
                </div>
              </div>
              
              {loading ? (
                <div className="px-4 py-5 sm:px-6">
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200">
                  <ul className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                        No transactions yet.
                      </li>
                    ) : (
                      transactions.map((tx) => (
                        <li key={tx.id} className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {tx.description || formatTransactionType(tx.type)}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {new Date(tx.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className={`mr-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionBadgeClass(tx.type)}`}>
                                {formatTransactionType(tx.type)}
                              </span>
                              <span className={`text-sm font-medium ${tx.type === 'deposit' || tx.type === 'refund' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'deposit' || tx.type === 'refund' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Information Card */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  About Your Wallet
                </h3>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="space-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Secure Transactions
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      All transactions are secured with RazorpayX payment gateway.
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Escrow Protection
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      For RFQs above ₹5 lakhs, funds are held in escrow until successful completion.
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Withdrawal Process
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Withdrawals are processed within 24-48 business hours to your bank account.
                    </dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Need Help?
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      Contact our support team at <a href="mailto:support@bell24h.com" className="text-primary-600 hover:text-primary-500">support@bell24h.com</a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
