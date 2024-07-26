import {repository, Where} from '@loopback/repository';
import {get, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {PlayerProfile} from '../models';
import {PlayerProfileRepository} from '../repositories';

export class PlayerController {
  constructor(
    @repository(PlayerProfileRepository)
    public playerProfileRepository: PlayerProfileRepository,
  ) {}

  // Helper method to construct where clause
  private constructWhereClause(
    type: string,
    value: string,
  ): Where<PlayerProfile> {
    let where: Where<PlayerProfile> = {};

    if (type === 'id') {
      const id = parseInt(value, 10);
      if (isNaN(id)) {
        throw new HttpErrors.BadRequest('Invalid ID value');
      }
      where.id = id;
    } else if (type === 'username') {
      where = {username: {ilike: value}}; // Case-insensitive partial search
    } else if (type === 'name') {
      const names = value.split(',');
      if (names.length !== 2) {
        throw new HttpErrors.BadRequest(
          'Invalid name format. Use "first,last".',
        );
      }
      const [firstName, lastName] = names.map(name => name.trim());
      where = {
        and: [
          {firstName: {ilike: `%${firstName}%`}}, // Case-insensitive partial search
          {lastName: {ilike: `%${lastName}%`}}, // Case-insensitive partial search
        ],
      };
    } else {
      throw new HttpErrors.BadRequest('Invalid search type');
    }

    return where;
  }

  // Helper method to find players
  private async findPlayers(
    lookups: {type: string; value: string}[],
    includeRelations = false,
  ): Promise<{results: PlayerProfile[]; errors: any[]}> {
    const results: PlayerProfile[] = [];
    const errors: any[] = [];

    for (const lookup of lookups) {
      const {type, value} = lookup;
      try {
        const where = this.constructWhereClause(type, value);

        const playerProfiles = await this.playerProfileRepository.find({
          where,
          ...(includeRelations && {
            include: [
              {relation: 'playerStatistics'},
              {relation: 'playerAverageStatistics'},
            ],
          }),
        });

        if (playerProfiles.length) {
          results.push(...playerProfiles);
        } else {
          errors.push({type, value, message: 'Player not found'});
        }
      } catch (error) {
        errors.push({type, value, message: error.message});
      }
    }

    return {results, errors};
  }

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
  ): Promise<PlayerProfile[]> {
    const {results, errors} = await this.findPlayers([{type, value}], true);
    if (errors.length) {
      throw new HttpErrors.NotFound(errors[0].message);
    }
    return results;
  }

  @get('/findPlayerBasicDetails', {
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
  async findPlayerBasicDetails(
    @param.query.string('type') type: string,
    @param.query.string('value') value: string,
  ): Promise<Partial<PlayerProfile>[]> {
    const {results, errors} = await this.findPlayers([{type, value}], false);
    if (errors.length) {
      throw new HttpErrors.NotFound(errors[0].message);
    }

    const basicDetails = results.map(profile => ({
      username: profile.username,
      email: profile.email,
      mobileNumber: profile.mobileNumber ?? '',
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
    }));

    return basicDetails;
  }

  @post('/batchPlayerLookup', {
    responses: {
      '200': {
        description: 'Array of PlayerProfile model instances with errors',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                results: {
                  type: 'array',
                  items: {'x-ts-type': PlayerProfile},
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: {type: 'string'},
                      value: {type: 'string'},
                      message: {type: 'string'},
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async batchPlayerLookup(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                type: {type: 'string'},
                value: {type: 'string'},
              },
            },
          },
        },
      },
    })
    lookups: {type: string; value: string}[],
  ): Promise<{results: PlayerProfile[]; errors: any[]}> {
    return this.findPlayers(lookups, true);
  }
}
