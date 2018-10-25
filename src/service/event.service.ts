import { inject, injectable } from 'inversify';
import * as MongoPaging from 'mongo-cursor-pagination';

import { TYPES } from '../constant/types';
import { APIQuery, APIResult, Event } from '../model';
import { EventRepository } from '../database/repository';
import { ILogger } from '../interface/logger.inferface';

@injectable()
export class EventService {
  @inject(TYPES.EventRepository)
  public eventRepository: EventRepository;

  @inject(TYPES.LoggerService)
  public logger: ILogger;

  public getEvents(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.eventRepository.find(apiQuery);
  }

  public getEvent(assetId: string): Promise<Event> {
    const apiQuery = new APIQuery();
    apiQuery.query = { assetId };
    return this.eventRepository.findOne(apiQuery);
  }

  public getLatestAssetEventsOfType(
    assets: string[],
    type: string,
    apiQuery: APIQuery
  ): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;

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

    return this.eventRepository.aggregate(pipeline, apiQuery);
  }
}
