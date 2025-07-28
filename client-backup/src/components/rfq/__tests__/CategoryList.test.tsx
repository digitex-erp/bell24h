import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CategoryList from '../CategoryList';
import { categories } from '../../../config/categories';

describe('CategoryList', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        {component}
      </BrowserRouter>
    );
  };

  it('renders all categories', () => {
    renderWithRouter(<CategoryList />);
    
    categories.forEach(category => {
      expect(screen.getByText(category.name)).toBeInTheDocument();
      expect(screen.getByText(category.description)).toBeInTheDocument();
    });
  });

  it('displays correct number of sample RFQs for each category', () => {
    renderWithRouter(<CategoryList />);
    
    categories.forEach(category => {
      const sampleText = `View ${category.mockupRFQs.length} sample RFQs`;
      expect(screen.getByText(sampleText)).toBeInTheDocument();
    });
  });

  it('renders category cards with correct styling', () => {
    renderWithRouter(<CategoryList />);
    
    const cards = screen.getAllByRole('button');
    expect(cards).toHaveLength(categories.length);
    
    cards.forEach(card => {
      expect(card).toHaveStyle({
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      });
    });
  });

  it('navigates to category page when clicked', () => {
    renderWithRouter(<CategoryList />);
    
    const firstCategory = categories[0];
    const firstCard = screen.getByText(firstCategory.name).closest('button');
    
    expect(firstCard).toHaveAttribute('href', `/rfq/category/${firstCategory.id}`);
  });
}); 