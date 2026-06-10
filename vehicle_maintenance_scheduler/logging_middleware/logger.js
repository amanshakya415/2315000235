const VALID_STACKS = ['backend', 'frontend'];
const VALID_LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];
const VALID_PACKAGES = {
  backend: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service', 'auth', 'config', 'middleware', 'utils']
};
const DEFAULT_LOG_URL = 'http://4.224.186.213/evaluation-service/logs';

function validateLogInput(stack, level, packageName, message) {
  if (typeof stack !== 'string' || stack !== 'backend') {
    throw new TypeError(`Invalid stack: ${stack}. Only allowed value: backend`);
  }
  if (typeof level !== 'string' || !VALID_LEVELS.includes(level)) {
    throw new TypeError(`Invalid level: ${level}. Allowed values: ${VALID_LEVELS.join(', ')}`);
  }
  if (typeof packageName !== 'string' || !VALID_PACKAGES.backend.includes(packageName)) {
    throw new TypeError(`Invalid package: ${packageName}. Allowed backend values: ${VALID_PACKAGES.backend.join(', ')}`);
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    throw new TypeError('Message must be a non-empty string.');
  }
}

function buildPayload(stack, level, packageName, message) {
  return {
    stack,
    level,
    package: packageName,
    message
  };
}

function getLogApiToken() {
  return process.env.LOG_API_TOKEN || process.env.LOG_API_KEY || null;
}

function getLogApiUrl() {
  return process.env.LOG_API_URL || DEFAULT_LOG_URL;
}

async function sendLog(payload) {
  const url = getLogApiUrl();
  const headers = {
    'Content-Type': 'application/json'
  };

  const token = getLogApiToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Log API request failed (${response.status}): ${text}`);
    }

    return response.json();
  } catch (error) {
    console.error('Logging middleware failed to send log:', error.message);
    return null;
  }
}

export async function Log(stack, level, packageName, message) {
  validateLogInput(stack, level, packageName, message);

  const payload = buildPayload(stack, level, packageName, message);
  return sendLog(payload);
}

export function createRequestLogger(options = {}) {
  const { includeHeaders = false } = options;

  return function requestLogger(req, res, next) {
    const start = Date.now();
    const baseMessage = `Incoming request ${req.method} ${req.originalUrl}`;

    Log('backend', 'info', 'middleware', `${baseMessage}`);

    if (includeHeaders) {
      const headers = { ...req.headers };
      Log('backend', 'debug', 'middleware', `Request headers for ${req.method} ${req.originalUrl}: ${JSON.stringify(headers)}`);
    }

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      Log('backend', 'info', 'middleware', `Request ${req.method} ${req.originalUrl} completed with status ${res.statusCode} in ${durationMs}ms`);
    });

    next();
  };
}
