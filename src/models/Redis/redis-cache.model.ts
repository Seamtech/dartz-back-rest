import {Entity, model, property} from '@loopback/repository';

@model()
export class CacheModel extends Entity {
  @property({type: 'string', id: true})
  key: string;

  @property({type: 'string'})
  value: string;

  constructor(data?: Partial<CacheModel>) {
    super(data);
  }
}
