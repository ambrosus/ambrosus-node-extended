import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { AssetRepository } from '../database/repository';
import { APIQuery, Asset, MongoPagedResult } from '../model';

@injectable()
export class AssetService {
  constructor(@inject(TYPE.AssetRepository) private readonly assetRepository: AssetRepository) {}

  public getAssetExists(assetId: string) {
    return this.assetRepository.existsOR({ assetId }, 'assetId');
  }

  public getAssets(apiQuery: APIQuery): Promise<MongoPagedResult> {
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
