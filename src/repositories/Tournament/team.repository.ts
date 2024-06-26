import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {PgsqldbDataSource} from '../../datasources';
import {Team, TeamRelations, TeamPlayers, TournamentTeams} from '../../models';
import {TeamPlayersRepository} from './team-players.repository';
import {TournamentTeamsRepository} from './tournament-teams.repository';

export class TeamRepository extends DefaultCrudRepository<
  Team,
  typeof Team.prototype.id,
  TeamRelations
> {
  public readonly teamPlayers: HasManyRepositoryFactory<TeamPlayers, typeof Team.prototype.id>;
  public readonly tournamentTeams: HasManyRepositoryFactory<TournamentTeams, typeof Team.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('TeamPlayersRepository') protected teamPlayersRepositoryGetter: Getter<TeamPlayersRepository>,
    @repository.getter('TournamentTeamsRepository') protected tournamentTeamsRepositoryGetter: Getter<TournamentTeamsRepository>,
  ) {
    super(Team, dataSource);

    this.teamPlayers = this.createHasManyRepositoryFactoryFor('teamPlayers', teamPlayersRepositoryGetter);
    this.registerInclusionResolver('teamPlayers', this.teamPlayers.inclusionResolver);

    this.tournamentTeams = this.createHasManyRepositoryFactoryFor('tournamentTeams', tournamentTeamsRepositoryGetter);
    this.registerInclusionResolver('tournamentTeams', this.tournamentTeams.inclusionResolver);
  }
}
