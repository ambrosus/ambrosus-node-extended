import { inject, injectable } from 'inversify';
import * as _ from 'lodash';

import { TYPE } from '../constant/types';
import { AccountRepository } from '../database/repository';
import { Account, APIQuery, APIResult, UserPrincipal } from '../model';

@injectable()
export class AccountService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository
  ) {}

  public getAccountExists(address: string) {
    return this.accountRepository.existsOr({ address }, 'address');
  }

  public getAccounts(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'registeredOn';
    apiQuery.sortAscending = false;

    return this.accountRepository.queryAccounts(apiQuery, this.user.accessLevel);
  }

  public getAccount(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.queryAccount(apiQuery, this.user.accessLevel);
  }

  public getAccountForAuth(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.getAccountForAuthorization(apiQuery);
  }
}
