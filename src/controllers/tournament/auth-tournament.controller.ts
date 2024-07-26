import {inject, intercept} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  HttpErrors,
  Request,
  Response,
  RestBindings,
  getModelSchemaRef,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Tournament, TournamentTeamPlayer} from '../../models';
import {
  GameTypeRepository,
  TournamentDetailsRepository,
  TournamentRepository,
} from '../../repositories';
import {JwtService} from '../../services/authentication-strategies/jwt.service';
import {TournamentService} from '../../services/tournament/tournament.service';

export class AuthorizedTournamentController {
  constructor(
    @repository(GameTypeRepository)
    public gameTypeRepository: GameTypeRepository,
    @repository(TournamentRepository)
    public tournamentRepository: TournamentRepository,
    @repository(TournamentDetailsRepository)
    public tournamentDetailsRepository: TournamentDetailsRepository,
    @inject('services.TournamentService')
    public tournamentService: TournamentService,
    @inject('services.JwtService') private jwtService: JwtService,
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,
  ) {}

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
      team: any;
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

      return await this.tournamentService.registerTeam(
        tournamentId,
        team,
        createdBy,
      );
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
  ): Promise<{tournamentTeamId: number; profileId: number; status: string}> {
    try {
      const {tournamentId, teamId, playerId, status} = updateStatusData;
      await this.tournamentService.updatePlayerStatus(
        tournamentId,
        teamId,
        playerId,
        status,
      );
      return {tournamentTeamId: teamId, profileId: playerId, status};
    } catch (err) {
      console.error('Error updating player status:', err);
      if (err instanceof HttpErrors.HttpError) {
        throw err;
      } else {
        throw new HttpErrors.InternalServerError(
          'Error processing status update request.',
        );
      }
    }
  }
}
