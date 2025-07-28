// src/components/suppliers/SuppliersList.tsx
import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Business as BusinessIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { Supplier, SupplierTier, getTierColor } from '../../utils/supplierRatingService.js';

interface SuppliersListProps {
  suppliers: Supplier[];
  onSelectSupplier: (supplier: Supplier) => void;
  selectedSupplierId?: string;
}

const SuppliersList: React.FC<SuppliersListProps> = ({ 
  suppliers, 
  onSelectSupplier,
  selectedSupplierId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>(suppliers);

  React.useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier => 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.categories.some(category => 
          category.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredSuppliers(filtered);
    }
  }, [searchTerm, suppliers]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getTierBadge = (tier: SupplierTier) => {
    const tierColor = getTierColor(tier);
    
    return (
      <Chip 
        label={tier.charAt(0).toUpperCase() + tier.slice(1)} 
        size="small" 
        sx={{ 
          backgroundColor: tierColor,
          color: tier === SupplierTier.GOLD ? '#000' : '#fff',
          fontWeight: 'bold',
          '& .MuiChip-label': {
            px: 1
          }
        }}
      />
    );
  };

  const renderRatingStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <StarIcon key={i} fontSize="small" sx={{ color: '#FFD700' }} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <StarIcon key={i} fontSize="small" sx={{ color: '#FFD700', opacity: 0.5 }} />
        );
      } else {
        stars.push(
          <StarBorderIcon key={i} fontSize="small" sx={{ color: '#FFD700' }} />
        );
      }
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {stars}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search suppliers by name or category..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {filteredSuppliers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No suppliers found matching your search criteria.
          </Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: '600px', overflow: 'auto' }}>
          {filteredSuppliers.map((supplier, index) => (
            <React.Fragment key={supplier.id}>
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  cursor: 'pointer',
                  backgroundColor: selectedSupplierId === supplier.id ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
                onClick={() => onSelectSupplier(supplier)}
              >
                <ListItemAvatar>
                  <Avatar 
                    alt={supplier.name} 
                    src={supplier.logo}
                    sx={{ 
                      border: `2px solid ${getTierColor(supplier.rating.tier)}`,
                      bgcolor: supplier.logo ? 'transparent' : 'primary.main'
                    }}
                  >
                    {!supplier.logo && <BusinessIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle1" component="span">
                        {supplier.name}
                      </Typography>
                      {getTierBadge(supplier.rating.tier)}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.primary"
                        component="span"
                        sx={{ display: 'block' }}
                      >
                        {supplier.categories.join(', ')}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        {renderRatingStars(supplier.rating.overallScore)}
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                          {supplier.rating.totalOrders} orders
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < filteredSuppliers.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default SuppliersList;
