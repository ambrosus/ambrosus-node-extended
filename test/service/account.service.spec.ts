/* tslint:disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(require('chai-http'));
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

import { iocContainer } from '../../src/inversify.config';
import { all_accounts } from '../fixtures';
import { AccountService } from '../../src/service/account.service';
import { DBClient } from '../../src/database/client';

describe('(Service) Account', () => {
  let _DBClient: DBClient;
  let _AccountService: AccountService;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
  };

  const setup: any = () => {
    return new Promise(async (resolve, reject) => {
      try {
        _DBClient = iocContainer.get(TYPE.DBClient);
        _AccountService = iocContainer.get(TYPE.AccountService);
        db = await _DBClient.getConnection();
        collections.accounts = db.collection('accounts');
        collections.accountDetail = db.collection('accountDetail');

        // Insert demo accounts
        await all_accounts(collections);
      } catch (error) {
        console.log(error);
      }

      resolve();
    });
  }

  before(done => {
    setup().then(resp => done()).catch(error => done(error));
  });

  it('should succeed if DB is connected', () => {
    expect(db).to.exist;
    expect(db.serverConfig.isConnected()).to.be.true;
  });

  it('should succeed if AccountService instance exists', () => {
    expect(_AccountService).to.exist;
    expect(_AccountService instanceof AccountService).to.be.true;
  });

  // it('should succeed if valid address is passed', done => {
  //   _AccountService.getAccountExists('0x1403F4C7059206291E101F2932d73Ed013B2FF71')
  //     .then(result => {
  //       console.log(result);
  //       done();
  //     })
  //     .catch(error => done(error));
  // });

  after(done => {
    if (db.databaseName === 'hermes-test') {
      db.dropDatabase()
        .then(result => {
          _DBClient.mongoClient.close();
          done();
        })
        .catch(error => done(error));
    }
  });

});