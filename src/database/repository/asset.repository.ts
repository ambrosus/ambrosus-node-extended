/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { APIQuery, Asset } from '../../model';

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

  public async queryAssetsOld(apiQuery: APIQuery) {
    apiQuery.query = {
      ...apiQuery.query,      
    };
    apiQuery.fields = {
      _id: 0,
      repository: 0,
    };
            
    return await this.findOne(apiQuery);
  }
}
