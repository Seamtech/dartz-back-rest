import {repository} from '@loopback/repository';
import {
  get,
  param,
} from '@loopback/rest';
import {GameType} from '../models';
import {GameTypeRepository} from '../repositories/game-type.repository';

export class GameController {
  constructor(
    @repository(GameTypeRepository)
    public gameTypeRepository: GameTypeRepository,
  ) {}

  @get('/games', {
    responses: {
      '200': {
        description: 'Array of GameType model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {'x-ts-type': GameType},
            },
          },
        },
      },
    },
  })
  async getGames(
    @param.query.string('platform') platform?: string,
  ): Promise<GameType[]> {
    const whereClause: any = platform && platform !== 'All' ? {platform_name: platform} : {};
    return this.gameTypeRepository.find({where: whereClause});
  }
}
