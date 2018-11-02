import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Bundle } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class BundleRepository extends BaseRepository<Bundle> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'bundles');
  }

  get paginatedField(): string {
    return '_id';
  }

  get paginatedAscending(): boolean {
    return false;
  }
}
