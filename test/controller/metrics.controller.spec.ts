import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

import { app_server } from '../../src/main';
import { iocContainer } from '../../src/inversify.config';
import { TYPE } from '../../src/constant';
import { all_accounts } from '../fixtures';
import { DBClient } from '../../src/database/client';
import { Web3Service } from '../../src/service/web3.service';

describe('(Controller) Metrics /metrics', () => {
  let _Web3Service: Web3Service;
  let _DBClient: DBClient;
  let db: any;
  let collections: any = {};
  let tokens: any = {};

  const setup: any = () => {
    return new Promise(async (resolve, reject) => {
      try {
        _DBClient = iocContainer.get(TYPE.DBClient);
        _Web3Service = iocContainer.get(TYPE.Web3Service);
        db = await _DBClient.getConnection();
        collections.accounts = db.collection('accounts');
        collections.accountDetail = db.collection('accountDetail');

        // Insert fixtures
        await all_accounts(collections);

        tokens.super_account = _Web3Service.getToken('0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9');
        tokens.admin_account = _Web3Service.getToken('0xa06c37def3a202c94508d3cb45c0009b91b85861f90284f4ce98f1ec6ce9913a');
        tokens.regular_account = _Web3Service.getToken('0x0926f9a238aae2cdee9a687615f52052630b23f5511638204cd7d3fe4e0f53de');
      } catch (error) {
        console.log('Error: ', error);
      }

      resolve(void(0));
    });
  };

  before(done => {
    setup().then(resp => done()).catch(error => done(error));
  });

  describe('(GET) /', () => {

    it('success', done => {
      chai.request(app_server)
        .get(`/metrics`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

  });

  after(done => {
    if (db.databaseName === 'hermes-test') {
      db.dropDatabase()
        .then(result => {
          done();
        })
        .catch(error => done(error));
    }
  });

});
