/* tslint:disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(require('chai-http'));
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { iocContainer } from '../../src/inversify.config';
import { app_server } from '../../src';

describe('(API) Account /account', () => {
  let _Web3Service: any;
  let _DBClient: any;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
  };
  let tokens = {
    super_account: '',
    regular_account: '',
  };

  const setup: any = () => {
    return new Promise(async (resolve, reject) => {
      _DBClient = iocContainer.get(TYPE.DBClient);
      _Web3Service = iocContainer.get(TYPE.Web3Service);
      db = _DBClient.db;
      collections.accounts = db.collection('accounts');
      collections.accountDetail = db.collection('accountDetail');

      // Insert super account
      await collections.accounts.insertOne({
        address: '0x2C81A356c33D95574a2D502874196d21a2507daD',
        accessLevel: 5,
        permissions: [
          'super_account',
          'manage_accounts',
          'register_accounts',
          'create_event',
          'create_asset'
        ]
      });
      await collections.accountDetail.insertOne({
        address: '0x2C81A356c33D95574a2D502874196d21a2507daD',
        email: 'super@test.com',
      })
      tokens.super_account = _Web3Service.getToken('0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9');

      // Insert regular account
      await collections.accounts.insertOne({
        address: '0xC0ED5673359298153c79a33E6a2eB110fEa2F973',
        accessLevel: 0,
        permissions: [
          'create_event',
          'create_asset'
        ]
      });
      await collections.accountDetail.insertOne({
        address: '0xC0ED5673359298153c79a33E6a2eB110fEa2F973',
        email: 'regular@test.com',
      })
      tokens.regular_account = _Web3Service.getToken('0x3f800cf76bf964eec334096e709f23c099ed182f2c9f8666c7dceeb532f949c8');

      resolve();
    });
  }

  before(done => {
    try {
      setup().then(resp => done()).catch(error => done(error));
    } catch (error) {
      console.error(error);
      done(error);
    }

  });

  it('(GET) /keyPair - success', done => {
    chai.request(app_server)
      .get(`/account/keyPair`)
      .end((err, res) => {
        res.should.have.status(200);
        expect(res.body.data.address).to.exist;
        expect(res.body.data.privateKey).to.exist;
        done();
      });
  });

  it('(GET) / - success', done => {
    chai.request(app_server)
      .get(`/account`)
      .set('Authorization', `AMB_TOKEN ${tokens.super_account}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('array');
        expect(res.body.data.length).to.equal(2);
        done();
      });
  });

  it('(GET) / - fail, w/o super_account permission', done => {
    chai.request(app_server)
      .get(`/account`)
      .set('Authorization', `AMB_TOKEN ${tokens.regular_account}`)
      .end((err, res) => {
        res.should.have.status(403);
        done();
      });
  });

  it('(PUT) /:address - succeess, edit own account', done => {
    const address = '0xC0ED5673359298153c79a33E6a2eB110fEa2F973';
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

  it('(PUT) /:address - fail, edit another account w/o super_account permission', done => {
    const address = '0x2C81A356c33D95574a2D502874196d21a2507daD';
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