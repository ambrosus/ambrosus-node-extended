/* tslint:disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import 'reflect-metadata';
import { TYPE, MIDDLEWARE } from '../../src/constant/types';
import { iocContainer } from '../../src/inversify.config';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('(Inversify)', () => {

  describe('Database', () => {

    it('should resolve DBClient as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.DBClient);
      const instance2 = iocContainer.get(TYPE.DBClient);

      assert.equal(instance1, instance2, 'DBClient is Singleton');
    });

    it('should resolve AccountRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.AccountRepository);
      const instance2 = iocContainer.get(TYPE.AccountRepository);

      assert.equal(instance1, instance2, 'AccountRepository is Singleton');
    });

    it('should resolve AccountDetailRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.AccountDetailRepository);
      const instance2 = iocContainer.get(TYPE.AccountDetailRepository);

      assert.equal(instance1, instance2, 'AccountDetailRepository is Singleton');
    });

    it('should resolve AssetRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.AssetRepository);
      const instance2 = iocContainer.get(TYPE.AssetRepository);

      assert.equal(instance1, instance2, 'AssetRepository is Singleton');
    });

    it('should resolve EventRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.EventRepository);
      const instance2 = iocContainer.get(TYPE.EventRepository);

      assert.equal(instance1, instance2, 'EventRepository is Singleton');
    });

    it('should resolve BundleRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.BundleRepository);
      const instance2 = iocContainer.get(TYPE.BundleRepository);

      assert.equal(instance1, instance2, 'BundleRepository is Singleton');
    });

    it('should resolve OrganizationRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationRepository);
      const instance2 = iocContainer.get(TYPE.OrganizationRepository);

      assert.equal(instance1, instance2, 'OrganizationRepository is Singleton');
    });

    it('should resolve OrganizationRequestRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationRequestRepository);
      const instance2 = iocContainer.get(TYPE.OrganizationRequestRepository);

      assert.equal(instance1, instance2, 'OrganizationRequestRepository is Singleton');
    });

    it('should resolve OrganizationInviteRepository as Singleton', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationInviteRepository);
      const instance2 = iocContainer.get(TYPE.OrganizationInviteRepository);

      assert.equal(instance1, instance2, 'OrganizationInviteRepository is Singleton');
    });

  });

  describe('Controller', () => {

    it('should resolve RootController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.RootController);
      const instance2 = iocContainer.get(TYPE.RootController);

      assert.notEqual(instance1, instance2, 'RootController is Transient');
    });

    it('should resolve GraphQLController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.GraphQLController);
      const instance2 = iocContainer.get(TYPE.GraphQLController);

      assert.notEqual(instance1, instance2, 'GraphQLController is Transient');
    });

    it('should resolve AccountController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AccountController);
      const instance2 = iocContainer.get(TYPE.AccountController);

      assert.notEqual(instance1, instance2, 'AccountController is Transient');
    });

    it('should resolve AnalyticsController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AnalyticsController);
      const instance2 = iocContainer.get(TYPE.AnalyticsController);

      assert.notEqual(instance1, instance2, 'AnalyticsController is Transient');
    });

    it('should resolve AssetController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AssetController);
      const instance2 = iocContainer.get(TYPE.AssetController);

      assert.notEqual(instance1, instance2, 'AssetController is Transient');
    });

    it('should resolve EventController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.EventController);
      const instance2 = iocContainer.get(TYPE.EventController);

      assert.notEqual(instance1, instance2, 'EventController is Transient');
    });

    it('should resolve BundleController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.BundleController);
      const instance2 = iocContainer.get(TYPE.BundleController);

      assert.notEqual(instance1, instance2, 'BundleController is Transient');
    });

    it('should resolve OrganizationController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationController);
      const instance2 = iocContainer.get(TYPE.OrganizationController);

      assert.notEqual(instance1, instance2, 'OrganizationController is Transient');
    });

    it('should resolve OrganizationRequestController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationRequestController);
      const instance2 = iocContainer.get(TYPE.OrganizationRequestController);

      assert.notEqual(instance1, instance2, 'OrganizationRequestController is Transient');
    });

    it('should resolve OrganizationInviteController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationInviteController);
      const instance2 = iocContainer.get(TYPE.OrganizationInviteController);

      assert.notEqual(instance1, instance2, 'OrganizationInviteController is Transient');
    });

    it('should resolve MetricController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.MetricController);
      const instance2 = iocContainer.get(TYPE.MetricController);

      assert.notEqual(instance1, instance2, 'MetricController is Transient');
    });

    it('should resolve HealthController as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.HealthController);
      const instance2 = iocContainer.get(TYPE.HealthController);

      assert.notEqual(instance1, instance2, 'HealthController is Transient');
    });

  });

  describe('Service', () => {

    it('should resolve AuthService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AuthService);
      const instance2 = iocContainer.get(TYPE.AuthService);

      assert.notEqual(instance1, instance2, 'AuthService is Transient');
    });

    it('should resolve Web3Service as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.Web3Service);
      const instance2 = iocContainer.get(TYPE.Web3Service);

      assert.notEqual(instance1, instance2, 'Web3Service is Transient');
    });

    it('should resolve LoggerService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.LoggerService);
      const instance2 = iocContainer.get(TYPE.LoggerService);

      assert.notEqual(instance1, instance2, 'LoggerService is Transient');
    });

    it('should resolve AccountService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AccountService);
      const instance2 = iocContainer.get(TYPE.AccountService);

      assert.notEqual(instance1, instance2, 'AccountService is Transient');
    });

    it('should resolve AssetService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AssetService);
      const instance2 = iocContainer.get(TYPE.AssetService);

      assert.notEqual(instance1, instance2, 'AssetService is Transient');
    });

    it('should resolve EventService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.EventService);
      const instance2 = iocContainer.get(TYPE.EventService);

      assert.notEqual(instance1, instance2, 'EventService is Transient');
    });

    it('should resolve BundleService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.BundleService);
      const instance2 = iocContainer.get(TYPE.BundleService);

      assert.notEqual(instance1, instance2, 'BundleService is Transient');
    });

    it('should resolve AnalyticsService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.AnalyticsService);
      const instance2 = iocContainer.get(TYPE.AnalyticsService);

      assert.notEqual(instance1, instance2, 'AnalyticsService is Transient');
    });

    it('should resolve OrganizationService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.OrganizationService);
      const instance2 = iocContainer.get(TYPE.OrganizationService);

      assert.notEqual(instance1, instance2, 'OrganizationService is Transient');
    });

    it('should resolve EmailService as Transient', async () => {
      const instance1 = iocContainer.get(TYPE.EmailService);
      const instance2 = iocContainer.get(TYPE.EmailService);

      assert.notEqual(instance1, instance2, 'EmailService is Transient');
    });

  });

  describe('Other', () => {

    it('should resolve UserPrincipal as Request transient', async () => {
      const instance1 = iocContainer.get(TYPE.UserPrincipal);
      const instance2 = iocContainer.get(TYPE.UserPrincipal);

      expect(instance1).to.exist;
      expect(instance2).to.exist;

      assert.equal(instance1, instance2, 'UserPrincipal is Request transient');
    });

  });

});
