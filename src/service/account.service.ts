import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';

import { MongoDBClient } from '../util/mongodb/client';
import { ILogger } from '../interface/logger.inferface';
import { Account, APIQuery, APIResult } from '../model';
import { AnalyticsService } from './analytics.service';
@injectable()
export class AccountService extends AnalyticsService {
  constructor(
    @inject(TYPES.MongoDBClient) protected db: MongoDBClient,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {
    super(db, 'accounts');
  }

  public async getAccount(address: string): Promise<Account> {
    return new Promise<Account>((resolve, reject) => {
      const apiQuery = new APIQuery();
      apiQuery.collection = this.collection;
      apiQuery.query = { address };
      this.db.findOne(apiQuery, (error, data: Account) => {
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
      apiQuery.paginationField = 'registeredOn';
      this.db.find(apiQuery, (error, data: any) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
}
