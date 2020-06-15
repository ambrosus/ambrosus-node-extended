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

import { injectable } from 'inversify';

import { MongoPagedResult } from '../query/mongo-paged-result.model';
import { APIResponseMeta } from './api-res-meta.model';
import { APIResponsePagination } from './api-res-pagination.model';
import { HttpResponseMessage, JsonContent } from 'inversify-express-utils';
import * as HttpStatus from 'http-status-codes';

import { NotFoundError } from '../../errors';

export interface IAPIResponse {
  meta: APIResponseMeta;
  pagination: APIResponsePagination;
  data: any;
}

@injectable()
export class APIResponse extends HttpResponseMessage {
  public static fromMongoPagedResult(mongoPagedResult: MongoPagedResult): APIResponse {
    const pagination = APIResponsePagination.fromMongoPagedResult(mongoPagedResult);
    const meta = new APIResponseMeta(HttpStatus.OK);
    let data = undefined;
    if (mongoPagedResult.results) {
      meta.count = mongoPagedResult.results.length;
      data = mongoPagedResult.results;
    } else {
      meta.message = 'No results found';
      data = [];
    }
    return new APIResponse(data, meta, pagination);
  }

  public static fromSingleResult(result: any, extraMeta?: object): APIResponse {
    let meta = new APIResponseMeta(HttpStatus.OK);
    let data = undefined;

    if (result) {
      data = result;
    } else {
      throw new NotFoundError({reason: `not found`});

      // meta.message = 'No results found';
      // data = {};
    }
    if (extraMeta) {
      meta = { ...meta, ...extraMeta };
    }
    return new APIResponse(data, meta);
  }

  public static withMeta(meta: APIResponseMeta): APIResponse {
    return new APIResponse(undefined, meta);
  }

  constructor(_data: any, _meta: APIResponseMeta, _pagination?: APIResponsePagination) {
    super(_meta.code);
    this.content = new JsonContent({
      data: _data,
      meta: _meta,
      pagination: _pagination,
    });
  }
}
