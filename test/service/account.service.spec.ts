import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';

import { DBClient } from '../../src/database/client';
import { AccountDetailRepository, AccountRepository } from '../../src/database/repository';
import { UserPrincipal } from '../../src/model';
import { AccountService } from '../../src/service/account.service';
import { LoggerService } from '../../src/service/logger.service';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const { expect } = chai;

describe('AccountService', () => {
  let service;
  let client;
  before(done => {
    client = new DBClient();
    client.events.on('dbConnected', () => {
      done();
    });
  });

  beforeEach(() => {
    const user = new UserPrincipal();
    const accountRepo = new AccountRepository(client);
    accountRepo.logger = new LoggerService();
    const accountDetailRepo = new AccountDetailRepository(client);
    accountDetailRepo.logger = new LoggerService();
    service = new AccountService(user, accountRepo, accountDetailRepo);
  });

  it('should give back account exists', async () => {
    const address = '0x2A52139de123c9fa265C206772d1606e326CC044';
    await expect(service.getAccountExists(address)).to.be.eventually.equal(true);
  });
});
