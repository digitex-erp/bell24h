import { Card, List, Tag, Button, Space, Typography, Tooltip, Skeleton, Empty, Badge } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatDistanceToNow, format } from 'date-fns';
import { useEscrow } from '@/hooks/useEscrow';
import { formatBalance } from '@/lib/wallet-utils';

const { Text, Title } = Typography;

interface EscrowHoldsListProps {
  holds: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    referenceId: string;
    orderId?: string;
    metadata?: any;
    releaseDate?: Date | null;
    createdAt: Date | string;
    transactions?: Array<{
      id: string;
      amount: number;
      type: string;
      status: string;
      createdAt: Date | string;
    }>;
  }>;
  loading?: boolean;
  onActionComplete?: () => void;
}

export default function EscrowHoldsList({ holds, loading = false, onActionComplete }: EscrowHoldsListProps) {
  const { releaseEscrow, refundEscrow, loading: actionLoading } = useEscrow();

  const getStatusProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'held_in_escrow':
        return {
          color: 'processing',
          icon: <ClockCircleOutlined />,
          label: 'Held in Escrow',
        };
      case 'released':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          label: 'Released',
        };
      case 'refunded':
        return {
          color: 'default',
          icon: <CloseCircleOutlined />,
          label: 'Refunded',
        };
      default:
        return {
          color: 'default',
          icon: <InfoCircleOutlined />,
          label: status,
        };
    }
  };

  const handleRelease = async (holdId: string) => {
    const success = await releaseEscrow(holdId, { action: 'manual_release' });
    if (success && onActionComplete) {
      onActionComplete();
    }
  };

  const handleRefund = async (holdId: string) => {
    const success = await refundEscrow(holdId, { action: 'manual_refund' });
    if (success && onActionComplete) {
      onActionComplete();
    }
  };

  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  if (!holds || holds.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No escrow holds found"
        className="py-8"
      />
    );
  }

  return (
    <List
      itemLayout="vertical"
      dataSource={holds}
      renderItem={(hold) => {
        const statusProps = getStatusProps(hold.status);
        const isActive = hold.status === 'HELD_IN_ESCROW';
        const latestTransaction = hold.transactions?.[0];

        return (
          <List.Item
            key={hold.id}
            className="border-b border-gray-100 last:border-0"
            extra={
              <Space direction="vertical" align="end">
                <div className="text-lg font-semibold">
                  {formatBalance(hold.amount, hold.currency)}
                </div>
                <Tag color={statusProps.color} icon={statusProps.icon}>
                  {statusProps.label}
                </Tag>
              </Space>
            }
          >
            <List.Item.Meta
              title={
                <div className="flex items-center">
                  <Text strong className="mr-2">
                    {hold.orderId ? `Order #${hold.orderId}` : 'Escrow Hold'}
                  </Text>
                  {hold.referenceId && (
                    <Tooltip title={`Reference: ${hold.referenceId}`}>
                      <Text type="secondary" className="text-xs">
                        {hold.referenceId.substring(0, 8)}...
                      </Text>
                    </Tooltip>
                  )}
                </div>
              }
              description={
                <div className="space-y-1">
                  <div>
                    <Text type="secondary" className="text-xs">
                      Created {formatDistanceToNow(new Date(hold.createdAt))} ago
                    </Text>
                  </div>
                  {hold.releaseDate && (
                    <div>
                      <Text type="secondary" className="text-xs">
                        Scheduled release: {format(new Date(hold.releaseDate), 'MMM d, yyyy')}
                      </Text>
                    </div>
                  )}
                  {latestTransaction && (
                    <div>
                      <Text type="secondary" className="text-xs">
                        Last updated: {formatDistanceToNow(new Date(latestTransaction.createdAt))} ago
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
            {isActive && (
              <div className="mt-4 flex space-x-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handleRelease(hold.id)}
                  loading={actionLoading}
                  disabled={!isActive}
                >
                  Release
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() => handleRefund(hold.id)}
                  loading={actionLoading}
                  disabled={!isActive}
                >
                  Refund
                </Button>
              </div>
            )}
          </List.Item>
        );
      }}
    />
  );
}
