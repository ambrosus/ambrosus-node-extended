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
}
