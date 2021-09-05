import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import chaiHttp = require('chai-http');

chai.use(chaiHttp);
chai.use(chaiAsPromised);
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

import { app_server } from '../../src/main';

describe('(Controller) Health /health', () => {
  describe('(GET) /', () => {
    it('success', done => {
      chai.request(app_server)
        .get(`/health`)
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });
  });
});
