import {repository} from '@loopback/repository';
import {get, param, response, HttpErrors} from '@loopback/rest';
import {PlayerStatisticsRepository} from '../repositories/Player';
import {User} from '../models/User';
import {PlayerStatistics} from '../models/Player';
import {getModelSchemaRef} from '@loopback/rest';
import { UserRepository } from '../repositories/User';

export class LeaderboardController {
  constructor(
    @repository(PlayerStatisticsRepository)
    public playerStatisticsRepository: PlayerStatisticsRepository,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @get('/leaderboard/{type}')
  @response(200, {
    description: 'Array of PlayerStatistics model instances with username',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ...getModelSchemaRef(PlayerStatistics).definitions.PlayerStatistics.properties,
              username: {type: 'string'},
            },
          },
        },
      },
    },
  })
  async findLeaderboard(
    @param.path.string('type') type: string,
    @param.query.number('limit') limit: number = 10,
  ): Promise<any[]> {
    const validTypes = Object.keys(PlayerStatistics.definition.properties).filter(key => key !== 'userId');

    if (!validTypes.includes(type)) {
      throw new HttpErrors.BadRequest(`Invalid leaderboard type: ${type}`);
    }

    try {
      const statistics = await this.playerStatisticsRepository.find({
        order: [`${type} DESC`],
        limit,
        include: [{relation: 'user', scope: {fields: ['username']}}],
      });

      return statistics.map(stat => {
        const statObj: any = stat.toJSON();
        const {user, ...flattenedStat} = statObj;
        return {
          ...flattenedStat,
          username: user?.username ?? 'Anonymous',
        };
      });
    } catch (error) {
      console.error(error);
      throw new HttpErrors.InternalServerError('Internal Server Error');
    }
  }
}
