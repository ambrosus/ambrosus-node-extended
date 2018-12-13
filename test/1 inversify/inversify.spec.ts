/* tslint:disable */
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import 'reflect-metadata';
import { TYPE } from '../../src/constant/types';
import { iocContainer } from '../../src/inversify.config';
import { DBClient } from '../../src/database/client';

chai.use(chaiAsPromised);
const { expect, assert } = chai;

describe('(Inversify)', () => {

    it('should resolve DBclient', async () => {
        const dbClient = iocContainer.resolve(DBClient);

        expect(dbClient).to.exist;
    });

    it('should resolve DBclient as Singleton', async () => {
        const instance1 = iocContainer.get(TYPE.DBClient);
        const instance2 = iocContainer.get(TYPE.DBClient);

        assert.equal(instance1, instance2, 'DBclient is Singleton');
    });

    it('should resolve LoggerService as Transient', async () => {
        const instance1 = iocContainer.get(TYPE.LoggerService);
        const instance2 = iocContainer.get(TYPE.LoggerService);

        assert.notEqual(instance1, instance2, 'LoggerService is Transient');
    });

});
