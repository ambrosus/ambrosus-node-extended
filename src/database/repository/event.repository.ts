import { inject, injectable } from 'inversify';

import { TYPES } from '../../constant';
import { APIQuery, APIResult, Event } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';

@injectable()
export class EventRepository extends BaseRepository<Event> {
  constructor(@inject(TYPES.DBClient) protected client: DBClient) {
    super(client, 'events');
  }

  get timestampField(): any {
    return 'content.idData.timestamp';
  }

  get accessLevelField(): any {
    return 'content.idData.accessLevel';
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
