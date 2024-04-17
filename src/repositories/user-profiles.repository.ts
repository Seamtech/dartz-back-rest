import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {PgsqldbDataSource} from '../datasources';
import {UserProfiles, UserProfilesRelations} from '../models';

export class UserProfilesRepository extends DefaultCrudRepository<
  UserProfiles,
  typeof UserProfiles.prototype.profileId,
  UserProfilesRelations
> {
  constructor(
    @inject('datasources.pgsqldb') dataSource: PgsqldbDataSource,
  ) {
    super(UserProfiles, dataSource);
  }
}
