import { Entity, hasOne, model, property } from '@loopback/repository';
import { PlayerProfile } from '../Player/player-profile.model';
import { PlayerProfileWithRelations } from '../Player/player-profile.model';

@model({ settings: { idInjection: false, postgresql: { schema: 'dartz', table: 'users' }, hiddenProperties: ['passwordHash'] } })
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
    postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'password_hash', dataType: 'character varying', nullable: 'NO' },
  })
  passwordHash: string;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'email', dataType: 'character varying', nullable: 'NO' },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'username', dataType: 'character varying', nullable: 'NO' },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: { columnName: 'role', dataType: 'character varying', nullable: 'NO' },
  })
  role: string;

  @hasOne(() => PlayerProfile, { keyTo: 'userId' })
  playerProfile: PlayerProfile;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  playerProfile?: PlayerProfileWithRelations;
}

export type UserWithRelations = User & UserRelations;
export type UserWithExcludedFields = Omit<UserWithRelations, 'passwordHash'>;
