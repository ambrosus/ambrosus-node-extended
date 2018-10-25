import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { Account } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'accounts');
  }
}
