import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { Account, APIQuery, APIResult, UserPrincipal } from '../model';
import { AccountRepository } from '../database/repository';

@injectable()
export class AccountService {
  constructor(
    @inject(TYPES.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPES.AccountRepository) private readonly accountRepository: AccountRepository
  ) {}

  public getAccounts(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'registeredOn';
    apiQuery.sortAscending = false;

    return this.accountRepository.query(apiQuery, this.user.accessLevel);
  }

  public getAccount(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.single(apiQuery, this.user.accessLevel);
  }

  public getAccountForAuth(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.singleAccountAuth(apiQuery);
  }
}
