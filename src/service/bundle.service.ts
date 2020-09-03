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

import { TYPE } from '../constant/types';
import {
  BundleRepository,
  GridRepository,
  AccountRepository,
  WorkerIntervalsRepository,
} from '../database/repository';

import {
  APIQuery,
  Bundle,
  WorkerInterval,
  MongoPagedResult,
  UserPrincipal
} from '../model';

import {
  ensureCanPushBundle
} from '../security/access.check';

@injectable()
export class BundleService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.BundleRepository) private readonly bundleRepository: BundleRepository,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository,
    @inject(TYPE.WorkerIntervalsRepository) private readonly workerIntervalsRepository: WorkerIntervalsRepository,
    @inject(TYPE.GridRepository) private readonly gridRepository: GridRepository
  ) {
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
      '_id': 0,
      'content.entries': 0,
    };

    return this.bundleRepository.findOne(apiQuery);
  }

  public async getBundleStream(bundleId: string) {
    return await this.gridRepository.getBundleStream(bundleId);
  }

  public async pushBundle() {
    const executor = await this.accountRepository.getAccount(
      new APIQuery(
        {
          address: this.user.authToken.createdBy,
        }
      ), 0, 1000, true);

    await ensureCanPushBundle( executor );

    const workerInterval = new WorkerInterval;

    workerInterval.name = 'bundlesWorker';
    workerInterval.when = 0;

    this.workerIntervalsRepository.create(workerInterval);

    return;
  }
}
