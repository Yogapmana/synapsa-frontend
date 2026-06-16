import { describe, it, expect } from 'vitest';
import { stripLeadingH1 } from '../ModuleContent';

/**
 * Unit tests for the `stripLeadingH1` helper used by ModuleContent.
 *
 * Why this matters: the Module page had a bug where "Why Architecture
 * Matters" was rendered 3 times in a row (once in the topbar, once as
 * an explicit <h1> in the article body, and once as the markdown's
 * leading H1). The fix removed the explicit <h1> AND added this
 * guard to strip the leading H1 from the markdown if it matches the
 * topic title.
 */
describe('stripLeadingH1', () => {
  it('strips a leading H1 that exactly matches the title', () => {
    const input = '# Why Architecture Matters\n\nBody paragraph here.';
    const result = stripLeadingH1(input, 'Why Architecture Matters');
    expect(result).toBe('Body paragraph here.');
    expect(result.startsWith('#')).toBe(false);
  });

  it('matches the title case-insensitively', () => {
    const input = '# why architecture matters\n\nBody.';
    const result = stripLeadingH1(input, 'Why Architecture Matters');
    expect(result).toBe('Body.');
  });

  it('tolerates leading blank lines', () => {
    const input = '\n\n# Topic\n\nBody.';
    const result = stripLeadingH1(input, 'Topic');
    expect(result).toBe('Body.');
  });

  it('tolerates trailing whitespace on the H1 line', () => {
    const input = '# Topic   \n\nBody.';
    const result = stripLeadingH1(input, 'Topic');
    expect(result).toBe('Body.');
  });

  it('matches multi-word titles with mixed case', () => {
    const input = '# React Hooks Deep Dive\n\nBody.';
    const result = stripLeadingH1(input, 'react hooks deep dive');
    expect(result).toBe('Body.');
  });

  it('does NOT strip an H1 with different content', () => {
    const input = '# Different Heading\n\nBody.';
    const result = stripLeadingH1(input, 'Why Architecture Matters');
    expect(result).toBe(input);
  });

  it('does NOT strip H2 or H3 (only H1 — single #)', () => {
    const h2input = '## Why Architecture Matters\n\nBody.';
    expect(stripLeadingH1(h2input, 'Why Architecture Matters')).toBe(h2input);

    const h3input = '### Why Architecture Matters\n\nBody.';
    expect(stripLeadingH1(h3input, 'Why Architecture Matters')).toBe(h3input);
  });

  it('does NOT strip if the first line is not a heading at all', () => {
    const input = 'Why Architecture Matters\n\nBody.';
    expect(stripLeadingH1(input, 'Why Architecture Matters')).toBe(input);
  });

  it('returns the input unchanged when markdown is empty', () => {
    expect(stripLeadingH1('', 'Title')).toBe('');
    expect(stripLeadingH1(null, 'Title')).toBe(null);
    expect(stripLeadingH1(undefined, 'Title')).toBe(undefined);
  });

  it('returns the input unchanged when title is empty', () => {
    const input = '# Some Heading\n\nBody.';
    expect(stripLeadingH1(input, '')).toBe(input);
    expect(stripLeadingH1(input, null)).toBe(input);
  });

  it('strips H1 followed by heading-prefixed sub-sections', () => {
    const input = '# Topic\n\nIntro paragraph.\n\n## Sub-section\n\nDetails.';
    const result = stripLeadingH1(input, 'Topic');
    expect(result).toBe('Intro paragraph.\n\n## Sub-section\n\nDetails.');
    // The H2 must survive — only the H1 is stripped.
    expect(result).toContain('## Sub-section');
  });

  it('preserves content with only the leading H1 matching', () => {
    const input = '# Why Architecture Matters\n\n# Another H1\n\nBody.';
    const result = stripLeadingH1(input, 'Why Architecture Matters');
    // The first H1 is stripped, the second H1 stays.
    expect(result).toBe('# Another H1\n\nBody.');
  });
});
