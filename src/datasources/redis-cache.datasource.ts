// src/datasources/redis-cache.datasource.ts
import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const cacheConfig = {
  name: 'redisCache',
  connector: 'kv-redis',
  url: '',
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_CACHE_DB ?? '0', 10),
};

export class RedisCacheDataSource extends juggler.DataSource {
  static dataSourceName = 'redisCache';
  constructor() {
    super(cacheConfig);
    this.on('connected', () => {
      console.log('RedisCacheDataSource is connected');
    });
    this.on('disconnected', () => {
      console.log('RedisCacheDataSource is disconnected');
    });
  }
}
