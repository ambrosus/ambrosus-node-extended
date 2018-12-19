/* tslint:disable */
import * as chai from 'chai';

const { expect } = chai;
const should = chai.should();

import { config } from '../../src/config';
config.db.dbName = 'hermes-test';

const {
  port,
  paginationMax,
  paginationDefault,
  dashboardUrl,
  db,
  web3,
  email,
} = config;

describe('(ENV VARS) test', () => {

  it('has port', () => {
    expect(port).to.exist;
  });

  it('has paginationMax', () => {
    expect(paginationMax).to.exist;
  });

  it('has paginationDefault', () => {
    expect(paginationDefault).to.exist;
  });

  it('has dashboardUrl', () => {
    expect(dashboardUrl).to.exist;
  });

  describe('db', () => {

    it('has hosts', () => {
      expect(db.hosts).to.exist;
    });

    it('has dbName', () => {
      expect(db.dbName).to.exist;
    });

  });

  describe('web3', () => {

    it('has rpc', () => {
      expect(web3.rpc).to.exist;
    });

    it('has privateKey', () => {
      expect(web3.privateKey).to.exist;
    });

  });

  describe('email', () => {

    it('has api', () => {
      expect(email.api).to.exist;
    });
    it('has defaultFrom', () => {
      expect(email.defaultFrom).to.exist;
    });
    it('has orgReqTo', () => {
      expect(email.orgReqTo).to.exist;
    });
    it('has templateIdInvite', () => {
      expect(email.templateIdInvite).to.exist;
    });
    it('has templateIdOrgReq', () => {
      expect(email.templateIdOrgReq).to.exist;
    });
    it('has templateIdOrgReqApprove', () => {
      expect(email.templateIdOrgReqApprove).to.exist;
    });
    it('has templateIdOrgReqRefuse', () => {
      expect(email.templateIdOrgReqRefuse).to.exist;
    });

  });

});