/* tslint:disable */
import * as chai from 'chai';
const { expect } = chai;

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { iocContainer } from '../../src/inversify.config';

describe('(Start DB)', () => {
  let db: any;

  before(done => {
    const _DBClient: any = iocContainer.get(TYPE.DBClient);
    _DBClient.getConnection()
      .then(database => {
        db = database;
        done();
      })
      .catch(error => done(error));
  });

  it('should succeed if DB is connected', () => {
    expect(db).to.exist;
    expect(db.serverConfig.isConnected()).to.be.true;
  });

});