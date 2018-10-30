import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { AssetRepository } from '../database/repository';
import { APIQuery, APIResult, Asset } from '../model';

@injectable()
export class AssetService {
  constructor(@inject(TYPE.AssetRepository) private readonly assetRepository: AssetRepository) {}

  public getAssets(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = true;
    return this.assetRepository.find(apiQuery);
  }

  public getAsset(assetId: string): Promise<Asset> {
    const apiQuery = new APIQuery();
    apiQuery.query = { assetId };
    return this.assetRepository.findOne(apiQuery);
  }
}
