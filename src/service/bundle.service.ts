import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { BundleRepository } from '../database/repository';
import { APIQuery, APIResult, Bundle } from '../model';

@injectable()
export class BundleService {
  constructor(
    @inject(TYPES.BundleRepository) private readonly bundleRepository: BundleRepository
  ) {}

  public getBundles(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.exludeField('content.entries');
    return this.bundleRepository.query(apiQuery);
  }

  public getBundle(bundleId: string): Promise<Bundle> {
    const apiQuery = new APIQuery();
    apiQuery.query = { bundleId };
    apiQuery.exludeField('content.entries');
    return this.bundleRepository.single(apiQuery);
  }
}
