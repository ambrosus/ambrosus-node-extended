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

import { Request } from 'express';
import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  requestParam,
  requestHeaders,
  requestBody,
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { APIQuery, APIResponse } from '../model';
import { BaseController } from './base.controller';
import { authorize } from '../middleware/authorize.middleware';
import { validate } from '../middleware';
import { querySchema, assetSchema } from '../validation/schemas';
import { AssetService } from '../service/asset.service';
import { AuthService } from '../service/auth.service';

import { Web3Service } from '../service/web3.service';
import { ValidationError } from '../errors';

@controller(
  '/asset2',
  MIDDLEWARE.Context
)
export class Asset2Controller extends BaseController {

  constructor(
    @inject(TYPE.AssetService) private assetService: AssetService,
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AuthService) private authService: AuthService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service
  ) {
    super(logger);
  }

  @httpGet(
    '/list'
  )
  public async getAssets(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpGet(
    '/info/:assetId'
  )
  public async get(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAsset(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpGet(
    '/exists/:assetId'
  )
  public async getAssetExists(
    @requestParam('assetId') assetId: string
  ): Promise<APIResponse> {
    const result = await this.assetService.getAssetExists(assetId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    validate(querySchema)
  )
  public async query(req: Request): Promise<APIResponse> {
    const result = await this.assetService.getAssets(APIQuery.fromRequest(req));
    return APIResponse.fromMongoPagedResult(result);
  }

  @httpPost(
    '/create/:assetId',
    authorize('create_asset'),
    validate(assetSchema.assetCreate)
  )
  public async createAsset(
    @requestParam('assetId') assetId: string,
    @requestHeaders('authorization') authorization: string,
    @requestBody() payload: {timestamp: number, sequenceNumber: number, signature: string}
  ): Promise<APIResponse> {
    const authToken = this.authService.getAuthToken(authorization);

    const idData = {'createdBy': authToken.createdBy, 'timestamp': payload.timestamp, 'sequenceNumber': payload.sequenceNumber};
    
    this.web3Service.validateSignature2(authToken.createdBy, payload.signature, idData);
    
    await this.assetService.createAsset(
      assetId,
      authToken.createdBy,
      payload.timestamp,
      payload.sequenceNumber,
      payload.signature
    );

    const result = await this.assetService.getAsset(assetId);

    return APIResponse.fromSingleResult(result);
  }
}
