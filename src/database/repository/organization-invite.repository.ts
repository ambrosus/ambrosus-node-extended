import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { OrganizationInvite } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class OrganizationInviteRepository extends BaseRepository<OrganizationInvite> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organizationInvite');
  }

  get paginatedField(): string {
    return '_id';
  }

  get paginatedAscending(): boolean {
    return false;
  }
}
