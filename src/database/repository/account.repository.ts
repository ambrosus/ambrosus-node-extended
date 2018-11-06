import { inject, injectable } from 'inversify';

import { TYPE } from '../../constant';
import { Account, APIQuery, MongoPagedResult, UserPrincipal, AmbrosusError } from '../../model';
import { DBClient } from '../client';
import { BaseRepository } from './base.repository';
import { NoUndefinedVariables } from 'graphql/validation/rules/NoUndefinedVariables';

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

  public getAccountForAuthorization(apiQuery: APIQuery): Promise<Account> {
    return super.findOne(apiQuery);
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
    console.log(result);
    if (result && result.length === 1) {
      return result[0];
    }
    if (result && result.length > 1) {
      throw new AmbrosusError('Single get query returned more than one object', 400);
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
      matches = match;
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
      },
    });

    return pipeline;
  }
}
