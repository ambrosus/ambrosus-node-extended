import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { APIQuery, APIResult, Bundle } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import * as MongoPaging from 'mongo-cursor-pagination';

@injectable()
export class BundleRepository extends BaseRepository<Bundle> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'bundles');
  }

  get timestampField(): any {
    return 'content.idData.timestamp';
  }

  public query(apiQuery: APIQuery): Promise<APIResult> {
    return super.pagedResults(
      apiQuery.query,
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public single(apiQuery: APIQuery): Promise<Bundle> {
    return super.singleResult(apiQuery.query, apiQuery.options);
  }
}
