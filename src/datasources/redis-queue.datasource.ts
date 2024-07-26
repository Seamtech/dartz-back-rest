import {juggler} from '@loopback/repository';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const queuesConfig = {
  name: 'redisQueue',
  connector: 'kv-redis',
  url: '',
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_QUEUES_DB ?? '1', 10),
};

export class RedisQueueDataSource extends juggler.DataSource {
  static dataSourceName = 'redisQueue';
  constructor() {
    super(queuesConfig);
    this.on('connected', () => {
      console.log('RedisQueueDataSource is connected');
    });
    this.on('disconnected', () => {
      console.log('RedisQueueDataSource is disconnected');
    });
  }
}
