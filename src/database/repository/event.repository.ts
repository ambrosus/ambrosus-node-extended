import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { APIQuery, APIResult, Event } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'events');
  }

  public queryEvents(apiQuery: APIQuery, accessLevel: number): Promise<APIResult> {
    const q = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    return this.find(
      q,
      apiQuery.fields,
      apiQuery.paginationField,
      apiQuery.sortAscending,
      apiQuery.limit,
      apiQuery.next,
      apiQuery.previous
    );
  }

  public queryEvent(apiQuery: APIQuery, accessLevel: number): Promise<Event> {
    const q = {
      ...apiQuery.query,
      ...{
        'content.idData.accessLevel': { $lte: accessLevel },
      },
    };
    return this.findOne(q, apiQuery.options);
  }

  public assetEventsOfType(assets: string[], type: string, apiQuery: APIQuery): Promise<APIResult> {
    const pipeline = [
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

    return super.aggregatePaging(pipeline, apiQuery);
  }
}
