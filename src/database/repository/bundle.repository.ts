import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { APIQuery, APIResult, Bundle } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import * as MongoPaging from 'mongo-cursor-pagination';

@injectable()
export class BundleRepository extends BaseRepository<Bundle> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'bundles');
  }

  get timestampField(): any {
    return 'content.idData.timestamp';
  }

  public find(apiQuery: APIQuery): Promise<APIResult> {
    return super.find(
      apiQuery.query,
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public findOne(apiQuery: APIQuery): Promise<Bundle> {
    return super.findOne(apiQuery.query, apiQuery.options);
  }
}
