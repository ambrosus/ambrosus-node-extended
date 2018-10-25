import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { Asset } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AssetRepository extends BaseRepository<Asset> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'assets');
  }
}
