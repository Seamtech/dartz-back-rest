import { repository } from '@loopback/repository';
import { get, param, HttpErrors } from '@loopback/rest';
import { PlayerProfileRepository } from '../repositories';
import { PlayerProfile } from '../models';

export class PlayerController {
  constructor(
    @repository(PlayerProfileRepository)
    public playerProfileRepository: PlayerProfileRepository,
  ) {}

  @get('/findPlayer', {
    responses: {
      '200': {
        description: 'Array of PlayerProfile model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': PlayerProfile,
              },
            },
          },
        },
      },
    },
  })
  async findPlayer(
    @param.query.string('type') type: string,
    @param.query.string('value') value: string,
  ): Promise<any[]> {
    try {
      console.log('Find player called with type:', type, 'and value:', value);
      const filter: any = {};
      if (type === 'id') {
        filter.id = parseInt(value, 10);
        if (isNaN(filter.id)) {
          throw new HttpErrors.BadRequest('Invalid ID value');
        }
      } else if (type === 'username') {
        filter.username = value;
      } else {
        throw new HttpErrors.BadRequest('Invalid search type');
      }

      console.log('Filter:', filter);

      const playerProfiles = await this.playerProfileRepository.find({
        where: filter,
        include: [
          { relation: 'playerStatistics' },
          { relation: 'playerAverageStatistics' },
        ],
      });

      if (!playerProfiles.length) {
        throw new HttpErrors.NotFound('Player not found');
      }

      // Flatten the response, if necessary, or adjust according to the required output format
      const detailedPlayers = playerProfiles.map(profile => ({
        ...profile.playerStatistics,
        ...profile.playerAverageStatistics,
        username: profile.username,
        email: profile.email,
        mobileNumber: profile.mobileNumber,
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
      }));

      console.log('Detailed players:', detailedPlayers);
      return detailedPlayers;
    } catch (error) {
      console.error('Error finding player:', error);
      throw new HttpErrors.InternalServerError(`Error finding player: ${error.message}`);
    }
  }
}
