import React, { useState } from 'react';
import { Modal, Form, Input, Button, InputNumber, message, Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useWalletContext } from '@/providers/WalletProvider';

interface DepositModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const DepositModal: React.FC<DepositModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const stripe = useStripe();
  const elements = useElements();
  const { deposit } = useWalletContext();

  const handleSubmit = async (values: any) => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    
    try {
      // Create payment method
      const { error: createPaymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement)!,
        billing_details: {
          email: values.email,
        },
      });

      if (createPaymentMethodError) {
        throw new Error(createPaymentMethodError.message);
      }

      // Process deposit
      await deposit({
        amount: values.amount,
        paymentMethodId: paymentMethod.id,
      });

      message.success('Deposit successful!');
      onSuccess();
      onCancel();
    } catch (error: any) {
      console.error('Deposit error:', error);
      message.error(error.message || 'Failed to process deposit');
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <Modal
      title="Add Money to Wallet"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: 'Please enter amount' },
            { type: 'number', min: 10, message: 'Minimum amount is ₹10' },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="Enter amount"
            prefix="₹"
            step={100}
            min={10}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Your email address" />
        </Form.Item>

        <Form.Item
          label="Card Details"
          required
        >
          <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px', padding: '8px 11px' }}>
            <CardElement options={cardElementOptions} />
          </div>
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            block
            disabled={loading}
            icon={loading ? <LoadingOutlined /> : null}
          >
            {loading ? 'Processing...' : 'Add Money'}
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px' }}>
          Your payment is secure and encrypted
        </div>
      </Form>
    </Modal>
  );
};

export default DepositModal;
