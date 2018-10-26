import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { Account, APIQuery } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'accounts');
  }

  get timestampField(): any {
    return 'registeredOn';
  }

  get accessLevelField(): any {
    return 'accessLevel';
  }

  public singleAccountAuth(apiQuery: APIQuery): Promise<Account> {
    return super.singleResult(apiQuery.query, apiQuery.options);
  }
}
