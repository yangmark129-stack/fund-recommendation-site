import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = path.join(projectRoot, 'dist');

const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.ico', 'image/x-icon'],
]);

export function getContentType(filePath) {
  return contentTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}

export function resolveStaticFile(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = path.posix.normalize(decodedPath);

  if (decodedPath.includes('..') || normalizedPath.includes('..')) {
    return null;
  }

  const isAsset = normalizedPath.startsWith('/assets/');
  const requestedPath = isAsset ? normalizedPath.slice(1) : 'index.html';
  const filePath = path.join(distRoot, requestedPath);
  const relativePath = path.relative(distRoot, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return {
    contentType: getContentType(filePath),
    filePath,
  };
}
