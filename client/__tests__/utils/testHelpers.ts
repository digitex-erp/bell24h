/**
 * Bell24H Comprehensive Test Helpers
 * Provides utility functions for consistent and efficient testing
 */

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

// Test data generators
export const generateTestData = {
  user: (overrides = {}) => ({
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@bell24h.com`,
    name: 'Test User',
    role: 'USER',
    companyName: 'Test Company',
    phone: '+91-9876543210',
    verified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  supplier: (overrides = {}) => ({
    id: `supplier-${Date.now()}`,
    companyName: 'Test Supplier Co.',
    contactName: 'John Supplier',
    email: `supplier-${Date.now()}@test.com`,
    phone: '+91-9876543210',
    location: 'Mumbai, India',
    rating: 4.5,
    verificationStatus: 'VERIFIED',
    categories: ['Electronics', 'Computers'],
    description: 'Leading supplier of electronics and computer components',
    yearEstablished: 2010,
    employeeCount: 50,
    ...overrides,
  }),

  rfq: (overrides = {}) => ({
    id: `rfq-${Date.now()}`,
    title: 'Test RFQ for Electronics',
    description: 'Looking for high-quality electronic components',
    category: 'Electronics',
    subCategory: 'Semiconductors',
    budget: 50000,
    quantity: 100,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    location: 'Delhi, India',
    status: 'ACTIVE',
    userId: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: `product-${Date.now()}`,
    name: 'Test Product',
    description: 'High-quality test product for electronics category',
    category: 'Electronics',
    subCategory: 'Components',
    price: 1500,
    currency: 'INR',
    minOrderQuantity: 10,
    supplierId: 'test-supplier-id',
    images: ['https://test-image-1.jpg', 'https://test-image-2.jpg'],
    specifications: {
      material: 'Silicon',
      warranty: '1 year',
      certification: 'ISO 9001',
    },
    status: 'ACTIVE',
    ...overrides,
  }),

  category: (overrides = {}) => ({
    id: `category-${Date.now()}`,
    name: 'Test Category',
    slug: 'test-category',
    description: 'Test category for Bell24H marketplace',
    icon: '💻',
    supplierCount: 1250,
    productCount: 15000,
    trending: true,
    growth: '+15%',
    ...overrides,
  }),

  apiResponse: (data: any, overrides = {}) => ({
    success: true,
    data,
    message: 'Operation successful',
    timestamp: new Date().toISOString(),
    ...overrides,
  }),

  errorResponse: (message = 'An error occurred', code = 'GENERAL_ERROR') => ({
    success: false,
    error: {
      code,
      message,
      details: 'Test error details',
    },
    timestamp: new Date().toISOString(),
  }),
};

// Form testing utilities
export const formTestUtils = {
  // Fill form inputs
  fillForm: async (formData: Record<string, any>) => {
    const user = userEvent.setup();

    for (const [fieldName, value] of Object.entries(formData)) {
      const field =
        screen.getByLabelText(new RegExp(fieldName, 'i')) ||
        screen.getByPlaceholderText(new RegExp(fieldName, 'i')) ||
        screen.getByDisplayValue('') ||
        screen.getByRole('textbox');

      if (field) {
        await user.clear(field);
        await user.type(field, String(value));
      }
    }
  },

  // Submit form
  submitForm: async (formTestId = 'form') => {
    const user = userEvent.setup();
    const submitButton =
      screen.getByRole('button', { name: /submit|save|create|update/i }) ||
      screen.getByTestId('submit-button');

    await user.click(submitButton);
  },

  // Validate form errors
  expectFormErrors: (errors: string[]) => {
    errors.forEach(error => {
      expect(screen.getByText(new RegExp(error, 'i'))).toBeInTheDocument();
    });
  },

  // Validate form success
  expectFormSuccess: (successMessage?: string) => {
    if (successMessage) {
      expect(screen.getByText(new RegExp(successMessage, 'i'))).toBeInTheDocument();
    } else {
      // Look for generic success indicators
      const successIndicators = screen.queryAllByText(/success|saved|created|updated/i);
      expect(successIndicators.length).toBeGreaterThan(0);
    }
  },
};

// Navigation testing utilities
export const navigationTestUtils = {
  // Test link navigation
  testLinkNavigation: async (linkText: string, expectedPath: string) => {
    const user = userEvent.setup();
    const link = screen.getByRole('link', { name: new RegExp(linkText, 'i') });

    expect(link).toHaveAttribute('href', expectedPath);
    await user.click(link);
  },

  // Test button click navigation
  testButtonNavigation: async (buttonText: string) => {
    const user = userEvent.setup();
    const button = screen.getByRole('button', { name: new RegExp(buttonText, 'i') });

    await user.click(button);
    return button;
  },

  // Test breadcrumb navigation
  testBreadcrumbs: (expectedBreadcrumbs: string[]) => {
    expectedBreadcrumbs.forEach(breadcrumb => {
      expect(screen.getByText(breadcrumb)).toBeInTheDocument();
    });
  },

  // Test menu functionality
  testMenuItems: async (menuItems: string[]) => {
    const user = userEvent.setup();

    for (const item of menuItems) {
      const menuItem =
        screen.getByRole('link', { name: new RegExp(item, 'i') }) ||
        screen.getByRole('button', { name: new RegExp(item, 'i') });

      expect(menuItem).toBeInTheDocument();
      expect(menuItem).toBeVisible();
    }
  },
};

// API testing utilities
export const apiTestUtils = {
  // Mock successful API response
  mockApiSuccess: (data: any) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(generateTestData.apiResponse(data)),
    });
  },

  // Mock API error response
  mockApiError: (message = 'API Error', status = 500) => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status,
      json: jest.fn().mockResolvedValue(generateTestData.errorResponse(message)),
    });
  },

  // Mock network error
  mockNetworkError: () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));
  },

  // Verify API call was made
  expectApiCall: (url: string, method = 'GET', body?: any) => {
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(url),
      expect.objectContaining({
        method,
        ...(body && { body: JSON.stringify(body) }),
      })
    );
  },

  // Wait for API call to complete
  waitForApiCall: async () => {
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  },
};

// Component testing utilities
export const componentTestUtils = {
  // Test component rendering
  renderWithProps: (Component: any, props = {}) => {
    return render(<Component {...props} />);
  },

  // Test component with user interactions
  testUserInteraction: async (
    testId: string,
    action: 'click' | 'type' | 'select',
    value?: string
  ) => {
    const user = userEvent.setup();
    const element = screen.getByTestId(testId);

    switch (action) {
      case 'click':
        await user.click(element);
        break;
      case 'type':
        if (value) await user.type(element, value);
        break;
      case 'select':
        if (value) await user.selectOptions(element, value);
        break;
    }

    return element;
  },

  // Test component loading states
  testLoadingState: (loadingTestId = 'loading') => {
    expect(screen.getByTestId(loadingTestId)).toBeInTheDocument();
  },

  // Test component error states
  testErrorState: (errorMessage: string) => {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  },

  // Test component empty states
  testEmptyState: (emptyMessage: string) => {
    expect(screen.getByText(new RegExp(emptyMessage, 'i'))).toBeInTheDocument();
  },

  // Test responsive behavior
  testResponsiveClasses: (testId: string, expectedClasses: string[]) => {
    const element = screen.getByTestId(testId);
    expectedClasses.forEach(className => {
      expect(element).toHaveClass(className);
    });
  },
};

// Accessibility testing utilities
export const accessibilityTestUtils = {
  // Test keyboard navigation
  testKeyboardNavigation: async (elements: string[]) => {
    const user = userEvent.setup();

    for (const elementId of elements) {
      const element = screen.getByTestId(elementId);
      await user.tab();
      expect(element).toHaveFocus();
    }
  },

  // Test ARIA attributes
  testAriaAttributes: (testId: string, attributes: Record<string, string>) => {
    const element = screen.getByTestId(testId);

    Object.entries(attributes).forEach(([attr, value]) => {
      expect(element).toHaveAttribute(attr, value);
    });
  },

  // Test screen reader content
  testScreenReaderContent: (content: string) => {
    expect(screen.getByText(content)).toBeInTheDocument();
  },

  // Test focus management
  testFocusManagement: async (focusableElements: string[]) => {
    const user = userEvent.setup();

    for (const elementId of focusableElements) {
      const element = screen.getByTestId(elementId);
      await user.click(element);
      expect(element).toHaveFocus();
    }
  },
};

// Performance testing utilities
export const performanceTestUtils = {
  // Measure component render time
  measureRenderTime: async (Component: any, props = {}) => {
    const startTime = performance.now();
    render(<Component {...props} />);
    const endTime = performance.now();

    return endTime - startTime;
  },

  // Test component re-render optimization
  testMemoization: (Component: any, props = {}) => {
    const renderSpy = jest.fn();
    const WrappedComponent = (wrappedProps: any) => {
      renderSpy();
      return <Component {...wrappedProps} />;
    };

    const { rerender } = render(<WrappedComponent {...props} />);
    expect(renderSpy).toHaveBeenCalledTimes(1);

    // Re-render with same props
    rerender(<WrappedComponent {...props} />);

    return renderSpy.mock.calls.length;
  },
};

// Bell24H specific testing utilities
export const bell24hTestUtils = {
  // Test Voice RFQ functionality
  mockVoiceRFQ: {
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    getTranscription: jest.fn().mockResolvedValue('Test voice transcription'),
    processVoiceRFQ: jest.fn().mockResolvedValue({
      category: 'Electronics',
      description: 'Voice processed RFQ',
      confidence: 0.95,
    }),
  },

  // Test AI categorization
  mockAICategorization: {
    categorizeRFQ: jest.fn().mockResolvedValue({
      category: 'Electronics',
      subCategory: 'Semiconductors',
      confidence: 0.98,
      reasoning: 'AI categorization based on keywords',
    }),
  },

  // Test supplier matching
  mockSupplierMatching: {
    findMatches: jest
      .fn()
      .mockResolvedValue([
        generateTestData.supplier({ rating: 4.8, matchScore: 0.95 }),
        generateTestData.supplier({ rating: 4.6, matchScore: 0.89 }),
        generateTestData.supplier({ rating: 4.4, matchScore: 0.85 }),
      ]),
  },

  // Test payment gateway
  mockPaymentGateway: {
    initializePayment: jest.fn().mockResolvedValue({
      orderId: 'order-123',
      paymentId: 'payment-456',
      signature: 'signature-789',
    }),
    verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
  },

  // Test file upload to Cloudinary
  mockCloudinaryUpload: {
    uploadImage: jest.fn().mockResolvedValue({
      public_id: 'test-image-id',
      secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
      width: 1920,
      height: 1080,
    }),
    uploadVideo: jest.fn().mockResolvedValue({
      public_id: 'test-video-id',
      secure_url: 'https://res.cloudinary.com/test/video/upload/test-video.mp4',
      duration: 30.5,
    }),
  },
};

// Test suite utilities
export const testSuiteUtils = {
  // Create test suite for component
  createComponentTestSuite: (Component: any, suiteName: string) => {
    describe(suiteName, () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      test('renders without crashing', () => {
        expect(() => render(<Component />)).not.toThrow();
      });

      test('renders with default props', () => {
        render(<Component />);
        expect(screen.getByTestId(suiteName.toLowerCase())).toBeInTheDocument();
      });
    });
  },

  // Create test suite for page
  createPageTestSuite: (PageComponent: any, pageName: string, requiredElements: string[]) => {
    describe(`${pageName} Page`, () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      test('page loads successfully', () => {
        render(<PageComponent />);
        expect(document.title).toBeDefined();
      });

      test('contains required elements', () => {
        render(<PageComponent />);
        requiredElements.forEach(element => {
          expect(screen.getByTestId(element)).toBeInTheDocument();
        });
      });

      test('is responsive', () => {
        render(<PageComponent />);
        const mainContent = screen.getByRole('main') || screen.getByTestId('main-content');
        expect(mainContent).toHaveClass(/responsive|container|max-w/);
      });
    });
  },
};

// Export all utilities
export {
  generateTestData,
  formTestUtils,
  navigationTestUtils,
  apiTestUtils,
  componentTestUtils,
  accessibilityTestUtils,
  performanceTestUtils,
  bell24hTestUtils,
  testSuiteUtils,
};
