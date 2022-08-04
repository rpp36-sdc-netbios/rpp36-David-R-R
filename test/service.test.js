describe('Checks for the test suite', () => {
  it('should be true', () => {
    expect(true).toBe(true);
  })
  it('should also pass', () => {
    expect(1).toBe(1);
  })
  it('should fail', () => {
    expect('dog').toBe('cat');
  })
  it('should also fail', () => {
    expect(2).toBe(1);
  })
});