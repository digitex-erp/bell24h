import { Table, Tag, Space } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'escrow_refund';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description?: string;
  referenceId: string;
  createdAt: string | Date;
  metadata?: Record<string, any>;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency: string;
  loading?: boolean;
}

const getTransactionType = (type: string) => {
  switch (type) {
    case 'deposit':
      return { label: 'Deposit', color: 'green' };
    case 'withdrawal':
      return { label: 'Withdrawal', color: 'volcano' };
    case 'escrow_hold':
      return { label: 'Escrow Hold', color: 'blue' };
    case 'escrow_release':
      return { label: 'Escrow Release', color: 'green' };
    case 'escrow_refund':
      return { label: 'Escrow Refund', color: 'orange' };
    default:
      return { label: type, color: 'default' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'processing';
    case 'failed':
      return 'error';
    case 'refunded':
      return 'warning';
    default:
      return 'default';
  }
};

export default function TransactionHistory({ transactions, currency, loading = false }: TransactionHistoryProps) {
  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeInfo = getTransactionType(type);
        return (
          <div className="flex items-center">
            {type === 'deposit' || type === 'escrow_release' ? (
              <ArrowDownOutlined className="text-green-500 mr-2" />
            ) : (
              <ArrowUpOutlined className="text-red-500 mr-2" />
            )}
            <Tag color={typeInfo.color}>
              {typeInfo.label}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => {
        const isCredit = record.type === 'deposit' || record.type === 'escrow_release';
        const amountInCurrency = (amount / 100).toFixed(2);
        const prefix = currency === 'INR' ? '₹' : '$';
        
        return (
          <span className={`font-medium ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            {isCredit ? '+' : '-'}{prefix}{amountInCurrency}
          </span>
        );
      },
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string, record: Transaction) => (
        <div>
          <div className="font-medium">{text || 'No description'}</div>
          <div className="text-xs text-gray-500">Ref: {record.referenceId}</div>
        </div>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date: string | Date) => (
        <div className="whitespace-nowrap">
          {format(new Date(date), 'MMM d, yyyy')}
          <div className="text-xs text-gray-500">
            {format(new Date(date), 'h:mm a')}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
  ];

  return (
    <div className="transaction-history">
      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showTotal: (total) => `Total ${total} transactions`,
        }}
        loading={loading}
        locale={{
          emptyText: 'No transactions found',
        }}
      />
    </div>
  );
}
