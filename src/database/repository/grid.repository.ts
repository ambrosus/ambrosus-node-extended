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

import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { ILogger } from '../../interface/logger.inferface';
import { DBClient } from '../client';
import { GridFSBucket } from 'mongodb';
import { NotFoundError } from '../../errors';

@injectable()
export class GridRepository {
  private bundlesBucket;
  private blacklistedFields;

  constructor(
    @inject(TYPE.LoggerService) private readonly logger: ILogger,
    @inject(TYPE.DBClient) protected client: DBClient
  ) {
    this.blacklistedFields = {
      _id: 0,
      repository: 0,
    };
  }

  public async getConnection() {
    if (this.bundlesBucket === undefined) {
      this.bundlesBucket = new GridFSBucket(this.client.db, { bucketName: 'bundles' });

      console.log('GridRepository.getConnection()');
    }
  }

  public async getBundleStream(bundleId) {
    await this.getConnection();

    if (!await this.client.isFileInGridFSBucket(bundleId, this.bundlesBucket)) {
      throw new NotFoundError({ reason: `No bundle with id = ${bundleId} found`});
    }

    const bundle = await this.bundlesBucket.openDownloadStreamByName(bundleId);

    return bundle;
  }

  public async getBundleMetadata(bundleId) {
    await this.getConnection();

    const metadata = await this.client.db.collection('bundle_metadata').findOne({ bundleId }, { projection: this.blacklistedFields });

    if (metadata === null) {
      throw new NotFoundError(`No metadata found for bundleId = ${bundleId}`);
    }
    return metadata;
  }
}
