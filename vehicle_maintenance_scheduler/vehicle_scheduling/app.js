import http from 'http';
import { scheduleTasksForDepot } from './scheduler.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const TOKEN = process.env.EVAL_API_TOKEN || process.env.API_TOKEN || null;

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body, 'utf8')
  });
  res.end(body);
}

function parseQueryParams(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  return url.searchParams;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/schedule') {
    const params = parseQueryParams(req);
    const depotId = Number(params.get('depotId'));

    if (!depotId || !Number.isFinite(depotId)) {
      return sendJson(res, 400, { error: 'Invalid or missing depotId query parameter.' });
    }

    if (!TOKEN) {
      return sendJson(res, 401, { error: 'Missing API token. Set EVAL_API_TOKEN or API_TOKEN.' });
    }

    try {
      const schedule = await scheduleTasksForDepot(depotId, TOKEN);
      return sendJson(res, 200, schedule);
    } catch (error) {
      return sendJson(res, 502, { error: error.message });
    }
  }

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { status: 'ok', service: 'vehicle_scheduling' });
  }

  sendJson(res, 404, { error: 'Route not found' });
});

server.listen(PORT, () => {
  console.log(`Vehicle scheduling service listening on http://localhost:${PORT}`);
});
