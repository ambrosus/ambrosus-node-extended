import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Organization } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organization');
  }

  get timestampField(): any {
    return 'registeredOn';
  }

  get accessLevelField(): any {
    return 'accessLevel';
  }
}
