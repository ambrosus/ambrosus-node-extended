import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { OrganizationRequest } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class OrganizationRequestRepository extends BaseRepository<OrganizationRequest> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organizationRequest');
  }

  get paginatedField(): string {
    return 'createdOn';
  }

  get paginatedAscending(): boolean {
    return false;
  }
}
