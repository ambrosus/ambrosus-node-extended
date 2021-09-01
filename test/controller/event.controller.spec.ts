import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

import { iocContainer } from '../../src/inversify.config';
import { app_server } from '../../src';
import { all_accounts, insertOrganizations, events } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Event /event', () => {
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
        collections.events = db.collection('events');

        // Insert fixtures
        await all_accounts(collections);
        await insertOrganizations(collections);
        await events(collections);

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

  it('should succeed if DB is connected', () => {
    expect(db).to.exist;
    expect(db.serverConfig.isConnected()).to.be.true;
  });

  describe('(GET) /', () => {

    it('success as authorized', done => {
      chai.request(app_server)
        .get(`/event`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(4);
          done();
        });
    });

  });

  describe('(GET) /:eventId', () => {

    it('success as authorized', done => {
      const eventId = '0x8663d7863dc5131d5ad6050d44ed625cd299b78d2ce289ffc95e63b1559c3f63';
      chai.request(app_server)
        .get(`/event/${eventId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.eventId).to.eq(eventId);
          done();
        });
    });

  });

  describe('(GET) /exists/:eventId', () => {

    it('success as authorized', done => {
      const eventId = '0x8663d7863dc5131d5ad6050d44ed625cd299b78d2ce289ffc95e63b1559c3f63';
      chai.request(app_server)
        .get(`/event/exists/${eventId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data).to.be.true;
          done();
        });
    });

  });

  describe('(POST) /query', () => {

    it('success as authorized', done => {
      chai.request(app_server)
        .post(`/event/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(4);
          done();
        });
    });

    it('success as authorized, limit 2', done => {
      chai.request(app_server)
        .post(`/event/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .send({
          limit: 2,
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(2);
          done();
        });
    });

    it('success as authorized, with query', done => {
      chai.request(app_server)
        .post(`/event/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .send({
          query: [
            {
              field: 'content.data.assetType',
              value: `35-organization-asset`,
              operator: 'equal',
            },
          ],
          limit: 30,
        })
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(1);
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
