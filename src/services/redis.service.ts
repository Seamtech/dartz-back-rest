// src/services/redis.service.ts
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';
import {promisify} from 'util';

@lifeCycleObserver('datasource')
export class RedisService implements LifeCycleObserver {
  queueClient: any;
  cacheClient: any;

  constructor(
    @inject('datasources.redisQueue') private dataSourceQ: juggler.DataSource,
    @inject('datasources.redisCache') private dataSourceC: juggler.DataSource,
  ) {
    this.queueClient = dataSourceQ.connector?.client;
    this.cacheClient = dataSourceC.connector?.client;
  }

  async start(): Promise<void> {
    // Lifecycle method for starting the service
  }

  async stop(): Promise<void> {
    // Disconnect the Redis clients when stopping the application
    if (this.queueClient) {
      const quitAsyncQ = promisify(this.queueClient.quit).bind(
        this.queueClient,
      );
      await quitAsyncQ();
    }
    if (this.cacheClient) {
      const quitAsyncC = promisify(this.cacheClient.quit).bind(
        this.cacheClient,
      );
      await quitAsyncC();
    }
  }

  async rpush(queueName: string, task: string): Promise<void> {
    const rpushAsync = promisify(this.queueClient.rpush).bind(this.queueClient);
    await rpushAsync(queueName, task);
  }

  async lpop(queueName: string): Promise<string | null> {
    const lpopAsync = promisify(this.queueClient.lpop).bind(this.queueClient);
    return await lpopAsync(queueName);
  }
}
