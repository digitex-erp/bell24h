import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function WalletWidget() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState('');
  const [addFundsLoading, setAddFundsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch wallet balance
    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/wallet/balance');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch wallet balance');
        }

        setBalance(data.balance);
      } catch (error) {
        console.error('Error fetching wallet balance:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setAddFundsLoading(true);
    setError(null);

    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
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
      setError(error.message);
    } finally {
      setAddFundsLoading(false);
    }
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Wallet Balance</h3>
          <button
            type="button"
            onClick={() => router.push('/wallet/transactions')}
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View History
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse mt-4 h-8 bg-gray-200 rounded w-36"></div>
        ) : (
          <div className="mt-2">
            <div className="text-3xl font-bold text-gray-900">₹{balance.toFixed(2)}</div>
            <p className="mt-1 text-sm text-gray-500">Available balance</p>
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}

        {!showAddFunds ? (
          <div className="mt-5">
            <button
              type="button"
              onClick={() => setShowAddFunds(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Funds
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddFunds} className="mt-5">
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  name="amount"
                  id="amount"
                  min="100"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter amount"
                />
              </div>
              <button
                type="submit"
                disabled={addFundsLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                {addFundsLoading ? 'Processing...' : 'Proceed'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddFunds(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
