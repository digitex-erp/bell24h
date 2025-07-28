import React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  useTheme
} from '@mui/material';
import { getSubcategoriesByCategoryId } from '../../config/categories';

interface SubcategoryFilterProps {
  categoryId: string;
  selectedSubcategory: string | null;
  onSubcategoryChange: (subcategory: string | null) => void;
}

const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({
  categoryId,
  selectedSubcategory,
  onSubcategoryChange
}) => {
  const theme = useTheme();
  const subcategories = getSubcategoriesByCategoryId(categoryId);

  const handleChange = (event: SelectChangeEvent) => {
    onSubcategoryChange(event.target.value || null);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter by Subcategory
      </Typography>
      
      <FormControl fullWidth>
        <InputLabel id="subcategory-filter-label">Subcategory</InputLabel>
        <Select
          labelId="subcategory-filter-label"
          id="subcategory-filter"
          value={selectedSubcategory || ''}
          label="Subcategory"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>All Subcategories</em>
          </MenuItem>
          {subcategories.map((subcategory) => (
            <MenuItem key={subcategory} value={subcategory}>
              {subcategory}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSubcategory && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`Filtered by: ${selectedSubcategory}`}
            onDelete={() => onSubcategoryChange(null)}
            color="primary"
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
};

export default SubcategoryFilter; 