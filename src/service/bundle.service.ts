import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { BundleRepository } from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResult, Bundle } from '../model';

@injectable()
export class BundleService {
  @inject(TYPES.BundleRepository)
  public bundleRepository: BundleRepository;

  @inject(TYPES.LoggerService)
  public logger: ILogger;

  public getBundles(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.exludeField('content');
    return this.bundleRepository.find(apiQuery);
  }

  public getBundle(bundleId: string): Promise<Bundle> {
    const apiQuery = new APIQuery();
    apiQuery.query = { bundleId };
    apiQuery.exludeField('content');
    return this.bundleRepository.findOne(apiQuery);
  }
}
