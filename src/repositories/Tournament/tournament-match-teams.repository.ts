import {
    DefaultCrudRepository,
    BelongsToAccessor,
    repository,
  } from '@loopback/repository';
  import {
    TournamentMatchTeams,
    TournamentMatchTeamsRelations,
    TournamentMatch,
    TournamentTeam
  } from '../../models';
  import {inject, Getter} from '@loopback/core';
  import {
    TournamentMatchRepository,
    TournamentTeamRepository
  } from '../';
  import {PgsqldbDataSource} from '../../datasources';
  
  export class TournamentMatchTeamsRepository extends DefaultCrudRepository<
    TournamentMatchTeams,
    typeof TournamentMatchTeams.prototype.id,
    TournamentMatchTeamsRelations
  > {
    public readonly tournamentMatch: BelongsToAccessor<TournamentMatch, typeof TournamentMatchTeams.prototype.id>;
    public readonly tournamentTeam: BelongsToAccessor<TournamentTeam, typeof TournamentMatchTeams.prototype.id>;
  
    constructor(
      @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
      @repository.getter('TournamentMatchRepository') protected tournamentMatchRepositoryGetter: Getter<TournamentMatchRepository>,
      @repository.getter('TournamentTeamRepository') protected tournamentTeamRepositoryGetter: Getter<TournamentTeamRepository>,
    ) {
      super(TournamentMatchTeams, dataSource);
  
      this.tournamentMatch = this.createBelongsToAccessorFor('tournamentMatch', tournamentMatchRepositoryGetter);
      this.registerInclusionResolver('tournamentMatch', this.tournamentMatch.inclusionResolver);
  
      this.tournamentTeam = this.createBelongsToAccessorFor('tournamentTeam', tournamentTeamRepositoryGetter);
      this.registerInclusionResolver('tournamentTeam', this.tournamentTeam.inclusionResolver);
    }
  }
  