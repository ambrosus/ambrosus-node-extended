import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { APIQuery, Event, MongoPagedResult } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'events');

    // TODO: Needs to be optimized, too slow
    // client.events.on('dbConnected', () => {
    //   client.db.createCollection('eventsView', {
    //     viewOn: 'events',
    //     pipeline: [
    //       {
    //         $project: {
    //           _id: 0,
    //           assets: '$$ROOT',
    //         },
    //       },
    //       {
    //         $lookup: {
    //           localField: 'events.content.idData.createdBy',
    //           from: 'accounts',
    //           foreignField: 'address',
    //           as: 'accounts',
    //         },
    //       },
    //       {
    //         $unwind: {
    //           path: '$accounts',
    //           preserveNullAndEmptyArrays: true,
    //         },
    //       },
    //       {
    //         $project: {
    //           _id: '$events._id',
    //           content: '$events.content',
    //           assetId: '$events.eventId',
    //           metadata: '$events.metadata',
    //           repository: '$events.repository',
    //           organization: '$accounts.organization',
    //         },
    //       },
    //       {
    //         $sort: {
    //           'events.content.idData.timestamp': -1,
    //         },
    //       },
    //     ],
    //   });
    // });
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

  public queryEvent(apiQuery: APIQuery, accessLevel: number): Promise<Event> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      repository: 0,
    };
    return this.findOne(apiQuery);
  }

  public queryEvents(
    apiQuery: APIQuery,
    accessLevel: number
  ): Promise<MongoPagedResult> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      repository: 0,
    };
    return this.findWithPagination(apiQuery);
  }

  public searchEvents(
    apiQuery: APIQuery,
    accessLevel: number
  ): Promise<MongoPagedResult> {
    apiQuery.query = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    apiQuery.fields = {
      eventId: 1,
      'content.idData': 1,
      'content.data': 1,
      'content.metadata': 1,
    };
    return this.search(apiQuery);
  }

  public assetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<MongoPagedResult> {
    apiQuery.query = [
      {
        $match: {
          'content.data.type': type,
          'content.idData.assetId': {
            $in: assets,
          },
        },
      },
      {
        $group: {
          _id: '$content.idData.assetId',
          doc: {
            $first: '$$ROOT',
          },
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
    apiQuery.fields = {
      repository: 0,
    };
    return super.aggregate(apiQuery);
  }
}
