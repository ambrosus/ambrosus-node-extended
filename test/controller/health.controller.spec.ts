/* tslint:disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(require('chai-http'));
const { expect } = chai;
const should = chai.should();

import 'reflect-metadata';
import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

import { app_server } from '../../src';

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