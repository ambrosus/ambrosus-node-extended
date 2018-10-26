import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { ILogger } from '../interface/logger.inferface';
import { Account, APIQuery, APIResult, UserPrincipal } from '../model';
import { AccountRepository } from '../database/repository';

@injectable()
export class AccountService {
  @inject(TYPES.AccountRepository)
  public accountRepository: AccountRepository;

  @inject(TYPES.LoggerService)
  public logger: ILogger;

  constructor(@inject(TYPES.AccessLevel) private readonly accessLevel: number) {}

  public getAccounts(apiQuery: APIQuery): Promise<APIResult> {
    apiQuery.paginationField = 'registeredOn';
    apiQuery.sortAscending = false;
    return this.accountRepository.query(apiQuery, this.accessLevel);
  }

  public getAccount(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.single(apiQuery, this.accessLevel);
  }

  public getAccountForAuth(address: string): Promise<Account> {
    const apiQuery = new APIQuery();
    apiQuery.query = { address };
    return this.accountRepository.singleAccountAuth(apiQuery);
  }
}
