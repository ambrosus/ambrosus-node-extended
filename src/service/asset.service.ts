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

  constructor(@inject(TYPES.AccessLevel) private readonly accessLevel: number) {}

  public getAssets(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.assetRepository.query(apiQuery, this.accessLevel);
  }

  public getAsset(assetId: string): Promise<Asset> {
    const apiQuery = new APIQuery();
    apiQuery.query = { assetId };
    return this.assetRepository.single(apiQuery, this.accessLevel);
  }
}
