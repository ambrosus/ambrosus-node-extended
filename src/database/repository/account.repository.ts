import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Account, APIQuery, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'accounts');
  }

  get paginatedField(): string {
    return 'registeredOn';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public queryAccounts(apiQuery: APIQuery, accessLevel: number): Promise<MongoPagedResult> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        accessLevel: { $lte: accessLevel },
      },
    };
    return this.find(apiQuery);
  }

  public queryAccount(apiQuery: APIQuery, accessLevel: number): Promise<Account> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        accessLevel: { $lte: accessLevel },
      },
    };
    return this.findOne(apiQuery);
  }

  public getPermissions(apiQuery: APIQuery, accessLevel: number): Promise<Account> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        accessLevel: { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      eventId: 1,
      'permissions': 1,
    };
    return this.findOne(apiQuery);
  }

  public getAccountForAuthorization(apiQuery: APIQuery): Promise<Account> {
    return super.findOne(apiQuery);
  }
}
