/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { inject, injectable } from 'inversify';

import { TYPE } from '../constant/types';
import { AssetRepository } from '../database/repository';
import {
  APIQuery,
  Asset,
  MongoPagedResult
} from '../model';
import { ensureCanCreateAsset } from '../security/access.check';
import { getTimestamp } from '../util';
import { ValidationError } from '../errors';
import { AssetMetaData } from '../model/asset/asset-metadata.model';
import { AssetContent } from '../model/asset/asset-content.model';
import { AssetIdData } from '../model/asset/asset-iddata.model';

@injectable()
export class AssetService {
  constructor(@inject(TYPE.AssetRepository) private readonly assetRepository: AssetRepository) {}

  public getAssetExists(assetId: string) {
    return this.assetRepository.existsOR({ assetId }, 'assetId');
  }

  public getAssets(apiQuery: APIQuery): Promise<MongoPagedResult> {
    apiQuery.paginationField = 'content.idData.timestamp';
    apiQuery.sortAscending = false;
    return this.assetRepository.findWithPagination(apiQuery);
  }

  public getAsset(assetId: string): Promise<Asset> {
    const apiQuery = new APIQuery();
    apiQuery.query = { assetId };
    return this.assetRepository.findOne(apiQuery);
  }

  public async createAsset(
    assetId: string,
    createdBy: string,
    timestamp: number,
    sequesnceNumber: number,
    signature: string
  ) {
    await ensureCanCreateAsset();

    const testAsset = await this.getAsset(assetId);

    if (testAsset && (testAsset !== null)) {
      throw new ValidationError( {reason: `Asset with assetId=${assetId} already exists` } );
    }

    const asset = new Asset();
    asset.assetId = assetId;

    asset.metadata = new AssetMetaData();

    asset.metadata.bundleId = null;
    asset.metadata.bundleUploadTimestamp = getTimestamp();

    asset.content = new AssetContent();

    asset.content.idData = new AssetIdData();

    asset.content.idData.createdBy = createdBy;
    asset.content.idData.timestamp = timestamp;
    asset.content.idData.sequenceNumber = sequesnceNumber;

    asset.content.signature = signature;

    await this.assetRepository.create(asset);
  }
}
