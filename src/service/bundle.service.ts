import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { BundleRepository } from '../database/repository';
import { APIQuery, APIResult, Bundle } from '../model';

@injectable()
export class BundleService {
  constructor(
    @inject(TYPE.BundleRepository) private readonly bundleRepository: BundleRepository
  ) {}

  public getBundleExists(bundleId: string) {
    return this.bundleRepository.existsOR({ bundleId }, 'bundleId');
  }

  public getBundles(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.exludeField('content.entries');
    return this.bundleRepository.find(apiQuery);
  }

  public getBundle(bundleId: string): Promise<Bundle> {
    const apiQuery = new APIQuery();
    apiQuery.query = { bundleId };
    apiQuery.exludeField('content.entries');
    return this.bundleRepository.findOne(apiQuery);
  }
}
