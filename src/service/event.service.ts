import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { MongoDBClient } from '../util/mongodb/client';
import { AnalyticsService } from './analytics.service';
import { Event, APIQuery, APIResult, APIAssetAggregate } from '../model';
import * as MongoPaging from 'mongo-cursor-pagination';

@injectable()
export class EventService extends AnalyticsService {
  constructor(@inject(TYPES.MongoDBClient) protected dbClient: MongoDBClient) {
    super(dbClient, 'events');
  }

  public getEvents(): Promise<APIResult> {
    return new Promise<APIResult>((resolve, reject) => {
      const apiQuery = new APIQuery();
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

  public getQueryResults(apiQuery: APIQuery): Promise<APIResult> {
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

  public getLatestType(apiAssetAgg: APIAssetAggregate): Promise<APIResult> {
    return new Promise<APIResult>((resolve, reject) => {
      apiAssetAgg.collection = this.collection;
      apiAssetAgg.paginationField = 'content.idData.timestamp';

      MongoPaging.aggregate(
        this.dbClient.db.collection(apiAssetAgg.collection),
        {
          aggregation: apiAssetAgg.pipeline,
          paginatedField: apiAssetAgg.paginationField,
          limit: apiAssetAgg.limit,
          next: apiAssetAgg.next,
          previous: apiAssetAgg.previous,
        }
      )
        .then(data => {
          resolve(data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
