import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { AssetRepository } from '../database/repository';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResult, Asset } from '../model';

@injectable()
export class AssetService {
  @inject(TYPES.AssetRepository)
  public assetRepository: AssetRepository;

  @inject(TYPES.LoggerService)
  public logger: ILogger;

  public getAssets(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.assetRepository.find(apiQuery);
  }

  public getAsset(assetId: string): Promise<Asset> {
    const apiQuery = new APIQuery();
    apiQuery.query = { assetId };
    return this.assetRepository.findOne(apiQuery);
  }
}
