import { describe, expect, test } from 'vitest';

import { cn } from '@/lib/utils/cn';

describe('cn utility', () => {
  test('joins multiple class names', () => {
    expect(cn('class1', 'class2', 'class3')).toBe('class1 class2 class3');
  });

  test('filters out undefined values', () => {
    expect(cn('class1', undefined, 'class2')).toBe('class1 class2');
  });

  test('filters out null values', () => {
    expect(cn('class1', null, 'class2')).toBe('class1 class2');
  });

  test('filters out false values', () => {
    expect(cn('class1', false, 'class2')).toBe('class1 class2');
  });

  test('filters out all falsy values', () => {
    expect(cn('class1', undefined, null, false, 'class2')).toBe('class1 class2');
  });

  test('returns empty string when all values are falsy', () => {
    expect(cn(undefined, null, false)).toBe('');
  });

  test('returns empty string with no arguments', () => {
    expect(cn()).toBe('');
  });

  test('handles single class name', () => {
    expect(cn('single-class')).toBe('single-class');
  });

  test('filters out empty strings', () => {
    // Empty string is falsy in Boolean check, so it will be filtered
    expect(cn('class1', '', 'class2')).toBe('class1 class2');
  });

  test('handles mixed valid and falsy values', () => {
    const condition = false;
    expect(cn('base', condition && 'conditional', 'always')).toBe('base always');
  });

  test('handles conditional classes pattern', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('btn', isActive && 'active', isDisabled && 'disabled')).toBe('btn active');
  });
});
