import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { AccountDetail, APIQuery, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AccountDetailRepository extends BaseRepository<AccountDetail> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'accountDetail');
  }

  get paginatedField(): string {
    return 'createdOn';
  }

  get paginatedAscending(): boolean {
    return false;
  }

}
