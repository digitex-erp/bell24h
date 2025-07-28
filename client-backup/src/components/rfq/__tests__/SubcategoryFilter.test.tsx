import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SubcategoryFilter from '../SubcategoryFilter';
import { getSubcategoriesByCategoryId } from '../../../config/categories';

// Mock the getSubcategoriesByCategoryId function
jest.mock('../../../config/categories', () => ({
  getSubcategoriesByCategoryId: jest.fn()
}));

describe('SubcategoryFilter', () => {
  const mockSubcategories = ['Subcategory 1', 'Subcategory 2', 'Subcategory 3'];
  const mockOnSubcategoryChange = jest.fn();

  beforeEach(() => {
    (getSubcategoriesByCategoryId as jest.Mock).mockReturnValue(mockSubcategories);
  });

  it('renders subcategory filter with all options', () => {
    render(
      <SubcategoryFilter
        categoryId="test-category"
        selectedSubcategory={null}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    expect(screen.getByLabelText('Subcategory')).toBeInTheDocument();
    expect(screen.getByText('All Subcategories')).toBeInTheDocument();
    
    mockSubcategories.forEach(subcategory => {
      expect(screen.getByText(subcategory)).toBeInTheDocument();
    });
  });

  it('shows selected subcategory chip when a subcategory is selected', () => {
    const selectedSubcategory = 'Subcategory 1';
    
    render(
      <SubcategoryFilter
        categoryId="test-category"
        selectedSubcategory={selectedSubcategory}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    expect(screen.getByText(`Filtered by: ${selectedSubcategory}`)).toBeInTheDocument();
  });

  it('calls onSubcategoryChange when a subcategory is selected', () => {
    render(
      <SubcategoryFilter
        categoryId="test-category"
        selectedSubcategory={null}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    const select = screen.getByLabelText('Subcategory');
    fireEvent.mouseDown(select);
    
    const option = screen.getByText('Subcategory 1');
    fireEvent.click(option);

    expect(mockOnSubcategoryChange).toHaveBeenCalledWith('Subcategory 1');
  });

  it('calls onSubcategoryChange with null when chip is deleted', () => {
    render(
      <SubcategoryFilter
        categoryId="test-category"
        selectedSubcategory="Subcategory 1"
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    const deleteButton = screen.getByLabelText('delete');
    fireEvent.click(deleteButton);

    expect(mockOnSubcategoryChange).toHaveBeenCalledWith(null);
  });

  it('displays correct number of subcategories', () => {
    render(
      <SubcategoryFilter
        categoryId="test-category"
        selectedSubcategory={null}
        onSubcategoryChange={mockOnSubcategoryChange}
      />
    );

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(mockSubcategories.length + 1); // +1 for "All Subcategories"
  });
}); 