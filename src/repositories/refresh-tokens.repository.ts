import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {RefreshTokens, RefreshTokensRelations, User} from '../models';
import {UserRepository} from './user.repository'; // Import UserRepository

export class RefreshTokensRepository extends DefaultCrudRepository<
  RefreshTokens,
  typeof RefreshTokens.prototype.id,
  RefreshTokensRelations
> {
  public readonly user: BelongsToAccessor<User, typeof RefreshTokens.prototype.id>;

  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(RefreshTokens, dataSource);

    // Register the relation accessor
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
    this.registerInclusionResolver('user', this.user.inclusionResolver);
  }
}