// src/controllers/redis.controller.ts
import {inject} from '@loopback/core';
import {get, param, post, requestBody} from '@loopback/rest';
import {CacheModel} from '../models/Redis/redis-cache.model';
import {CacheRepository} from '../repositories/Redis/redis-cache.repository';
import {QueueRepository} from '../repositories/Redis/redis-queue.repository';
import {RedisService} from '../services/redis.service';

export class RedisController {
  constructor(
    @inject('repositories.CacheRepository')
    private cacheRepository: CacheRepository,
    @inject('repositories.QueueRepository')
    private queueRepository: QueueRepository,
    @inject('services.RedisService') private redisService: RedisService,
  ) {}

  // Endpoint to cache data
  @post('/cache')
  async cacheData(
    @requestBody() cacheData: {key: string; value: object},
  ): Promise<object> {
    const serializedValue = JSON.stringify(cacheData.value);
    const cacheEntry = new CacheModel({
      key: cacheData.key,
      value: serializedValue,
    });
    await this.cacheRepository.set(cacheData.key, cacheEntry);
    return {message: `Data cached with key: ${cacheData.key}`};
  }

  // Endpoint to get cached data
  @get('/cache/{key}')
  async getCacheData(@param.path.string('key') key: string): Promise<object> {
    const cacheEntry = await this.cacheRepository.get(key);
    const value = cacheEntry ? JSON.parse(cacheEntry.value) : null;
    return {key, value};
  }

  // Endpoint to queue data
  @post('/queue')
  async queueData(
    @requestBody() queueData: {queueName: string; task: object},
  ): Promise<object> {
    const serializedTask = JSON.stringify(queueData.task);
    await this.redisService.rpush(queueData.queueName, serializedTask);
    return {message: `Task added to queue: ${queueData.queueName}`};
  }

  // Endpoint to get and process the next task in the queue
  @post('/process-queue')
  async processQueue(
    @requestBody() processQueueData: {queueName: string},
  ): Promise<object> {
    const serializedTask = await this.redisService.lpop(
      processQueueData.queueName,
    );
    if (serializedTask) {
      const task = JSON.parse(serializedTask);
      // Process current task
      console.log(`Processing task from queue: ${processQueueData.queueName}`);
      console.log('Task details:', task);
      return {
        message: `Processed task from queue: ${processQueueData.queueName}`,
      };
    } else {
      return {message: `No tasks in queue: ${processQueueData.queueName}`};
    }
  }
}
