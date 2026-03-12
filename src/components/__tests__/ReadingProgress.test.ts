import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentPath = resolve(__dirname, '..', 'ReadingProgress.astro');
const source = readFileSync(componentPath, 'utf-8');

// Extract the contents between <script> and </script>
const scriptMatch = source.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch?.[1] ?? '';

describe('ReadingProgress.astro — script block regression', () => {
  it('contains a <script> block', () => {
    expect(script.length).toBeGreaterThan(0);
  });

  it('defines the cleanup function', () => {
    // Must be a function declaration, not just a call like cleanup()
    expect(script).toMatch(/function\s+cleanup\s*\(/);
  });

  it('defines the init function', () => {
    expect(script).toMatch(/function\s+init\s*\(/);
  });

  it('calls init() at the top level of the script', () => {
    // init() must appear as a standalone call outside any function body.
    // We verify it exists on a line by itself (with optional whitespace),
    // and is NOT inside the cleanup() or init() function definitions.
    // A simple approach: split on function boundaries and check the
    // top-level tail (everything after the last function closing brace).
    const lines = script.split('\n');

    // Find lines that are top-level init() calls — not inside a function.
    // We track brace depth to know when we're at the top level.
    let depth = 0;
    let hasTopLevelInitCall = false;

    for (const line of lines) {
      for (const ch of line) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      // At top level (depth 0), check for a standalone init() call
      if (depth === 0 && /^\s*init\s*\(\s*\)\s*;?\s*$/.test(line)) {
        hasTopLevelInitCall = true;
      }
    }

    expect(hasTopLevelInitCall).toBe(true);
  });

  it('registers astro:after-swap listener with init', () => {
    expect(script).toMatch(
      /document\.addEventListener\(\s*['"]astro:after-swap['"]\s*,\s*init\s*\)/,
    );
  });

  it('registers astro:before-swap listener with cleanup', () => {
    expect(script).toMatch(
      /document\.addEventListener\(\s*['"]astro:before-swap['"]\s*,\s*cleanup\s*\)/,
    );
  });
});
