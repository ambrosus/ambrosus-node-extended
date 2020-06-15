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

describe('(Controller) Account /account', () => {
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

  describe('(GET) /keyPair', () => {

    it('success', done => {
      chai.request(app_server)
        .get(`/account/keyPair`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.address).to.exist;
          expect(res.body.data.privateKey).to.exist;
          done();
        });
    });

  });

  describe('(GET) /:address', () => {

    it('succeess, get own account', done => {
      const address = '0x1403F4C7059206291E101F2932d73Ed013B2FF71';
      chai.request(app_server)
        .get(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.address).to.equal(address);
          done();
        });
    });

    it('succeess, as a super_account', done => {
      const address = '0x1403F4C7059206291E101F2932d73Ed013B2FF71';
      chai.request(app_server)
        .get(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data).to.exist;
          done();
        });
    });

    it('fail, as not super_account nor own account', done => {
      const address = '0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9';
      chai.request(app_server)
        .get(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

  });

  describe('(GET) /:address/details', () => {

    it('succeess, gets account with no authorization', done => {
      chai.request(app_server)
        .get(`/account/0x2C81A356c33D95574a2D502874196d21a2507daD/details`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.account.address).to.equal('0x2C81A356c33D95574a2D502874196d21a2507daD');
          done();
        });
    });

    it('fail, with no accunt with such address', done => {
      chai.request(app_server)
        .get(`/account/0x2C81A356c33D95574a2D502874196d21a25asdaD/details`)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });

  describe('(PUT) /:address', () => {

    it('succeess, edit own account', done => {
      const address = '0x1403F4C7059206291E101F2932d73Ed013B2FF71';
      chai.request(app_server)
        .put(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .send({
          fullName: 'Some Name',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.fullName).to.equal('Some Name');
          done();
        });
    });

    it('succeess, as super_account', done => {
      const address = '0x1403F4C7059206291E101F2932d73Ed013B2FF71';
      chai.request(app_server)
        .put(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .send({
          fullName: 'Some Name',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.fullName).to.equal('Some Name');
          done();
        });
    });

    it('fail, edit another account w/o super_account permission', done => {
      const address = '0xcD156e06318801B441Df42d7064538baEE3747E3';
      chai.request(app_server)
        .put(`/account/${address}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .send({
          fullName: 'Some Name',
        })
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:address/exists', () => {

    it('success, no authorization, account exists', done => {
      const address = '0xcD156e06318801B441Df42d7064538baEE3747E3';
      chai.request(app_server)
        .get(`/account/${address}/exists`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.should.be.true;
          done();
        });
    });

    it('success, no authorization, account doesnt exists', done => {
      const address = '0xcD156f06318801B441Df42d7064538baEE3747E3';
      chai.request(app_server)
        .get(`/account/${address}/exists`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

  });

  describe('(POST) /secret', () => {

    it('success, no authorization, email exists, token exists', done => {
      chai.request(app_server)
        .post(`/account/secret`)
        .send({
          email: 'admin@test.com',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.token).to.exist;
          done();
        });
    });

    it('success, no authorization, email exists, token doesnt exists', done => {
      chai.request(app_server)
        .post(`/account/secret`)
        .send({
          email: 'regular@test.com',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.token).to.not.exist;
          done();
        });
    });

    it('fail, no authorization, email doesnt exists, doesnt exists', done => {
      chai.request(app_server)
        .post(`/account/secret`)
        .send({
          email: 'asd@test.com',
        })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

  });

  describe('(POST) /create', () => {

    it('success, as admin', done => {
      chai.request(app_server)
        .post(`/account2/create/0xC769C64a70ECA2606A927DC28DD947A5Dbec237B`)
        .send({
          email: 'test7b@domain.com'
        })
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('fail, w/o register_account permission', done => {
      chai.request(app_server)
        .post(`/account2/create/0xC769C64a70ECA2606A927DC28DD947A5Dbec237B`)
        .send({
          email: 'test7b@domain.com'
        })
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(403);
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