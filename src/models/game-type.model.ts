import { Entity, model, property, hasMany } from '@loopback/repository';
import { Tournament } from './';

@model({
  settings: {
    postgresql: { schema: 'dartz', table: 'game_types' },
  },
})
export class GameType extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    length: 100,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    length: 255,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
    length: 25,
  })
  base_game: string;

  @property({
    type: 'string',
    required: true,
    length: 25,
  })
  handicap_type: string;

  @property({
    type: 'string',
    required: true,
    length: 25,
  })
  bull_type: string;

  @property({
    type: 'string',
    required: true,
    length: 25,
  })
  out_type: string;

  @hasMany(() => Tournament, {keyTo: 'gameId'})
  tournaments: Tournament[];

  constructor(data?: Partial<GameType>) {
    super(data);
  }
}

export interface GameTypeRelations {
  tournaments?: Tournament[];
}

export type GameTypeWithRelations = GameType & GameTypeRelations;
