import { 
  formatCurrency, 
  formatCompactNumber, 
  calculatePercentageChange,
  formatPercentageChange,
  hasPermission,
  cn 
} from '../utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(1000.50)).toBe('₹1,000.5');
      expect(formatCurrency(0)).toBe('₹0');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format numbers correctly', () => {
      expect(formatCompactNumber(999)).toBe('999');
      expect(formatCompactNumber(1000)).toBe('1.0K');
      expect(formatCompactNumber(1500)).toBe('1.5K');
      expect(formatCompactNumber(1000000)).toBe('1.0M');
      expect(formatCompactNumber(1000000000)).toBe('1.0B');
    });
  });

  describe('calculatePercentageChange', () => {
    it('should calculate percentage change correctly', () => {
      expect(calculatePercentageChange(120, 100)).toBe(20);
      expect(calculatePercentageChange(80, 100)).toBe(-20);
      expect(calculatePercentageChange(100, 0)).toBe(100);
      expect(calculatePercentageChange(0, 100)).toBe(-100);
    });
  });

  describe('formatPercentageChange', () => {
    it('should format percentage change with sign', () => {
      expect(formatPercentageChange(20)).toBe('+20.0');
      expect(formatPercentageChange(-20)).toBe('-20.0');
      expect(formatPercentageChange(0)).toBe('+0.0');
    });
  });

  describe('hasPermission', () => {
    it('should check permissions correctly', () => {
      expect(hasPermission('buyer', ['buyer'])).toBe(true);
      expect(hasPermission('seller', ['buyer'])).toBe(false);
      expect(hasPermission('both', ['buyer'])).toBe(true);
      expect(hasPermission('buyer', ['any'])).toBe(true);
    });
  });

  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2')).toBe('class1');
    });
  });
});