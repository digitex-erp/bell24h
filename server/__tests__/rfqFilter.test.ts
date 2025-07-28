// Test the RFQ filter logic
describe('RFQ Filter Logic', () => {
  // Test data
  const mockRFQs = [
    {
      id: '1',
      status: 'submitted',
      price: 500,
      productCategory: 'Electronics',
      createdAt: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      status: 'approved',
      price: 1200,
      productCategory: 'Furniture',
      createdAt: '2023-02-20T00:00:00Z'
    }
  ];

  it('should filter RFQs by status', () => {
    const filtered = mockRFQs.filter(rfq => rfq.status === 'submitted');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });

  it('should filter RFQs by price range', () => {
    const minPrice = 1000;
    const filtered = mockRFQs.filter(rfq => rfq.price >= minPrice);
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('2');
  });

  it('should filter RFQs by category', () => {
    const category = 'Electronics';
    const filtered = mockRFQs.filter(rfq =>
      rfq.productCategory.toLowerCase() === category.toLowerCase()
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('1');
  });
});