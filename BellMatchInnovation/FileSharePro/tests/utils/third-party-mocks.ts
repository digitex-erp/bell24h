
export const mockServices = {
  openai: jest.fn(),
  razorpay: jest.fn(),
  kredx: jest.fn(),
  shiprocket: jest.fn(),
  alphaVantage: jest.fn(),
  cloudinary: jest.fn(),
  napkinAI: jest.fn(),
  blockchain: jest.fn(),
  whisper: jest.fn()
};

export const setupThirdPartyMocks = async () => {
  jest.mock('@/services/openai-service', () => mockServices.openai);
  jest.mock('@/services/razorpay', () => mockServices.razorpay);
  jest.mock('@/services/kredx', () => mockServices.kredx);
  jest.mock('@/services/shiprocket', () => mockServices.shiprocket);
  jest.mock('@/services/alpha-vantage', () => mockServices.alphaVantage);
  jest.mock('@/services/cloudinary', () => mockServices.cloudinary);
  jest.mock('@/services/napkin-ai', () => mockServices.napkinAI);
  jest.mock('@/services/blockchain', () => mockServices.blockchain);
  jest.mock('@/services/whisper', () => mockServices.whisper);
};
