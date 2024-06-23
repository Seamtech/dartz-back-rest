import { Middleware, MiddlewareContext } from '@loopback/rest';
import { Next } from '@loopback/core';
import { Provider } from '@loopback/core';

export class LoggingMiddlewareProvider implements Provider<Middleware> {
  value(): Middleware {
    return async (middlewareCtx: MiddlewareContext, next: Next) => {
      const { request, response } = middlewareCtx;

      // Skip logging for the explorer endpoint
      if (request.url.startsWith('/explorer')) {
        return next();
      }

      console.log(`LoggingMiddleware - Before: ${request.method} ${request.url}`);

      try {
        await next();
      } catch (err) {
        console.error(`LoggingMiddleware - Error: ${err.message}`);
        // Ensure the response is not blocked by rethrowing the error
        throw err;
      }

      // Check if the headers are sent to avoid further processing
      if (!response.headersSent) {
        console.log(`LoggingMiddleware - After: ${response.statusCode}`);
        console.log(`LoggingMiddleware - Headers Sent: ${response.headersSent}`);
        console.log(`LoggingMiddleware - Response Finished: ${response.finished}`);

        // Log response headers
        const headers = response.getHeaders();
        console.log(`LoggingMiddleware - Response Headers: ${JSON.stringify(headers)}`);

        // Log response status message
        console.log(`LoggingMiddleware - Status Message: ${response.statusMessage}`);
      }
    };
  }
}
