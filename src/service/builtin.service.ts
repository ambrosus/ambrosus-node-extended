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

import { config } from '../config';

import { TYPE } from '../constant/types';

import { 
  injectable,
  inject
} from 'inversify';

import { Account } from '../model';

import { ILogger } from '../interface/logger.inferface';
import { Organization, APIQuery } from '../model';
import { getTimestamp } from '../util';
import { AccountRepository } from '../database/repository';
import { OrganizationRepository } from '../database/repository';
import { StateService } from '../service/state.service';
import { AccountService } from '../service/account.service';
import { Web3Service } from '../service/web3.service';

const builtInPrivateKey = 'builtInPrivateKey';

@injectable()
export class BuiltInService {
  constructor(
    @inject(TYPE.LoggerService) protected logger: ILogger,
    @inject(TYPE.AccountRepository) private accountRepository: AccountRepository,
    @inject(TYPE.OrganizationRepository) private organizationRepository: OrganizationRepository,
    @inject(TYPE.StateService) private stateService: StateService,
    @inject(TYPE.AccountService) private accountService: AccountService,
    @inject(TYPE.Web3Service) private web3Service: Web3Service
  ) {    
  }

  public checkBuiltInAccount = async () => {
    this.logger.info('checkBuiltInAccount: ...');

    let privateKey = '';
  
    try {
      privateKey = await this.stateService.read(builtInPrivateKey);
    } catch(e) {      
      privateKey = this.web3Service.createKeyPair().privateKey;      

      await this.stateService.write(builtInPrivateKey, privateKey);

      this.logger.debug('checkBuiltInAccount: generated privateKey.');
    }

    const address = this.web3Service.addressFromSecret(privateKey);
  
    const accountProbe = await this.accountRepository.getAccount(new APIQuery({ address }), 0, 1000, true);
    
    if (accountProbe === undefined ) {
      this.logger.debug('checkBuiltInAccount: creating account ...');

      const newAccount = new Account();
      newAccount.address = address;
      newAccount.accessLevel = 1000;
      newAccount.organization = 0;
      newAccount.permissions = ['super_account', 'manage_accounts', 'register_accounts'];
      newAccount.registeredBy = address;
      newAccount.registeredOn = getTimestamp();
      newAccount.active = true;

      await this.accountRepository.create(newAccount);

      this.logger.debug('checkBuiltInAccount: account created.');
    } else {
      this.logger.debug('checkBuiltInAccount: account found.');
    }

    this.logger.info('checkBuiltInAccount: address', address);    
  };

  public checkBuiltInOrganization = async () => {
    this.logger.info('checkBuiltInOrganization: ...');
  
    const organizationProbe = await this.organizationRepository.findOne(new APIQuery({ organizationId: 0 }));
  
    if (organizationProbe === undefined) {
      this.logger.debug('checkBuiltInOrganization: creating organization ...');
  
      const organization = new Organization;
      organization.owner = config.builtinAddress;
      organization.title = 'built-in';
      organization.active = true;
      organization.createdBy = config.builtinAddress;
      organization.organizationId = 0;
      organization.createdOn = getTimestamp();
  
      await this.organizationRepository.create(organization);

      this.logger.debug('checkBuiltInOrganization: organization created.');
    } else {
      this.logger.info('checkBuiltInOrganization: organization found.');
    }
  }

  public checkBuiltIn = async () => {
    await this.checkBuiltInAccount();
    await this.checkBuiltInOrganization();
  }
}