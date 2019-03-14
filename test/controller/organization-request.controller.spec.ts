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
import { app_server } from '../../src';
import { all_accounts, insertOrganizations, organizationRequests } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Organization request /organization/request', () => {
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
        collections.organization = db.collection('organization');
        collections.organizationRequest = db.collection('organizationRequest');

        // Insert fixtures
        await all_accounts(collections);
        await insertOrganizations(collections);
        await organizationRequests(collections);

        tokens.super_account = _Web3Service.getToken('0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9');
        tokens.admin_account = _Web3Service.getToken('0xa06c37def3a202c94508d3cb45c0009b91b85861f90284f4ce98f1ec6ce9913a');
        tokens.regular_account = _Web3Service.getToken('0x0926f9a238aae2cdee9a687615f52052630b23f5511638204cd7d3fe4e0f53de');
      } catch (error) {
        console.log('Error: ', error);
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

  describe('(GET) /', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/organization/request`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(2);
          done();
        });
    });

    it('fails as admin_account', done => {
      chai.request(app_server)
        .get(`/organization/request`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /refused', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/organization/request/refused`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(1);
          done();
        });
    });

    it('fails as admin_account', done => {
      chai.request(app_server)
        .get(`/organization/request/refused`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:address', () => {

    it('success as super_account', done => {
      const address = '0x475fd3FAA4C28de5aA4E6Ab168BFC5e732a1FAAE';
      chai.request(app_server)
        .get(`/organization/request/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.address).to.eq(address);
          done();
        });
    });

  });

  describe('(GET) /:address/approve', () => {

    it('success as super_account', done => {
      const address = '0x475fd3FAA4C28de5aA4E6Ab168BFC5e732a1FAAE';
      chai.request(app_server)
        .get(`/organization/request/${address}/approve`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(202);
          done();
        });
    });

  });

  describe('(GET) /:address/refuse', () => {

    it('success as super_account', done => {
      const address = '0xED3F43988aD00A74a5E3ed592cC94cB919D9306F';
      chai.request(app_server)
        .get(`/organization/request/${address}/refuse`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(202);
          done();
        });
    });

  });

  describe('(POST) /', () => {

    it('success, no authorization', done => {
      chai.request(app_server)
        .post(`/organization/request`)
        .send({
          title: 'Some title',
          email: 'lazareric.com+asd@gmail.com',
          address: '0xF8a597fc6C409d98e674502D6107d98EFc5B0ddB',
          message: 'Asd'
        })
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('success, no authorization, no title', done => {
      chai.request(app_server)
        .post(`/organization/request`)
        .send({
          email: 'lazareric.com+2@gmail.com',
          address: '0xeF58EC75Ed86a7137c8A11C9D90fD9De77bBd730',
          message: 'Request with no title'
        })
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('fail, organization request exists', done => {
      chai.request(app_server)
        .post(`/organization/request`)
        .send({
          title: 'Some title 2',
          email: 'request1@test.com',
          address: '0xF8a597fc6C409d98e674502D6107d98EFc5B0ddB',
          message: 'Asd'
        })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

  });

  after(done => {
    if (db && db.s.databaseName === 'hermes-test') {
      db.dropDatabase()
        .then(result => {
          done();
        })
        .catch(error => done(error));
    }
  });

});