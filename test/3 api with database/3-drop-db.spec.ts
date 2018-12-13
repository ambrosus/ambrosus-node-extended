/* tslint:disable */
import * as chai from 'chai';
const { expect } = chai;

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { iocContainer } from '../../src/inversify.config';

describe('(Close DB)', () => {
  let _DBClient: any;
  let db: any;

  before(() => {
    _DBClient = iocContainer.get(TYPE.DBClient);
    db = _DBClient.db;
  });

  it('should drop the test database succesfully', done => {
    db.dropDatabase()
      .then(result => {
        expect(result).to.be.true;
        done();
      })
      .catch(error => done(error));
  });

  after(() => {
    _DBClient.mongoClient.close();
    process.exit(0);
  });

});