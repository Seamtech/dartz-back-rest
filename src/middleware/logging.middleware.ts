import {Middleware, MiddlewareContext} from '@loopback/rest';
import {Next} from '@loopback/core';
import {LOGGER_BINDING} from '../application'; // Import the binding key for the logger
import {Logger} from '../logging/logger';

const LogMiddleware: Middleware = async (requestCtx: MiddlewareContext, next: Next) => {
  const {request, response} = requestCtx;
  const start = Date.now();

  // Ensure logger is bound to context and retrieve it
  const logger: Logger = await requestCtx.get<Logger>(LOGGER_BINDING);

  // Logging the incoming request
  logger.info('request', request.method, request.url, null, null, `Request: ${request.method} ${request.url}`, {
    headers: request.headers,
    body: request.body,
  });

  try {
    // Proceed with the next middleware
    await next();
    
    const duration = Date.now() - start;
    // Logging the outgoing response
    logger.info('response', request.method, request.url, response.statusCode, duration, `Response: ${request.method} ${request.url}`, {
      statusCode: response.statusCode,
      duration,
      headers: response.getHeaders(),
    });
  } catch (err) {
    const duration = Date.now() - start;
    const statusCode = response.statusCode || 500;

    // Logging error details
    logger.error('error', request.method, request.url, statusCode, duration, `Error: ${request.method} ${request.url}`, {
      statusCode,
      duration,
      headers: response.getHeaders(),
      error: err,
    });

    throw err; // Rethrow the error for further handling
  }
};

export {LogMiddleware};
