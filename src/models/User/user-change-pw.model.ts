import {Model, model, property} from '@loopback/repository';

@model()
export class UserChangePW extends Model {
  @property({
    type: 'number',
    required: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  currentPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  newPassword: string;
}
