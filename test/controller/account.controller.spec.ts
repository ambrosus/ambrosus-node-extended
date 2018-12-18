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
import { all_accounts, all_organizations } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Account /account', () => {
  let _Web3Service: Web3Service;
  let _DBClient: DBClient;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
    organization: '',
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

        // Insert fixtures
        await all_accounts(collections);
        await all_organizations(collections);

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

  describe('(GET) /', () => {

    it('success, as super account', done => {
      chai.request(app_server)
        .get(`/account`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.data.should.be.a('array');
          expect(res.body.data.length).to.equal(3);
          done();
        });
    });

    it('fail, as regular account, w/o super_account permission', done => {
      chai.request(app_server)
        .get(`/account`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(403);
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

    it('fail, no authorization, email doesnt exists, token doesnt exists', done => {
      chai.request(app_server)
        .post(`/account/secret`)
        .send({
          email: 'asd@test.com',
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.token).to.not.exist;
          done();
        });
    });

  });

  describe('(POST) /query', () => {

    it('success, as super_account', done => {
      chai.request(app_server)
        .post(`/account/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.equal(3);
          done();
        });
    });

    it('fail, w/o super_account permission', done => {
      chai.request(app_server)
        .post(`/account/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
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