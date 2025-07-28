import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CategoryRFQs from '../CategoryRFQs';
import { categories } from '../../../config/categories';
import { rfqService } from '../../../services/rfq/RFQService';

// Mock the rfqService
jest.mock('../../../services/rfq/RFQService');

describe('CategoryRFQs', () => {
  const mockCategory = categories[0];
  const mockRFQs = mockCategory.mockupRFQs;

  beforeEach(() => {
    (rfqService.getMockupRFQs as jest.Mock).mockResolvedValue(mockRFQs);
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={component} />
        </Routes>
      </BrowserRouter>
    );
  };

  it('renders loading state initially', () => {
    renderWithRouter(<CategoryRFQs />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders category name and description', async () => {
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      expect(screen.getByText(mockCategory.name)).toBeInTheDocument();
      expect(screen.getByText(mockCategory.description)).toBeInTheDocument();
    });
  });

  it('renders all RFQs for the category', async () => {
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      mockRFQs.forEach(rfq => {
        expect(screen.getByText(rfq.title)).toBeInTheDocument();
        expect(screen.getByText(rfq.description)).toBeInTheDocument();
      });
    });
  });

  it('displays RFQ details correctly', async () => {
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      const firstRFQ = mockRFQs[0];
      
      // Check basic details
      expect(screen.getByText(firstRFQ.title)).toBeInTheDocument();
      expect(screen.getByText(firstRFQ.description)).toBeInTheDocument();
      
      // Check quantity and unit
      expect(screen.getByText(`Quantity: ${firstRFQ.quantity} ${firstRFQ.unit}`)).toBeInTheDocument();
      
      // Check timeline
      expect(screen.getByText(`Timeline: ${firstRFQ.timeline}`)).toBeInTheDocument();
      
      // Check location
      const locationText = firstRFQ.location.city 
        ? `${firstRFQ.location.city}, ${firstRFQ.location.country}`
        : firstRFQ.location.country;
      expect(screen.getByText(`Location: ${locationText}`)).toBeInTheDocument();
      
      // Check specifications
      firstRFQ.specifications.forEach(spec => {
        expect(screen.getByText(spec)).toBeInTheDocument();
      });
    });
  });

  it('handles error state', async () => {
    (rfqService.getMockupRFQs as jest.Mock).mockRejectedValue(new Error('Failed to load RFQs'));
    
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load RFQs')).toBeInTheDocument();
    });
  });

  it('shows create RFQ button', async () => {
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      expect(screen.getByText('Create New RFQ')).toBeInTheDocument();
    });
  });

  it('displays status chip for each RFQ', async () => {
    renderWithRouter(<CategoryRFQs />);
    
    await waitFor(() => {
      mockRFQs.forEach(rfq => {
        const statusChip = screen.getByText(rfq.status);
        expect(statusChip).toBeInTheDocument();
        expect(statusChip).toHaveClass(`MuiChip-color${rfq.status === 'open' ? 'Success' : 'Default'}`);
      });
    });
  });
}); 