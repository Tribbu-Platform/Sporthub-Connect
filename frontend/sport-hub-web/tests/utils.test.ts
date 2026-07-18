import { describe, it, expect } from 'vitest';
import { cn, formatRelativeTime, truncate } from '@/lib/utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should filter falsy values', () => {
      expect(cn('foo', false, undefined, null, 'bar')).toBe('foo bar');
    });

    it('should return empty string for no inputs', () => {
      expect(cn()).toBe('');
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "ahora" for recent times', () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now)).toBe('ahora');
    });
  });

  describe('truncate', () => {
    it('should truncate long strings', () => {
      expect(truncate('Hello World', 8)).toBe('Hello...');
    });

    it('should not truncate short strings', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
  });
});
