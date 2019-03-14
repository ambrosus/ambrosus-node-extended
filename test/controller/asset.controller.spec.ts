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
import { all_accounts, insertOrganizations, assets } from '../fixtures';
import { Web3Service } from '../../src/service/web3.service';
import { DBClient } from '../../src/database/client';

describe('(Controller) Asset /asset', () => {
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
        collections.assets = db.collection('assets');
        collections.events = db.collection('events');

        // Insert fixtures
        await all_accounts(collections);
        await insertOrganizations(collections);
        await assets(collections);

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

    it('success as authorized', done => {
      chai.request(app_server)
        .get(`/asset`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(10);
          done();
        });
    });

  });

  describe('(GET) /:assetId', () => {

    it('success as authorized', done => {
      const assetId = '0x6904151c80b33a26925bf940b061c7d365dee013f468adc555d6c699dc0e3b79';
      chai.request(app_server)
        .get(`/asset/${assetId}`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.assetId).to.eq(assetId);
          done();
        });
    });

  });

  describe('(GET) /exists/:assetId', () => {

    it('success as authorized', done => {
      const assetId = '0x6904151c80b33a26925bf940b061c7d365dee013f468adc555d6c699dc0e3b79';
      chai.request(app_server)
        .get(`/asset/exists/${assetId}`)
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
        .post(`/asset/query`)
        .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body.data.length).to.eq(10);
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