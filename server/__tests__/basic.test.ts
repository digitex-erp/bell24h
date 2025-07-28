describe('Basic Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async/await', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  it('should test object properties', () => {
    const obj = { a: 1, b: 2 };
    expect(obj).toHaveProperty('a');
    expect(obj.a).toBe(1);
  });
});
