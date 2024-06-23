import { Middleware, MiddlewareContext } from '@loopback/rest';
import { inject, Provider } from '@loopback/core';
import { AuthenticateFn, AuthenticationBindings } from '@loopback/authentication';

export class AuthenticationMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  value(): Middleware {
    return async (middlewareCtx: MiddlewareContext, next: Function) => {
      const { request } = middlewareCtx;
      console.log(`AuthenticationMiddleware - Authenticating request: ${request.method} ${request.url}`);
      await this.authenticateRequest(request);
      await next();
      console.log(`AuthenticationMiddleware - Authenticated request: ${request.method} ${request.url}`);
    };
  }
}
