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
import { all_accounts, insertOrganizations } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Organization /organization', () => {
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

        // Insert fixtures
        await all_accounts(collections);
        await insertOrganizations(collections);

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
        .get(`/organization`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(3);
          done();
        });
    });

    it('fail as admin_account', done => {
      chai.request(app_server)
        .get(`/organization`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:organizationId', () => {

    it('success as super_account', done => {
      const organizationId = 2;
      chai.request(app_server)
        .get(`/organization/${organizationId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.organizationId).to.eq(2);
          done();
        });
    });

    it('success as admin_account, own organization', done => {
      const organizationId = 2;
      chai.request(app_server)
        .get(`/organization/${organizationId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.organizationId).to.eq(2);
          done();
        });
    });

    it('fail as admin_account, another organization', done => {
      const organizationId = 1;
      chai.request(app_server)
        .get(`/organization/${organizationId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:organizationId/accounts', () => {

    it('success as super_account', done => {
      const organizationId = 2;
      chai.request(app_server)
        .get(`/organization/${organizationId}/accounts`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(2);
          done();
        });
    });

    it('success as admin_account, own organization', done => {
      const organizationId = 2;
      chai.request(app_server)
        .get(`/organization/${organizationId}/accounts`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(2);
          done();
        });
    });

    it('fail as admin_account, another organization', done => {
      const organizationId = 1;
      chai.request(app_server)
        .get(`/organization/${organizationId}/accounts`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(POST) /:organizationId/accounts', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .post(`/organization`)
        .send({
          owner: '0x2Cb65761Be6DB9fA05bA2720D1c31c1e10B3Bb3b',
          title: 'Organization for new account',
          active: true,
        })
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(201);
          done();
        });
    });

    it('fail, account exists', done => {
      chai.request(app_server)
        .post(`/organization`)
        .send({
          owner: '0x1403F4C7059206291E101F2932d73Ed013B2FF71',
          title: 'Organization for regular_account',
          active: true,
        })
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    it('fail w/o super_account', done => {
      chai.request(app_server)
        .post(`/organization`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .send({
          owner: '0x1403F4C7059206291E101F2932d73Ed013B2FF71',
          title: 'Organization for regular_account',
          active: true,
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(PUT) /:organizationId', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .put(`/organization/2`)
        .send({
          title: 'New organization title',
        })
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.title).to.eq('New organization title');
          done();
        });
    });

    it('success as admin_account, own organization', done => {
      chai.request(app_server)
        .put(`/organization/2`)
        .send({
          title: 'New organization title 2',
        })
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.title).to.eq('New organization title 2');
          done();
        });
    });

    it('fails as admin_account, title exists', done => {
      chai.request(app_server)
        .put(`/organization/2`)
        .send({
          title: 'New organization title 2',
        })
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('fail admin_account, another organization', done => {
      chai.request(app_server)
        .put(`/organization/1`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .send({
          title: 'New organization title',
        })
        .end((err, res) => {
          res.should.have.status(403);
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