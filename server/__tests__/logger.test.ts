import { Logger } from '../utils/logger';

describe('Logger', () => {
  it('should log info messages', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    Logger.info('Test info', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('[INFO]', 'Test info', { foo: 'bar' });
    spy.mockRestore();
  });

  it('should log warning messages', () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    Logger.warn('Test warn', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('[WARN]', 'Test warn', { foo: 'bar' });
    spy.mockRestore();
  });

  it('should log error messages', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    Logger.error('Test error', { foo: 'bar' });
    expect(spy).toHaveBeenCalledWith('[ERROR]', 'Test error', { foo: 'bar' });
    spy.mockRestore();
  });
});
