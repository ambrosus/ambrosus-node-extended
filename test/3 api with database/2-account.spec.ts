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
  let _DBClient: any;
  let db: any;
  let collections: any = {
    accounts: '',
    accountDetail: '',
  };
  let token = 'eyJpZERhdGEiOnsiY3JlYXRlZEJ5IjoiMHgyQzgxQTM1NmMzM0Q5NTU3NGEyRDUwMjg3NDE5NmQyMWEyNTA3ZGFEIiwidmFsaWRVbnRpbCI6MTcwMjQ4NjUzOH0sInNpZ25hdHVyZSI6IjB4MTBlNDU1ZTdlZTQ0ZDBkNDlmYzUxYWE4MmU2N2U2ZDZkZDBhNzQyOGNhMDI2ZGYzOGNiN2VmZGQxZGVmY2ViNTEzY2Q2OGZhYmQ4MjQzNDI4MDVhNzE0NDZkZTFhNjVhYzhmZThhMDM1YjZkNTQyNDEzN2ViNzA0OWRiZDU0MGIxYiJ9';

  before(done => {
    try {
      _DBClient = iocContainer.get(TYPE.DBClient);
      db = _DBClient.db;
      collections.accounts = db.collection('accounts');
      collections.accountDetail = db.collection('accountDetail');
      // Insert first account
      // Address: 0x2C81A356c33D95574a2D502874196d21a2507daD
      // Secret: 0xce75741e246852f1bf8e4f86ccf7d56f77942c37ea7b683d3a3735f1635de7c9
      collections.accounts.insertOne({
        address: '0x2C81A356c33D95574a2D502874196d21a2507daD',
        accessLevel: 5,
        permissions: [
          'super_account',
          'manage_accounts',
          'register_accounts',
          'create_event',
          'create_asset'
        ]
      })
        .then(inserted => done())
        .catch(error => done(error));
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
      .set('Authorization', `AMB_TOKEN ${token}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.data.should.be.a('array');
        expect(res.body.data.length).to.equal(1);
        expect(res.body.data[0].address).to.equal('0x2C81A356c33D95574a2D502874196d21a2507daD');
        done();
      });
  });

});