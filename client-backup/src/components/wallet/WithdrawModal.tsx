import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, InputNumber, message, Spin, Select, Typography } from 'antd';
import { LoadingOutlined, BankOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useWalletContext } from '@/providers/WalletProvider';

const { Option } = Select;
const { Text } = Typography;

interface BankAccount {
  id: string;
  account_holder_name: string;
  bank_name: string;
  last4: string;
  account_number: string;
  ifsc: string;
}

interface WithdrawModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  maxAmount: number;
}

const WithdrawModal: React.FC<WithdrawModalProps> = ({ 
  visible, 
  onCancel, 
  onSuccess,
  maxAmount 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [fetchingAccounts, setFetchingAccounts] = useState(false);
  const { withdraw, wallet } = useWalletContext();

  // Fetch user's bank accounts
  useEffect(() => {
    if (visible) {
      fetchBankAccounts();
    }
  }, [visible]);

  const fetchBankAccounts = async () => {
    try {
      setFetchingAccounts(true);
      // In a real app, you would fetch this from your API
      // const response = await apiRequest('GET', '/api/bank-accounts');
      // setBankAccounts(response.data);
      
      // Mock data for demo
      setTimeout(() => {
        setBankAccounts([
          {
            id: 'ba_1',
            account_holder_name: 'John Doe',
            bank_name: 'HDFC Bank',
            last4: '4321',
            account_number: 'XXXXXXXXXX4321',
            ifsc: 'HDFC0001234'
          },
          {
            id: 'ba_2',
            account_holder_name: 'John Doe',
            bank_name: 'ICICI Bank',
            last4: '5678',
            account_number: 'XXXXXXXXXX5678',
            ifsc: 'ICIC0001234'
          }
        ]);
        setFetchingAccounts(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      message.error('Failed to load bank accounts');
      setFetchingAccounts(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      await withdraw({
        amount: values.amount,
        bankAccountId: values.bankAccountId
      });
      
      message.success('Withdrawal request submitted successfully');
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      message.error(error.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const renderBankAccountOption = (account: BankAccount) => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <BankOutlined style={{ marginRight: 8, color: '#1890ff' }} />
      <div>
        <div>
          {account.bank_name} ••••{account.last4}
        </div>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {account.account_holder_name} • {account.ifsc}
        </Text>
      </div>
    </div>
  );

  const selectedBankAccount = bankAccounts.find(
    acc => acc.id === form.getFieldValue('bankAccountId')
  );

  return (
    <Modal
      title="Withdraw Funds"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ amount: '' }}
      >
        <Form.Item
          label="Bank Account"
          name="bankAccountId"
          rules={[{ required: true, message: 'Please select a bank account' }]}
        >
          <Select
            placeholder="Select bank account"
            loading={fetchingAccounts}
            optionLabelProp="label"
            notFoundContent={
              fetchingAccounts ? (
                <div style={{ padding: '8px 0', textAlign: 'center' }}>
                  <Spin size="small" />
                </div>
              ) : (
                <div style={{ padding: '8px 0', textAlign: 'center' }}>
                  No bank accounts found
                </div>
              )
            }
          >
            {bankAccounts.map(account => (
              <Option 
                key={account.id} 
                value={account.id}
                label={`${account.bank_name} ••••${account.last4}`}
              >
                {renderBankAccountOption(account)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span>Amount</span>
              <Text type="secondary" style={{ fontWeight: 'normal' }}>
                Available: ₹{maxAmount.toFixed(2)}
              </Text>
            </div>
          }
          name="amount"
          rules={[
            { required: true, message: 'Please enter amount' },
            {
              validator: (_, value) => {
                if (value && value > maxAmount) {
                  return Promise.reject('Amount exceeds available balance');
                }
                if (value && value < 100) {
                  return Promise.reject('Minimum withdrawal amount is ₹100');
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter amount to withdraw"
            prefix="₹"
            min={100}
            max={maxAmount}
            step={100}
          />
        </Form.Item>

        {selectedBankAccount && (
          <div style={{ 
            background: '#f9f9f9', 
            borderRadius: 4, 
            padding: 12, 
            marginBottom: 16 
          }}>
            <div style={{ marginBottom: 8 }}>
              <Text strong>Account Details:</Text>
            </div>
            <div style={{ display: 'flex', marginBottom: 4 }}>
              <Text type="secondary" style={{ width: 120 }}>Account Holder</Text>
              <Text>{selectedBankAccount.account_holder_name}</Text>
            </div>
            <div style={{ display: 'flex', marginBottom: 4 }}>
              <Text type="secondary" style={{ width: 120 }}>Account Number</Text>
              <Text>•••• {selectedBankAccount.last4}</Text>
            </div>
            <div style={{ display: 'flex' }}>
              <Text type="secondary" style={{ width: 120 }}>IFSC</Text>
              <Text>{selectedBankAccount.ifsc}</Text>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#e6f7ff', 
          border: '1px solid #91d5ff', 
          borderRadius: 4, 
          padding: 12, 
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start'
        }}>
          <InfoCircleOutlined style={{ color: '#1890ff', marginRight: 8, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>Processing Time</div>
            <div style={{ fontSize: 13, color: '#595959' }}>
              Withdrawals are processed within 1-2 business days. A processing fee of ₹10 or 1% (whichever is higher) applies.
            </div>
          </div>
        </div>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            size="large"
            loading={loading}
            icon={loading ? <LoadingOutlined /> : null}
          >
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default WithdrawModal;
