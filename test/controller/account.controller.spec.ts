import { expect } from 'chai';
import { AccountController } from '../../src/controller/account.controller';
import { AccountService } from '../../src/service/account.service';

class AccountRepositoryMock {
  public client;

  get timestampField(): any {
    return 'registeredOn';
  }

  get accessLevelField(): any {
    return 'accessLevel';
  }

  public singleAccountAuth(apiQuery: any) {
    return {};
  }
}

describe('UserController', () => {
  let controller;

  beforeEach(() => {
    controller = new AccountController(new AccountService(new AccountRepositoryMock()));
  });

  it('should get back all user', done => {
    controller.getUsers().then(data => {
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

      done();
    });
  });

  it('should give back the right user', done => {
    controller
      .getUser({
        params: {
          id: 'Lorem',
        },
      })
      .then(data => {
        expect(data).to.deep.equal({
          email: 'lorem@ipsum.com',
          name: 'Lorem',
        });

        done();
      });
  });

  it('should add a new user', done => {
    controller
      .newUser({
        body: {
          email: 'test@test.com',
          name: 'test',
        },
      })
      .then(result => {
        expect(result).to.deep.equal({
          email: 'test@test.com',
          name: 'test',
        });

        done();
      });
  });

  it('should update a existing user', done => {
    controller
      .updateUser({
        body: {
          email: 'changed@changed.com',
          name: 'Lorem',
        },
        params: {
          id: 'Lorem',
        },
      })
      .then(result => {
        expect(result).to.deep.equal({
          email: 'changed@changed.com',
          name: 'Lorem',
        });

        done();
      });
  });

  it('should delete a user', done => {
    controller
      .deleteUser({
        params: {
          id: 'Lorem',
        },
      })
      .then(result => {
        expect(result).to.equal('Lorem');
        done();
      });
  });
});
