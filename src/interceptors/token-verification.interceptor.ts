import { inject, Interceptor, InvocationContext, InvocationResult, Provider, ValueOrPromise } from '@loopback/core';
import { HttpErrors, Request, RestBindings } from '@loopback/rest';
import { TokenBlacklistedError, TokenExpiredError, TokenInvalidError } from '../errors/jwt-errors';
import { JwtService } from '../services/authentication-strategies/jwt.service';
import { parseCookies } from '../utils/cookie-parser';

const USER_PROFILE_KEY = 'userProfile';

export class TokenAuthorizationInterceptor implements Provider<Interceptor> {
  constructor(
    @inject('services.JwtService') private jwtService: JwtService,
    @inject(RestBindings.Http.REQUEST) private request: Request
  ) {}

  value() {
    return this.intercept.bind(this);
  }

  async intercept(context: InvocationContext, next: () => ValueOrPromise<InvocationResult>): Promise<InvocationResult> {
    console.log('Intercepting request for token authorization...');

    const token = this.extractAccessTokenFromRequest(this.request);
    if (!token) {
      console.log('Access token is missing.');
      throw new HttpErrors.Unauthorized('Access token is missing. Please log in again.');
    }

    console.log('Access token found:', token);

    try {
      const userProfile = await this.jwtService.verifyToken(token);
      console.log('Token verified successfully:', userProfile);
      context.bind('userProfile').to(userProfile);
    } catch (error) {
      console.error('Error during token verification:', error);
      if (error instanceof TokenBlacklistedError) {
        throw new HttpErrors.Unauthorized('The token is blacklisted. Please log in again.');
      } else if (error instanceof TokenExpiredError) {
        throw new HttpErrors.Unauthorized('The token has expired. Please log in again.');
      } else if (error instanceof TokenInvalidError) {
        throw new HttpErrors.Unauthorized('The token is invalid. Please log in again.');
      } else {
        throw new HttpErrors.InternalServerError('Internal server error.');
      }
    }

    return next();
  }

  private extractAccessTokenFromRequest(request: Request): string | undefined {
    console.log('Extracting access token from request...');
    const cookies = request.headers.cookie;
    if (cookies) {
      const accessToken = parseCookies(cookies)['accessToken'];
      if (accessToken) return accessToken;
    }

    const apiAccessToken = request.headers['x-api-access-token'] || '';
    if (apiAccessToken) {
      // return apiAccessToken;
    }

    return undefined;
  }
}
