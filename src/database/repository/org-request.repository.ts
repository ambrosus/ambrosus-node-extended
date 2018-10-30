import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { OrganizationRequest, APIQuery } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class OrganizationRequestRepository extends BaseRepository<OrganizationRequest> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organizationRequest');
  }

  public getOrganizationRequests(apiQuery: APIQuery) {
    return this.find(
      {},
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public getOrganizationRequest(apiQuery: APIQuery): Promise<OrganizationRequest> {
    return this.findOne(apiQuery.query, apiQuery.options);
  }
}
