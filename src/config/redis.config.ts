import { createClient, RedisClientType } from 'redis';

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

export async function initializeRedis(): Promise<void> {
  await redisClient.connect();
}

export { redisClient };
