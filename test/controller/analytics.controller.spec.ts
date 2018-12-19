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
import { all_accounts, all_organizations, assets, events } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Analytics /analytics', () => {
  let _Web3Service: Web3Service;
  let _DBClient: DBClient;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
    organization: '',
    assets: '',
    events: '',
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
        collections.assets = db.collection('assets');
        collections.events = db.collection('events');

        // Insert fixtures
        await all_accounts(collections);
        await all_organizations(collections);
        await assets(collections);
        await events(collections);

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

  describe('(GET) /:organizationId/:collection/count', () => {

    it('success as super_account, another organization', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(4);
          done();
        });
    });

    it('success as organization admin of his organization', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(4);
          done();
        });
    });

    it('fail, organization collection not allowed', done => {
      chai.request(app_server)
        .get(`/analytics/2/organization/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('fail as admin_account, another organization', done => {
      chai.request(app_server)
        .get(`/analytics/1/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('fail as regular_account', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:organizationId/:collection/count/:start/:end/total', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(2);
          done();
        });
    });

    it('success as admin_account of his organization', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(2);
          done();
        });
    });

    it('fail as admin_account, another organization', done => {
      chai.request(app_server)
        .get(`/analytics/1/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('fail as regular_account', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:organizationId/:collection/count/:start/:end/aggregate/:group', () => {

    it('success as super_account, per hour', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1544979381}/${1545079381}/aggregate/hour`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count[res.body.data.count.length - 2].count).to.eq(2);
          done();
        });
    });

    it('success as admin_account of his organization, per day', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1535079201}/${1545079381}/aggregate/day`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count[res.body.data.count.length - 1].count).to.eq(2);
          done();
        });
    });

    it('fail as admin_account, another organization', done => {
      chai.request(app_server)
        .get(`/analytics/1/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('fail as regular_account', done => {
      chai.request(app_server)
        .get(`/analytics/2/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:collection/count', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(10);
          done();
        });
    });

    it('fail as admin_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:collection/count/:start/:end/total', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count).to.eq(6);
          done();
        });
    });

    it('fail as admin_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count/${1535079201}/${1545079381}/total`)
        .set('Authorization', `AMB_TOKEN ${tokens.admin_account}`)
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

  });

  describe('(GET) /:collection/count/:start/:end/aggregate/group', () => {

    it('success as super_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count/${1535079201}/${1545079381}/aggregate/day`)
        .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.count[res.body.data.count.length - 1].count).to.eq(3);
          done();
        });
    });

    it('fail as admin_account', done => {
      chai.request(app_server)
        .get(`/analytics/asset/count/${1535079201}/${1545079381}/aggregate/day`)
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