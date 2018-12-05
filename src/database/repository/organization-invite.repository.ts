import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { APIQuery, OrganizationInvite } from '../../model';
import { getTimestamp } from '../../util';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { assertWrappingType } from 'graphql';

@injectable()
export class OrganizationInviteRepository extends BaseRepository<OrganizationInvite> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'organizationInvite');
  }

  get paginatedField(): string {
    return '_id';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public async deleteExpired() {
    const collection = await this.getCollection();

    const apiQuery = new APIQuery({ validUntil: { $lte: getTimestamp() } });
    const invites = await collection
      .find(apiQuery.query, { projection: { inviteId: 1 } })
      .toArray();
    for (const invite of invites) {
      await super.deleteOne(new APIQuery({ inviteId: invite.inviteId }));
    }
  }
}
