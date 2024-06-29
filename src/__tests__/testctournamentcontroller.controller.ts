import { repository } from '@loopback/repository';
import { get } from '@loopback/rest';
import { TournamentRepository, TournamentTeamRepository, TournamentMatchRepository, TournamentDetailsRepository, TournamentMatchResultsRepository, TournamentPlayerResultsRepository } from '../repositories';
import { Tournament, TournamentTeam, TournamentMatch, TournamentDetails, TournamentMatchResults, TournamentPlayerResults } from '../models';

export class TournamentController {
  constructor(
    @repository(TournamentRepository)
    public tournamentRepository: TournamentRepository,
    @repository(TournamentTeamRepository)
    public tournamentTeamRepository: TournamentTeamRepository,
    @repository(TournamentMatchRepository)
    public tournamentMatchRepository: TournamentMatchRepository,
    @repository(TournamentDetailsRepository)
    public tournamentDetailsRepository: TournamentDetailsRepository,
    @repository(TournamentMatchResultsRepository)
    public tournamentMatchResultsRepository: TournamentMatchResultsRepository,
    @repository(TournamentPlayerResultsRepository)
    public tournamentPlayerResultsRepository: TournamentPlayerResultsRepository,
  ) {}

  @get('/tournaments', {
    responses: {
      '200': {
        description: 'Array of Tournament model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': Tournament,
              },
            },
          },
        },
      },
    },
  })
  async findTournaments(): Promise<Tournament[]> {
    const tournaments = await this.tournamentRepository.find({
      include: [
        { relation: 'details' },
        { relation: 'teams', scope: { include: ['players'] } }
      ],
    });
    console.log('Tournaments:', tournaments);
    return tournaments;
  }

  @get('/tournament-teams', {
    responses: {
      '200': {
        description: 'Array of TournamentTeam model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': TournamentTeam,
              },
            },
          },
        },
      },
    },
  })
  async findTournamentTeams(): Promise<TournamentTeam[]> {
    const teams = await this.tournamentTeamRepository.find();
    console.log('Tournament Teams:', teams);
    return teams;
  }

  @get('/tournament-matches', {
    responses: {
      '200': {
        description: 'Array of TournamentMatch model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': TournamentMatch,
              },
            },
          },
        },
      },
    },
  })
  async findTournamentMatches(): Promise<TournamentMatch[]> {
    const matches = await this.tournamentMatchRepository.find();
    console.log('Tournament Matches:', matches);
    return matches;
  }

  @get('/tournament-details', {
    responses: {
      '200': {
        description: 'Array of TournamentDetails model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': TournamentDetails,
              },
            },
          },
        },
      },
    },
  })
  async findTournamentDetails(): Promise<TournamentDetails[]> {
    const details = await this.tournamentDetailsRepository.find();
    console.log('Tournament Details:', details);
    return details;
  }

  @get('/tournament-match-results', {
    responses: {
      '200': {
        description: 'Array of TournamentMatchResults model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': TournamentMatchResults,
              },
            },
          },
        },
      },
    },
  })
  async findTournamentMatchResults(): Promise<TournamentMatchResults[]> {
    const matchResults = await this.tournamentMatchResultsRepository.find();
    console.log('Tournament Match Results:', matchResults);
    return matchResults;
  }

  @get('/tournament-player-results', {
    responses: {
      '200': {
        description: 'Array of TournamentPlayerResults model instances',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: {
                'x-ts-type': TournamentPlayerResults,
              },
            },
          },
        },
      },
    },
  })
  async findTournamentPlayerResults(): Promise<TournamentPlayerResults[]> {
    const playerResults = await this.tournamentPlayerResultsRepository.find();
    console.log('Tournament Player Results:', playerResults);
    return playerResults;
  }
}
