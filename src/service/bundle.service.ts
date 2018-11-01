import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { BundleRepository } from '../database/repository';
import { APIQuery, Bundle, MongoPagedResult } from '../model';

@injectable()
export class BundleService {
  constructor(@inject(TYPE.BundleRepository) private readonly bundleRepository: BundleRepository) {}

  public getBundleExists(bundleId: string) {
    return this.bundleRepository.existsOR({ bundleId }, 'bundleId');
  }

  public getBundles(apiQuery: APIQuery): Promise<MongoPagedResult> {
    apiQuery.exludeFields('content.entries');
    return this.bundleRepository.find(apiQuery);
  }

  public getBundle(bundleId: string): Promise<Bundle> {
    const apiQuery = new APIQuery();
    apiQuery.query = { bundleId };
    apiQuery.exludeFields('content.entries');
    return this.bundleRepository.findOne(apiQuery);
  }
}
