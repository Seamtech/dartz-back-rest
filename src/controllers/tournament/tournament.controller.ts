import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  RestBindings,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {
  Tournament,
  TournamentTeam,
  TournamentMatch,
  TournamentDetails,
  TournamentMatchResults,
  TournamentPlayerResults,
  TournamentTeamPlayer,
} from '../../models';
import {
  TournamentRepository,
  TournamentTeamRepository,
  TournamentMatchRepository,
  TournamentDetailsRepository,
  TournamentMatchResultsRepository,
  TournamentPlayerResultsRepository,
  TournamentTeamPlayerRepository,
} from '../../repositories';
import {
  tournamentFields,
  tournamentDetailsFields,
  tournamentTeamFields,
  playerFields,
  profileFields,
  gameFields,
} from '../../controller-filters/tournament/getTournamentById.controller.filter';
import {inject, intercept} from '@loopback/core';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {TournamentService} from '../../services/tournament/tournament.service';
import {CustomUserProfile} from '../../types';
import {JwtService} from '../../services/authentication-strategies/jwt.service';
interface TeamData {
  name: string;
  players: Array<{
    profileId: number;
  }>;
}
export class TournamentController {
  constructor(
    @repository(TournamentRepository)
    public tournamentRepository: TournamentRepository,
    @repository(TournamentTeamRepository)
    public tournamentTeamRepository: TournamentTeamRepository,
    @repository(TournamentTeamPlayerRepository)
    public tournamentTeamPlayerRepository: TournamentTeamPlayerRepository,
    @repository(TournamentMatchRepository)
    public tournamentMatchRepository: TournamentMatchRepository,
    @repository(TournamentDetailsRepository)
    public tournamentDetailsRepository: TournamentDetailsRepository,
    @repository(TournamentMatchResultsRepository)
    public tournamentMatchResultsRepository: TournamentMatchResultsRepository,
    @repository(TournamentPlayerResultsRepository)
    public tournamentPlayerResultsRepository: TournamentPlayerResultsRepository,
    @inject('services.TournamentService')
    public tournamentService: TournamentService,
    @inject('services.JwtService') private jwtService: JwtService,
  ) {}

  @get('/tournaments', {
    responses: {
      '200': {
        description: 'Array of Tournament model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: getModelSchemaRef(Tournament),
            },
          },
        },
      },
    },
  })
  async findTournaments(): Promise<Tournament[]> {
    const tournaments = await this.tournamentRepository.find({
      include: [
        {relation: 'details'},
        {relation: 'teams', scope: {include: ['players']}},
        {relation: 'game'},
      ],
    });
    console.log('Tournaments:', tournaments);
    return tournaments;
  }

  @get('/tournaments/{id}', {
    responses: {
      '200': {
        description: 'Tournament model instance',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Tournament),
          },
        },
      },
    },
  })
  async findTournamentById(
    @param.path.number('id') id: number,
  ): Promise<Tournament> {
    const tournament = await this.tournamentRepository.findById(id, {
      fields: tournamentFields,
      include: [
        {
          relation: 'details',
          scope: {
            fields: tournamentDetailsFields,
          },
        },
        {
          relation: 'teams',
          scope: {
            fields: tournamentTeamFields,
            include: [
              {
                relation: 'players',
                scope: {
                  fields: playerFields,
                  include: [
                    {
                      relation: 'profile',
                      scope: {
                        fields: profileFields,
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          relation: 'game',
          scope: {
            fields: gameFields,
          },
        },
      ],
    });
    console.log('Tournament:', tournament);
    return tournament;
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @post('/tournaments/register-team')
  @response(200, {
    description: 'Team registration for a tournament',
    content: {'application/json': {schema: getModelSchemaRef(Tournament)}},
  })
  async registerTeam(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              tournamentId: {type: 'number'},
              team: {
                type: 'object',
                properties: {
                  name: {type: 'string'},
                  players: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        profileId: {type: 'number'},
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
    registrationData: {
      tournamentId: number;
      team: TeamData;
    },
    @inject(RestBindings.Http.REQUEST) request: Request, // Injecting request
  ): Promise<Tournament> {
    try {
      const {tournamentId, team} = registrationData;
      console.log('Tournament ID:', tournamentId);
      const userProfile = this.jwtService.getUserProfileFromRequest(request);

      if (!userProfile) {
        throw new HttpErrors.Unauthorized('User profile is missing.');
      }

      const createdBy = userProfile.profileId;

      console.log(
        'Registering team:',
        team,
        'for tournament:',
        tournamentId,
        'created by:',
        createdBy,
      );

      return this.tournamentService.registerTeam(tournamentId, team, createdBy);
    } catch (err) {
      console.error('Error registering team:', err); // Detailed error logging
      if (err instanceof HttpErrors.HttpError) {
        throw err;
      } else {
        throw new HttpErrors.InternalServerError(
          'Error processing registration request.',
        );
      }
    }
  }

  @intercept('interceptors.TokenAuthorizationInterceptor')
  @post('/tournaments/update-player-status')
  @response(200, {
    description: 'Update player status for a tournament',
    content: {
      'application/json': {schema: getModelSchemaRef(TournamentTeamPlayer)},
    },
  })
  async updatePlayerStatus(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              tournamentId: {type: 'number'},
              teamId: {type: 'number'},
              playerId: {type: 'number'},
              status: {type: 'string'},
            },
          },
        },
      },
    })
    updateStatusData: {
      tournamentId: number;
      teamId: number;
      playerId: number;
      status: string;
    },
    @inject(RestBindings.Http.REQUEST) request: Request,
  ): Promise<{tournamentTeamId: number, profileId: number, status: string}> {
    try {
      const { tournamentId, teamId, playerId, status } = updateStatusData;
      await this.tournamentService.updatePlayerStatus(tournamentId, teamId, playerId, status);
      return {tournamentTeamId: teamId, profileId: playerId, status};
    } catch (err) {
      console.error('Error updating player status:', err);
      if (err instanceof HttpErrors.HttpError) {
        throw err;
      } else {
        throw new HttpErrors.InternalServerError('Error processing status update request.');
      }
    }
  }
}

