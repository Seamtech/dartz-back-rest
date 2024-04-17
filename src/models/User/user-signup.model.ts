import {Model, model, property} from '@loopback/repository';

@model()
export class UserSignup extends Model {
  // Fields from User model
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  
  // Fields from UserProfiles model (assuming they are required)
  @property({
    type: 'string',
    required: true,
  })
  firstName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'string',
    required: false,
  })
  mobileNumber?: string;

  @property({
    type: 'string',
    required: true,
  })
  address1: string;

  @property({
    type: 'string',
    required: false,
  })
  address2: string;

  @property({
    type: 'string',
    required: true,
  })
  city: string;

  @property({
    type: 'string',
    required: true,
  })
  state: string;

  @property({
    type: 'string',
    required: true,
  })
  zip: string;

  @property({
    type: 'string',
    required: false,
  })
  bsLiveCode?: string;

  @property({
    type: 'string',
    required: false,
  })
  location: number;
  // Add other required fields from UserProfiles...
  
  // Fields from UserStatistics model (assuming some required fields)
  // Add required fields from UserStatistics if any...
  
  // Add any other fields that are necessary for the signup process

  constructor(data?: Partial<UserSignup>) {
    super(data);
  }
}