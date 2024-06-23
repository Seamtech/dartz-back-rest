import {BindingScope, injectable} from '@loopback/core';
import * as jwt from 'jsonwebtoken';
import {redisClient} from '../../config/redis.config';

@injectable({scope: BindingScope.SINGLETON})
export class TokenBlacklistService {
  async addTokenToBlacklist(token: string): Promise<void> {
    if (!token) {
      throw new Error('Token is required');
    }

    const decodedToken = jwt.decode(token) as jwt.JwtPayload;
    if (!decodedToken?.exp) {
      throw new Error('Invalid token');
    }

    const expiryTime = decodedToken.exp;
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = expiryTime - currentTime;

    await redisClient.setEx(token, ttl, 'blacklisted');
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await redisClient.get(token);
    return result === 'blacklisted';
  }
}
