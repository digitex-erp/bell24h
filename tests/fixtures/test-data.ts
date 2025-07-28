export const indianBusinessTestData = {
  validGSTNumbers: [
    '27AAAAA0000A1Z5', // Maharashtra
    '06AAAAA0000A1Z5', // Haryana
    '32AAAAA0000A1Z5', // Kerala
    '07AAAAA0000A1Z5', // Delhi
  ],

  invalidGSTNumbers: [
    '27AAAAA0000A1Z4', // Invalid checksum
    '99AAAAA0000A1Z5', // Invalid state code
    'INVALID_GST_123', // Invalid format
  ],

  businessEmails: [
    'ceo@relianceindustries.com',
    'procurement@tatasteel.com',
    'buyer@mahindragroup.com',
    'sourcing@wipro.com',
  ],

  testUsers: {
    buyer: {
      name: 'Rajesh Kumar',
      email: 'rajesh@testcompany.com',
      password: 'Test@12345',
      company: 'Test Industries Pvt Ltd',
      gst: '27AAAAA0000A1Z5',
      phone: '+919876543210',
    },
    supplier: {
      name: 'Priya Sharma',
      email: 'priya@suppliertest.com',
      password: 'Test@67890',
      company: 'Sharma Enterprises',
      gst: '06AAAAA0000A1Z5',
      phone: '+918765432109',
    },
    admin: {
      name: 'Admin User',
      email: 'admin@bell24h.com',
      password: 'Admin@12345',
    },
  },

  highValueTransactions: [
    { amount: 100000, description: 'Industrial Machinery Purchase' },
    { amount: 500000, description: 'Bulk Steel Order' },
    { amount: 1000000, description: 'Electronics Components Bulk Order' },
    { amount: 2500000, description: 'Textile Raw Materials' },
  ],

  rfqTestData: [
    {
      title: 'Industrial Steel Sheets',
      category: 'Mineral & Metals',
      subcategory: 'Steel',
      quantity: '1000 MT',
      specifications: 'Grade 304 Stainless Steel',
      budget: '₹25,00,000',
      deadline: '2025-08-15',
    },
    {
      title: 'Electronic Components',
      category: 'Electronics & Electrical',
      subcategory: 'Electronic Components',
      quantity: '5000 units',
      specifications: 'Microcontrollers ARM Cortex',
      budget: '₹10,00,000',
      deadline: '2025-07-30',
    },
  ],

  // Payment test data
  paymentTestData: {
    razorpayTestKey: 'rzp_test_1234567890',
    testOrderId: 'order_test_123456',
    testPaymentId: 'pay_test_123456',
    testAmount: 100000, // ₹1,00,000
    testCurrency: 'INR',
  },

  // GST invoice test data
  gstInvoiceData: {
    buyerGST: '27AAAAA0000A1Z5',
    supplierGST: '06AAAAA0000A1Z5',
    invoiceNumber: 'INV-2025-001',
    taxableAmount: 100000,
    cgst: 9000,
    sgst: 9000,
    igst: 0,
    totalAmount: 118000,
  },
};
