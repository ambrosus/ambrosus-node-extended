import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { APIQuery, APIResult, Asset, Bundle } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AssetRepository extends BaseRepository<Asset> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'assets');
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

  public single(apiQuery: APIQuery): Promise<Asset> {
    return super.singleResult(apiQuery.query, apiQuery.options);
  }
}
