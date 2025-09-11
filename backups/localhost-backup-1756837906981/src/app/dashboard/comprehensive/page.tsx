interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: string;
  color?: string;
}

const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue' }: MetricCardProps) => ( 