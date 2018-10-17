import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { MongoDBClient } from '../util/mongodb/client';
import { AnalyticsService } from './analytics.service';
import { Event, APIQuery, APIResult } from '../model';

@injectable()
export class EventService extends AnalyticsService {
  constructor(@inject(TYPES.MongoDBClient) protected db: MongoDBClient) {
    super(db, 'events');
  }

  public getEvent(eventId: string): Promise<Event> {
    return new Promise<Event>((resolve, reject) => {
      const apiQuery = new APIQuery();
      apiQuery.collection = this.collection;
      apiQuery.query = { eventId };
      this.db.findOne(apiQuery, (error, data: Event) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  public async getQueryResults(apiQuery: APIQuery): Promise<APIResult> {
    return new Promise<APIResult>((resolve, reject) => {
      apiQuery.collection = this.collection;
      apiQuery.paginationField = 'content.idData.timestamp';
      this.db.find(apiQuery, (error, data: any) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
}
