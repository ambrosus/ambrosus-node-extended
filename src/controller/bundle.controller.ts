/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
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

import {
  Request,
  Response
} from 'express';

import { inject } from 'inversify';
import {
  controller,
  httpGet,
  httpPost,
  response,
  requestParam
} from 'inversify-express-utils';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { validate } from '../middleware';
import { authorize } from '../middleware/authorize.middleware';
import {
  APIQuery,
  APIResponse,
  Bundle
} from '../model';
import { BundleService } from '../service/bundle.service';
import { querySchema } from '../validation';
import { BaseController } from './base.controller';

import { NotFoundError } from '../errors';

function streamFinished(stream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    stream.on('end', () => resolve());
    stream.on('error', () => reject());
  });
}

@controller(
  '/bundle',
  MIDDLEWARE.Context
  // authorize()
)

export class BundleController extends BaseController {
  constructor(
    @inject(TYPE.BundleService) private bundleService: BundleService,
    @inject(TYPE.LoggerService) protected logger: ILogger
  ) {
    super(logger);
  }

  @httpGet(
    '/',
    authorize()
  )
  public async getBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }

  /* @httpGet('/:bundleId')
  public async getBundle(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    console.log('getBundle');

    const result = await this.bundleService.getBundle(bundleId);
    return APIResponse.fromSingleResult(result);
  } */

  @httpGet('/:bundleId')
  public async getBundle(
    @requestParam('bundleId') bundleId: string,
    @response() res: Response
  ) {
    const bundleStream = await this.bundleService.getBundleStream(bundleId);

    let result = '';

    bundleStream.on('data', (chunk) => {
      result += chunk;
    });

    await streamFinished(bundleStream);

    res.status(200).json(result);
  }

  @httpGet('/:bundleId/info')
  public async getBundleInfo(
    @requestParam('bundleId') bundleId: string
  ): Promise<Bundle> {
    const result = await this.bundleService.getBundle(bundleId);

    if (result === undefined) {
      throw new NotFoundError({ reason: `No bundle with id = ${bundleId} found`});
    }

    return result;
  }

  @httpGet(
    '/exists/:bundleId',
    authorize()
  )
  public async getBundleExists(
    @requestParam('bundleId') bundleId: string
  ): Promise<APIResponse> {
    const result = await this.bundleService.getBundleExists(bundleId);
    return APIResponse.fromSingleResult(result);
  }

  @httpPost(
    '/query',
    validate(querySchema),
    authorize()
  )
  public async queryBundles(req: Request): Promise<APIResponse> {
    const result = await this.bundleService.getBundles(
      APIQuery.fromRequest(req)
    );
    return APIResponse.fromMongoPagedResult(result);
  }
}
