import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { AccountDetail, APIQuery, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { EventEmitter } from 'events';

@injectable()
export class AccountDetailRepository extends BaseRepository<AccountDetail> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'accountDetail');

    client.events.on('dbConnected', () => {
      client.db.collection('accountDetail').createIndex({ email: 1 }, { unique: true });
    });
  }

  get paginatedField(): string {
    return 'createdOn';
  }

  get paginatedAscending(): boolean {
    return false;
  }
}
