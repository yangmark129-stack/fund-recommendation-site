import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { URL } from 'node:url';
import { funds, hotTopics } from '../src/data/funds.js';
import { enrichFunds } from './fundLiveData.mjs';
import { resolveStaticFile } from './staticFiles.mjs';

const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 8787);
const HOST = process.env.HOST ?? (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const CACHE_TTL_MS = 60 * 1000;

let fundsCache = {
  expiresAt: 0,
  payload: null,
};

const normalize = (value) => String(value ?? '').trim().toLowerCase();

const filterFunds = (items, keyword = '') => {
  const query = normalize(keyword);
  if (!query) {
    return items;
  }

  return items.filter((fund) =>
    normalize(
      [
        fund.name,
        fund.code,
        fund.type,
        fund.manager,
        fund.reason,
        fund.description,
        ...(fund.hotTags ?? []),
        ...(fund.holdings ?? []),
        ...(fund.liveTags ?? []),
      ].join(' '),
    ).includes(query),
  );
};

const sendJson = (response, statusCode, payload) => {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
};

const sendStaticFile = async (request, response, pathname) => {
  const staticFile = resolveStaticFile(pathname);
  if (!staticFile) {
    sendJson(response, 404, { message: 'Not Found' });
    return;
  }

  try {
    const fileStat = await stat(staticFile.filePath);
    response.writeHead(200, {
      'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Length': fileStat.size,
      'Content-Type': staticFile.contentType,
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }
    createReadStream(staticFile.filePath).pipe(response);
  } catch {
    sendJson(response, 404, { message: 'Not Found' });
  }
};

const getFundsPayload = async () => {
  if (fundsCache.payload && Date.now() < fundsCache.expiresAt) {
    return fundsCache.payload;
  }

  const fetchedAt = new Date().toISOString();

  try {
    const liveFunds = await enrichFunds(funds);
    fundsCache = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      payload: {
        funds: liveFunds,
        hotTopics,
        meta: {
          source: 'live',
          sourceLabel: '天天基金/东方财富实时接口',
          fetchedAt,
          cacheTtlMs: CACHE_TTL_MS,
        },
      },
    };
  } catch (error) {
    fundsCache = {
      expiresAt: Date.now() + 15 * 1000,
      payload: {
        funds,
        hotTopics,
        meta: {
          source: 'fallback',
          sourceLabel: '本地主题池',
          fetchedAt,
          error: error.message,
        },
      },
    };
  }

  return fundsCache.payload;
};

export const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    sendJson(response, 204, {});
    return;
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    sendJson(response, 405, { message: 'Method Not Allowed' });
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  try {
    if (url.pathname === '/api/health') {
      sendJson(response, 200, { ok: true });
      return;
    }

    if (url.pathname === '/api/funds') {
      const payload = await getFundsPayload();
      sendJson(response, 200, payload);
      return;
    }

    if (url.pathname === '/api/funds/search') {
      const payload = await getFundsPayload();
      sendJson(response, 200, {
        ...payload,
        funds: filterFunds(payload.funds, url.searchParams.get('keyword')),
      });
      return;
    }

    const fundMatch = url.pathname.match(/^\/api\/funds\/(\d{6})$/);
    if (fundMatch) {
      const payload = await getFundsPayload();
      const fund = payload.funds.find((item) => item.code === fundMatch[1]);
      sendJson(response, fund ? 200 : 404, fund ? { fund, meta: payload.meta } : { message: '基金不存在' });
      return;
    }

    await sendStaticFile(request, response, url.pathname);
  } catch (error) {
    sendJson(response, 500, { message: error.message });
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(PORT, HOST, () => {
    console.log(`Fund site listening at http://${HOST}:${PORT}`);
  });
}
