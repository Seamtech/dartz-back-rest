import { AuthenticationStrategy } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { HttpErrors, Request } from '@loopback/rest';
import { securityId, UserProfile } from '@loopback/security';

export class ApiKeyStrategy implements AuthenticationStrategy {
  name = 'apiKey';

  constructor(@inject('authentication.apiKey') private apiKey: string) {}

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const clientApiKey = request.headers['x-api-key'];
    if (clientApiKey === this.apiKey) {
      // Create a minimal user profile object
      const userProfile: UserProfile = {[securityId]: 'apiKeyUser', name: 'API User'};
      return userProfile;
    } else {
      throw new HttpErrors.Unauthorized('Invalid API key');
    }
  }
}