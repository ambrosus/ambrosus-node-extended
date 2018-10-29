import { expect } from 'chai';
import { AccountController } from '../../src/controller/account.controller';
import { AccountService } from '../../src/service/account.service';
import { AccountRepository } from '../../src/database/repository';
import { UserPrincipal, Account } from '../../src/model';
import { DBClient } from '../../src/database/client';

describe('AccountService', () => {
  let service;

  beforeEach(() => {
    const user = new UserPrincipal();
    const client = new DBClient();
    const repo = new AccountRepository(client);
    service = new AccountService(user, repo);
  });

  it('should get back all accounts', () => {
    const req = {};
    service.getAccounts(req).then(data => {
      expect(data).to.deep.equal([
        {
          email: 'lorem@ipsum.com',
          name: 'Lorem',
        },
        {
          email: 'doloe@sit.com',
          name: 'Dolor',
        },
      ]);
    });
  });
});
s