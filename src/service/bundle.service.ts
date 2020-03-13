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
import { DBClient } from '../database/client';
import { BundleRepository } from '../database/repository';
import { GridFSBucket } from 'mongodb';
import { NotFoundError } from '../errors';

import {
  APIQuery,
  Bundle,
  MongoPagedResult
} from '../model';

@injectable()
export class BundleService {
  private bundlesBucket;
  private blacklistedFields;

  constructor(
    @inject(TYPE.DBClient) protected client: DBClient,
    @inject(TYPE.BundleRepository) private readonly bundleRepository: BundleRepository
  ) {
    this.bundlesBucket = new GridFSBucket(client.db, { bucketName: 'bundles' });

    this.blacklistedFields = {
      _id: 0,
      repository: 0,
    };
  }

  public getBundleExists(bundleId: string) {
    return this.bundleRepository.existsOR({ bundleId }, 'bundleId');
  }

  public getBundles(apiQuery: APIQuery): Promise<MongoPagedResult> {
    apiQuery.fields = {
      'content.entries': 0,
    };
    return this.bundleRepository.findWithPagination(apiQuery);
  }

  public getBundle(bundleId: string): Promise<Bundle> {
    const apiQuery = new APIQuery();
    apiQuery.query = { bundleId };
    apiQuery.fields = {
      'content.entries': 0,
    };
    return this.bundleRepository.findOne(apiQuery);
  }

  public async getBundleStream(bundleId) {
    const bundle = await this.bundlesBucket.getBundleStream(bundleId);

    if (bundle === null) {
      throw new NotFoundError(`No bundle with id = ${bundleId} found`);
    }
    return bundle;
  }

  public async getBundleMetadata(bundleId) {
    const metadata = await this.client.db.collection('bundle_metadata').findOne({ bundleId }, { projection: this.blacklistedFields });
    if (metadata === null) {
      throw new NotFoundError(`No metadata found for bundleId = ${bundleId}`);
    }
    return metadata;
  }
}
