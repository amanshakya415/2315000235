# Logging Middleware

This package provides a reusable `Log` function and request logging middleware for JavaScript/TypeScript applications.

## Usage

```js
import { Log, createRequestLogger } from './logging_middleware/index.js';

app.use(createRequestLogger());

await Log('backend', 'info', 'service', 'Notification service started');
```

## Environment

- `LOG_API_TOKEN` (optional): Bearer token sent in the `Authorization` header to the log API.
- `LOG_API_URL` (optional): Override the log API endpoint.
