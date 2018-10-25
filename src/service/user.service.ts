import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { Account, APIQuery, APIResult } from '../model';
import { MongoDBClient } from '../util/mongodb/client';
import { AnalyticsService } from './analytics.service';
import { AccountRepository } from '../database/repository';

@injectable()
export class UserService extends AnalyticsService {
  @inject(TYPES.AccountRepository)
  public accountRepository: AccountRepository;

  constructor(
    @inject(TYPES.MongoDBClient) protected db: MongoDBClient,
    @inject(TYPES.LoggerService) public logger: ILogger
  ) {
    super(db, 'accounts');
  }
}
