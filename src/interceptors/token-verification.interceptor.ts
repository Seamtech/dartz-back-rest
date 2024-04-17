// src/interceptors/token-verification.interceptor.ts
import {inject} from '@loopback/context';
import {Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise} from '@loopback/core';
import {HttpErrors, Request, RestBindings} from '@loopback/rest';
import {JwtService} from '../services/authentication-strategies/jwt.service';

export class TokenAuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('services.JwtService') private jwtService: JwtService,
    @inject(RestBindings.Http.REQUEST) private request: Request
  ) { }

  value() {
    return this.intercept.bind(this);
  }

  async intercept(context: InvocationContext, next: () => ValueOrPromise<InvocationResult>): Promise<InvocationResult> {
    try {
      const token: string | undefined = this.extractTokenFromRequest(this.request);
      const userProfile = await this.jwtService.verifyToken(token);
      context.bind('userProfile').to(userProfile);
    } catch (error) {
      // Handle different types of errors
      if (error.message === 'Invalid Authorization Header') {
        throw new HttpErrors.Unauthorized('Authorization header is missing or not in the correct format.');
      } else if (error.name === 'JsonWebTokenError') {
        throw new HttpErrors.Unauthorized('Invalid token.');
      } else {
        // Log the error for debugging purposes and throw a generic 500 error
        console.error('Internal server error:', error);
        throw new HttpErrors.InternalServerError('Internal server error.');
      }
    }

    return next();
  }

  private extractTokenFromRequest(request: Request): string {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    throw new Error('Invalid Authorization Header');
  }
}
