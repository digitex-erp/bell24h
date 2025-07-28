import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { Badge } from './badge';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

export const TrustBadges = () => {
  const { t } = useTranslation();

  const badges = [
    {
      icon: <Shield className="w-5 h-5" />,
      text: t('trust.secure'),
      delay: 0.2,
    },
    {
      icon: <Lock className="w-5 h-5" />,
      text: t('trust.encrypted'),
      delay: 0.3,
    },
    {
      icon: <Award className="w-5 h-5" />,
      text: t('trust.verified'),
      delay: 0.4,
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: t('trust.guaranteed'),
      delay: 0.5,
    },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: badge.delay }}
        >
          <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
            {badge.icon}
            <span>{badge.text}</span>
          </Badge>
        </motion.div>
      ))}
    </div>
  );
}; 