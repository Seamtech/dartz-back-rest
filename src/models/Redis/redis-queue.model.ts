import {Entity, model, property} from '@loopback/repository';

@model()
export class QueueModel extends Entity {
  @property({type: 'string', id: true})
  key: string;

  @property({type: 'string'})
  value: string;

  constructor(data?: Partial<QueueModel>) {
    super(data);
  }
}
