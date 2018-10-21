import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { MongoDBClient } from '../util/mongodb/client';
import { AnalyticsService } from './analytics.service';
import { Asset, APIQuery, APIResult } from '../model';
import { query } from 'winston';

@injectable()
export class AssetService extends AnalyticsService {
  constructor(@inject(TYPES.MongoDBClient) protected db: MongoDBClient) {
    super(db, 'assets');
  }

  public getAssets(): Promise<APIResult> {
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

  public async getAsset(assetId: string): Promise<Asset> {
    return new Promise<Asset>((resolve, reject) => {
      const apiQuery = new APIQuery();
      apiQuery.collection = this.collection;
      apiQuery.query = { assetId };
      this.db.findOne(apiQuery, (error, data: Asset) => {
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
