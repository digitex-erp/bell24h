// Test to verify RFQ model import
describe('RFQ Model Import Test', () => {
  it('should import the RFQ model', () => {
    const { RFQ } = require('../../models/RFQModel');
    expect(RFQ).toBeDefined();
  });
});
