import { useState } from 'react';
import { Card, Row, Col, Statistic, Tabs, Button, Alert, Spin } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  WalletOutlined, 
  TransactionOutlined,
  LockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useWallet } from '@/hooks/useWallet';
import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import TransactionHistory from './TransactionHistory';
import { EscrowToggle } from './EscrowToggle';
import { formatBalance } from '@/lib/utils';

const { TabPane } = Tabs;

interface WalletDashboardProps {
  // Add any props if needed
}

export default function WalletDashboard({}: WalletDashboardProps) {
  const { wallet, loading, error, refreshWallet } = useWallet();
  const [depositVisible, setDepositVisible] = useState(false);
  const [withdrawVisible, setWithdrawVisible] = useState(false);
  const [showEscrowInfo, setShowEscrowInfo] = useState(true);

  const handleDepositSuccess = () => {
    setDepositVisible(false);
    message.success('Deposit initiated successfully');
    refreshWallet();
  };

  const handleWithdrawSuccess = () => {
    setWithdrawVisible(false);
    message.success('Withdrawal request submitted');
    refreshWallet();
  };

  const handleEscrowUpdate = () => {
    refreshWallet();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert 
          message="Error loading wallet" 
          description={error.message}
          type="error" 
          showIcon
        />
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="p-4">
        <Alert 
          message="No Wallet Found" 
          description="You don't have a wallet yet. Please create one to continue."
          type="info" 
          showIcon
        />
      </div>
    );
  }

  const availableBalance = (wallet.balance || 0) - (wallet.escrowBalance || 0);
  const escrowBalance = wallet.escrowBalance || 0;
  const totalBalance = wallet.balance || 0;
  const escrowPercentage = totalBalance > 0 ? (escrowBalance / totalBalance) * 100 : 0;
  const isEscrowActive = wallet.isEscrowEnabled && wallet.escrowThreshold > 0;

  return (
    <div className="space-y-6 p-4">
      {isEscrowActive && showEscrowInfo && (
        <Alert
          message="Escrow Protection Active"
          description={
            <div>
              <p>Escrow protection is enabled for transactions above {formatBalance(wallet.escrowThreshold, wallet.currency)}.</p>
              <p className="mt-2">
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => setShowEscrowInfo(false)}
                  className="p-0"
                >
                  Hide details
                </Button>
              </p>
            </div>
          }
          type="info"
          showIcon
          closable
          onClose={() => setShowEscrowInfo(false)}
          className="mb-4"
        />
      )}

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="h-full">
            <Statistic
              title="Available Balance"
              value={availableBalance / 100}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={wallet.currency === 'INR' ? '₹' : '$'}
              suffix={wallet.currency !== 'INR' ? wallet.currency : ''}
            />
            <div className="mt-4 flex space-x-2">
              <Button 
                type="primary" 
                icon={<ArrowDownOutlined />} 
                onClick={() => setDepositVisible(true)}
                className="flex-1"
              >
                Deposit
              </Button>
              <Button 
                icon={<ArrowUpOutlined />} 
                onClick={() => setWithdrawVisible(true)}
                disabled={availableBalance <= 0}
                className="flex-1"
              >
                Withdraw
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="h-full">
            <Statistic
              title="In Escrow"
              value={escrowBalance / 100}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={wallet.currency === 'INR' ? '₹' : '$'}
              suffix={wallet.currency !== 'INR' ? wallet.currency : ''}
            />
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Escrow Protection</span>
                <span className={`font-medium ${isEscrowActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {isEscrowActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-2" 
                    style={{ width: `${Math.min(100, escrowPercentage)}%` }}
                  />
                </div>
                <span className="ml-2 text-xs text-gray-500">
                  {escrowPercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card className="h-full">
            <Statistic
              title="Total Balance"
              value={totalBalance / 100}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={wallet.currency === 'INR' ? '₹' : '$'}
              suffix={wallet.currency !== 'INR' ? wallet.currency : ''}
            />
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-500">Available</div>
                <div className="font-medium">
                  {formatBalance(availableBalance, wallet.currency)}
                </div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-blue-500">In Escrow</div>
                <div className="font-medium text-blue-600">
                  {formatBalance(escrowBalance, wallet.currency)}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="transactions">
          <TabPane
            tab={
              <span>
                <TransactionOutlined />
                Transactions
              </span>
            }
            key="transactions"
          >
            <TransactionHistory 
              transactions={wallet.transactions || []} 
              currency={wallet.currency} 
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <LockOutlined />
                Escrow Holds
              </span>
            }
            key="escrow"
          >
            <div className="p-4">
              <EscrowToggle 
                wallet={{
                  id: wallet.id,
                  isEscrowEnabled: wallet.isEscrowEnabled || false,
                  escrowThreshold: wallet.escrowThreshold || 500000, // Default ₹5000
                  currency: wallet.currency
                }} 
                onUpdate={handleEscrowUpdate}
              />
              
              {isEscrowActive && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Active Escrow Holds</h3>
                    <Button 
                      type="link" 
                      icon={<InfoCircleOutlined />} 
                      onClick={() => setShowEscrowInfo(!showEscrowInfo)}
                    >
                      {showEscrowInfo ? 'Hide Info' : 'How It Works'}
                    </Button>
                  </div>
                  
                  {wallet.escrowHolds?.length > 0 ? (
                    <div className="space-y-3">
                      {wallet.escrowHolds.map((hold: any) => (
                        <Card key={hold.id} size="small" className="border-l-4 border-blue-500">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium">
                                {formatBalance(hold.amount, hold.currency)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {hold.orderId ? `Order #${hold.orderId}` : 'No reference'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                {new Date(hold.createdAt).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {hold.status}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <LockOutlined className="text-2xl mb-2" />
                      <p>No active escrow holds</p>
                      <p className="text-sm mt-1">
                        Funds will be held in escrow for transactions above {formatBalance(wallet.escrowThreshold, wallet.currency)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Card>

      <DepositModal
        visible={depositVisible}
        onCancel={() => setDepositVisible(false)}
        onSuccess={handleDepositSuccess}
      />
      
      <WithdrawModal
        visible={withdrawVisible}
        onCancel={() => setWithdrawVisible(false)}
        onSuccess={handleWithdrawSuccess}
        maxAmount={availableBalance}
        currency={wallet.currency}
      />
    </div>
  );
}
