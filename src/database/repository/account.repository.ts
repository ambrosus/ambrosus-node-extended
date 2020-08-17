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

import { TYPE } from '../../constant';
import {
  Account,
  APIQuery,
  MongoPagedResult,
  UserPrincipal,
  AccountDetail,
} from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { AmbrosusError } from '../../errors';

@injectable()
export class AccountRepository extends BaseRepository<Account> {

  constructor(@inject(TYPE.DBClient) protected client: DBClient) {
    super(client, 'accounts');
  }

  get timestampField(): string {
    return 'registeredOn';
  }

  get paginatedField(): string {
    return '_id';
  }

  get paginatedAscending(): boolean {
    return false;
  }

  public async getAccountForAuthorization(apiQuery: APIQuery): Promise<AccountDetail> {
    const pipeline = [
      {
        $lookup: {
          from: 'accountDetail',
          localField: 'address',
          foreignField: 'address',
          as: 'accountDetail',
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              {
                $arrayElemAt: ['$accountDetail', 0],
              },
              '$$ROOT',
            ],
          },
        },
      },
      {
        $match: apiQuery.query,
      },
      {
        $project: {
          accountDetail: 0,
          token: 0,
        },
      },
    ];
    apiQuery.query = pipeline;
    const result = await super.aggregate(apiQuery);

    if (result && result.length === 1) {
      return result[0];
    }
    if (result && result.length > 1) {
      throw new AmbrosusError({ reason: 'Single get query returned more than one object' });
    }
    return undefined;
  }

  public async getAccounts(
    apiQuery: APIQuery,
    organizationId: number,
    accessLevel: number,
    superAdmin: boolean = false
  ): Promise<MongoPagedResult> {
    const pipeline = this.getJoinPipeline(apiQuery.query, organizationId, accessLevel, superAdmin);
    apiQuery.query = pipeline;
    return super.aggregatePaging(apiQuery);
  }

  public async getAccount(
    apiQuery: APIQuery,
    organizationId: number,
    accessLevel: number,
    superAdmin: boolean = false
  ): Promise<Account> {
    const pipeline = this.getJoinPipeline(apiQuery.query, organizationId, accessLevel, superAdmin);
    apiQuery.query = pipeline;

    const result = await super.aggregate(apiQuery);
    if (result && result.length === 1) {
      return result[0];
    }
    if (result && result.length > 1) {
      throw new AmbrosusError({ reason: 'Single get query returned more than one object' });
    }
    return undefined;
  }

  public async update(address, changedParams) {
    await this.db.collection('accounts').updateOne({address}, {$set : {...changedParams}});
    return await this.db.collection('accounts').findOne({address}, {projection: {_id: 0}});
  }

  private getJoinPipeline(
    match: object,
    organizationId: number,
    accessLevel: number,
    superAdmin: boolean = false
  ) {
    const pipeline = [];

    pipeline.push({
      $lookup: {
        from: 'accountDetail',
        localField: 'address',
        foreignField: 'address',
        as: 'accountDetail',
      },
    });

    let matches = {};
    if (superAdmin) {
      matches = match || {};
    } else {
      matches = {
        ...match,
        organization: { $eq: organizationId },
        accessLevel: { $lte: accessLevel },
      };
    }
    pipeline.push({
      $match: matches,
    });

    pipeline.push({
      $replaceRoot: {
        newRoot: { $mergeObjects: [{ $arrayElemAt: ['$accountDetail', 0] }, '$$ROOT'] },
      },
    });

    pipeline.push({
      $project: {
        accountDetail: 0,
        token: 0,
        modifiedBy: 0,
        modifiedOn: 0,
      },
    });

    return pipeline;
  }

  /*
    Admin function: gets all accounts
  */
  public async getAllAccounts() {
    const apiQuery = new APIQuery();

    apiQuery.fields = {
      _id: 0,      
    };

    return this.find(apiQuery);
  }
}
