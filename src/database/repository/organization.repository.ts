import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Organization } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { join } from 'path';

@injectable()
export class OrganizationRepository extends BaseRepository<Organization> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organization');
  }

  get paginatedField(): string {
    return 'createdOn';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public async getNewOrganizationIdentifier(): Promise<number> {
    const result = await this.client.db
      .collection('identityCounter')
      .findOneAndUpdate(
        { indentity: 'organization_index' },
        { $inc: { count: 9 } },
        { upsert: true, returnOriginal: false }
      );

    return result.value.count;
  }
}
