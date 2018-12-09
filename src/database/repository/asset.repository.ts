import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Asset } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class AssetRepository extends BaseRepository<Asset> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'assets');

    client.events.on('dbConnected', () => {
      client.db.createCollection('assetsView', {
        viewOn: 'assets',
        pipeline: [
          {
            $project: {
              _id: 0,
              assets: '$$ROOT',
            },
          },
          {
            $lookup: {
              localField: 'assets.content.idData.createdBy',
              from: 'accounts',
              foreignField: 'address',
              as: 'accounts',
            },
          },
          {
            $unwind: {
              path: '$accounts',
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: '$assets._id',
              content: '$assets.content',
              assetId: '$assets.assetId',
              metadata: '$assets.metadata',
              repository: '$assets.repository',
              organization: '$accounts.organization',
            },
          },
          {
            $sort: {
              'content.idData.timestamp': -1,
            },
          },
        ],
      });
    });
  }

  get timestampField(): string {
    return 'content.idData.timestamp';
  }

  get paginatedField(): string {
    return 'content.idData.timestamp';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public findAssetIdsWhereLastEventIsOfType() {
    const pipeline = [
      {
        $group: {
          _id: '$content.idData.assetId',
          lastOfType: {
            $last: '$content.idData.timestamp',
          },
          type: {
            $first: '$content.data.type',
          },
          doc: {
            $first: '$$ROOT',
          },
        },
      },
      {
        $match: {
          type: 'ambrosus.asset.info',
        },
      },
      {
        $project: {
          _id: 0.0,
          eventId: '$doc.eventId',
          content: '$doc.content',
          metadata: '$doc.metadata',
        },
      },
    ];
  }
}
