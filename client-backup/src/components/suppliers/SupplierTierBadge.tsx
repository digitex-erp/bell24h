// src/components/suppliers/SupplierTierBadge.tsx
import React from 'react';
import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { SupplierTier, getTierColor, getTierBenefits } from '../../utils/supplierRatingService.js';

interface SupplierTierBadgeProps {
  tier: SupplierTier;
  size?: 'small' | 'medium';
  showTooltip?: boolean;
}

const SupplierTierBadge: React.FC<SupplierTierBadgeProps> = ({ 
  tier, 
  size = 'medium',
  showTooltip = true
}) => {
  const tierColor = getTierColor(tier);
  const tierName = tier.charAt(0).toUpperCase() + tier.slice(1);
  const tierBenefits = getTierBenefits(tier);
  
  const badge = (
    <Chip 
      label={tierName} 
      size={size} 
      sx={{ 
        backgroundColor: tierColor,
        color: tier === SupplierTier.GOLD ? '#000' : '#fff',
        fontWeight: 'bold',
        '& .MuiChip-label': {
          px: size === 'small' ? 1 : 1.5
        }
      }}
    />
  );
  
  if (!showTooltip) {
    return badge;
  }
  
  return (
    <Tooltip
      title={
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {tierName} Tier Benefits
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {tierBenefits.slice(0, 5).map((benefit, index) => (
              <li key={index}>
                <Typography variant="body2">{benefit}</Typography>
              </li>
            ))}
            {tierBenefits.length > 5 && (
              <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                +{tierBenefits.length - 5} more benefits
              </Typography>
            )}
          </ul>
        </Box>
      }
      arrow
      placement="top"
    >
      {badge}
    </Tooltip>
  );
};

export default SupplierTierBadge;
