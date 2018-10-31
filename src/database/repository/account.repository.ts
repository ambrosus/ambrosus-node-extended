import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Account, APIQuery, APIResult } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'accounts');
  }

  public queryAccounts(apiQuery: APIQuery, accessLevel: number): Promise<APIResult> {
    const q = {
      ...apiQuery.query,
      ...{
        'accessLevel': { $lte: accessLevel },
      },
    };
    return this.find(
      q,
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public queryAccount(apiQuery: APIQuery, accessLevel: number): Promise<Account> {
    const q = {
      ...apiQuery.query,
      ...{
        'accessLevel': { $lte: accessLevel },
      },
    };
    return this.findOne(q, apiQuery.options);
  }

  public getAccountForAuthorization(apiQuery: APIQuery): Promise<Account> {
    return super.findOne(apiQuery.query, apiQuery.options);
  }
}
