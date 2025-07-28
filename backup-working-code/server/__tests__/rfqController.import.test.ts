// Simple test to verify controller import
describe('RFQ Controller Import Test', () => {
  it('should import the controller', () => {
    const controller = require('../controllers/rfqController');
    expect(controller).toBeDefined();
    expect(controller.getFilteredRFQs).toBeInstanceOf(Function);
  });
});
