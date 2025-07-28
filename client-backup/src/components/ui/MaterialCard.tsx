import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, styled } from '@mui/material';

export interface MaterialCardProps extends MuiCardProps {
  hoverEffect?: boolean;
  variant?: 'elevation' | 'outlined';
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== 'hoverEffect',
})<MaterialCardProps>(({ theme, hoverEffect = false, variant = 'elevation' }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  transition: theme.transitions.create(['box-shadow', 'transform'], {
    duration: theme.transitions.duration.shorter,
  }),
  ...(variant === 'elevation' && {
    boxShadow: theme.shadows[2],
    '&:hover': hoverEffect ? {
      boxShadow: theme.shadows[8],
      transform: 'translateY(-4px)',
    } : {},
  }),
  ...(variant === 'outlined' && {
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': hoverEffect ? {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    } : {},
  }),
  '& .MuiCardHeader-root': {
    padding: theme.spacing(2, 3, 0, 3),
  },
  '& .MuiCardContent-root': {
    padding: theme.spacing(3),
    '&:last-child': {
      paddingBottom: theme.spacing(3),
    },
  },
  '& .MuiCardActions-root': {
    padding: theme.spacing(1, 3, 3, 3),
  },
}));

const MaterialCard: React.FC<MaterialCardProps> = ({
  children,
  hoverEffect = false,
  variant = 'elevation',
  ...props
}) => {
  return (
    <StyledCard hoverEffect={hoverEffect} variant={variant} {...props}>
      {children}
    </StyledCard>
  );
};

export default MaterialCard;
