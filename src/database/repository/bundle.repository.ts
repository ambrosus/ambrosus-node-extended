import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { Bundle } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class BundleRepository extends BaseRepository<Bundle> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'bundles');
  }
}
