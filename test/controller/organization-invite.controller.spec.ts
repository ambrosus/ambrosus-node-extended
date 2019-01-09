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
import { all_accounts, all_organizations, organizationRequests, organizationInvites } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Organization invite /organization/invite', () => {
  let _Web3Service: Web3Service;
  let _DBClient: DBClient;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
    organization: '',
    organizationInvite: '',
  };
  let tokens = {
    super_account: '',
    admin_account: '',
    regular_account: '',
  };

  const setup: any = () => {
    return new Promise(async (resolve, reject) => {
      try {
        _DBClient = iocContainer.get(TYPE.DBClient);
        _Web3Service = iocContainer.get(TYPE.Web3Service);
        db = await _DBClient.getConnection();
        collections.accounts = db.collection('accounts');
        collections.accountDetail = db.collection('accountDetail');
        collections.organization = db.collection('organization');
        collections.organizationInvite = db.collection('organizationInvite');

        // Insert fixtures
        await all_accounts(collections);
        await all_organizations(collections);
        await organizationInvites(collections);

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
        .get(`/organization/invite`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(1);
          done();
        });
    });

    it('success as admin of organization', done => {
      chai.request(app_server)
        .get(`/organization/invite`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(2);
          done();
        });
    });

  });

  describe('(GET) /:inviteId/exists', () => {

    it('success, no authorization', done => {
      const inviteId = '13a78393a31d4dc9a42541aec88e7cfc';
      chai.request(app_server)
        .get(`/organization/invite/${inviteId}/exists`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data).to.be.true;
          done();
        });
    });

  });

  describe('(POST) /:inviteId/accept', () => {

    it('success, no authorization', done => {
      const inviteId = '13a78393a31d4dc9a42541aec88e7cfc';
      chai.request(app_server)
        .post(`/organization/invite/${inviteId}/accept`)
        .send({
          address: '0x6d90C4Ccc3988bE57ED1267E68Be96048380364F',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data).to.eq('0x6d90C4Ccc3988bE57ED1267E68Be96048380364F');
          done();
        });
    });

  });

  describe('(DELETE) /:inviteId', () => {

    it('success, as super_account', done => {
      const inviteId = '23a78393a31d4dc9a42541aec88e7cfc';
      chai.request(app_server)
        .del(`/organization/invite/${inviteId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.meta.deleted).to.eq(1);
          done();
        });
    });

    it('success, as admin_account', done => {
      const inviteId = '33a78393a31d4dc9a42541aec88e7cfc';
      chai.request(app_server)
        .del(`/organization/invite/${inviteId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.meta.deleted).to.eq(1);
          done();
        });
    });

  });

  describe('(POST) /', () => {

    it('success, as super_account', done => {
      chai.request(app_server)
        .post(`/organization/invite`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .send({
          email: [
            'test1@test.com',
            'test2@test.com',
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.sent.length).to.eq(2);
          done();
        });
    });

    it('success, as admin_account', done => {
      chai.request(app_server)
        .post(`/organization/invite`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .send({
          email: [
            'test34@test.com',
            'test35@test.com',
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.sent.length).to.eq(2);
          done();
        });
    });

  });

  describe('(POST) /resend', () => {

    it('success, as super_account', done => {
      chai.request(app_server)
        .post(`/organization/invite/resend`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .send({
          email: [
            'test1@test.com',
            'super@test.com',
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.sent.length).to.eq(1);
          expect(res.body.data.errors.length).to.eq(1);
          done();
        });
    });

    it('success, as admin_account', done => {
      chai.request(app_server)
        .post(`/organization/invite/resend`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .send({
          email: [
            'test35@test.com',
            'super@test.com',
          ],
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.sent.length).to.eq(1);
          expect(res.body.data.errors.length).to.eq(1);
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