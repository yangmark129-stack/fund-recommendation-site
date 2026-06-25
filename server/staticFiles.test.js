import { describe, expect, test } from 'vitest';
import { getContentType, resolveStaticFile } from './staticFiles.mjs';

describe('resolveStaticFile', () => {
  test('serves the app shell for root and client-side detail routes', () => {
    expect(resolveStaticFile('/').filePath.endsWith('/dist/index.html')).toBe(true);
    expect(resolveStaticFile('/fund/515070').filePath.endsWith('/dist/index.html')).toBe(true);
  });

  test('serves concrete static assets from dist', () => {
    expect(resolveStaticFile('/assets/index.js').filePath.endsWith('/dist/assets/index.js')).toBe(true);
  });

  test('rejects path traversal attempts', () => {
    expect(resolveStaticFile('/../package.json')).toBeNull();
    expect(resolveStaticFile('/assets/../../package.json')).toBeNull();
  });
});

describe('getContentType', () => {
  test('returns common content types for production assets', () => {
    expect(getContentType('/dist/index.html')).toBe('text/html; charset=utf-8');
    expect(getContentType('/dist/assets/app.css')).toBe('text/css; charset=utf-8');
    expect(getContentType('/dist/assets/app.js')).toBe('text/javascript; charset=utf-8');
  });
});
