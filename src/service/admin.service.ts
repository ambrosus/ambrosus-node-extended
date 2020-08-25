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

import { config } from '../config';

import { TYPE } from '../constant/types';
import {
  AccountRepository,
  AccountDetailRepository,
  OrganizationRepository,
  OrganizationKeysRepository,
  WorkerIntervalsRepository,
} from '../database/repository';

import {
  ConfigData,
  APIQuery,
  WorkerInterval,
  UserPrincipal,
  OrganizationKey
} from '../model';

import {
  ensureCanPushBundle
} from '../security/access.check';

import {
  InternalError
} from '../errors';

import { Web3Service } from '../service/web3.service';

@injectable()
export class AdminService {
  constructor(
    @inject(TYPE.UserPrincipal) private readonly user: UserPrincipal,
    @inject(TYPE.Web3Service) private web3Service: Web3Service,
    @inject(TYPE.AccountRepository) private readonly accountRepository: AccountRepository,
    @inject(TYPE.AccountDetailRepository) private readonly accountDetailRepository: AccountDetailRepository,
    @inject(TYPE.OrganizationRepository) private readonly organizationRepository: OrganizationRepository,
    @inject(TYPE.OrganizationKeysRepository) private readonly organizationKeysRepository: OrganizationKeysRepository,
    @inject(TYPE.WorkerIntervalsRepository) private readonly workerIntervalsRepository: WorkerIntervalsRepository
  ) {
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

  public async getConfig(): Promise<ConfigData> {
    const result = new ConfigData;

    result.address = this.web3Service.addressFromSecret(config.web3.privateKey);

    result.content = {
      organizations: await this.organizationRepository.getAll(),
      organizationKeys: await this.organizationKeysRepository.getAll(),
      accounts: await this.accountRepository.getAll(),
      accountDetails: await this.accountDetailRepository.getAll(),
    };

    return result;
  }

  public async restoreConfig(conf: ConfigData) {
    await this.ensureCanRestoreConfig(conf.address);

    await this.organizationRepository.deleteAll();
    await this.organizationKeysRepository.deleteAll();

    await this.accountRepository.deleteAll();
    await this.accountDetailRepository.deleteAll();

    await this.accountRepository.createBulk(conf.content.accounts);
    await this.accountDetailRepository.createBulk(conf.content.accountDetails);

    await this.organizationRepository.createBulk(conf.content.organizations);
    await this.organizationKeysRepository.createBulk(conf.content.organizationKeys);
  }

  private async ensureCanRestoreConfig(address: string) {
    const nodeAddress = this.web3Service.addressFromSecret(config.web3.privateKey);

    if (address !== nodeAddress) {
      throw new InternalError( {reason: 'node address mismatch'} );
    }

    const organizationCount = await this.organizationRepository.count(new APIQuery());

    if (organizationCount > 1) {
      throw new InternalError( {reason: 'more than one organization found'} );
    }

    const accountCount = await this.accountRepository.count(new APIQuery());

    if (accountCount > 1) {
      throw new InternalError( {reason: 'more than one account found'} );
    }
  }
}
