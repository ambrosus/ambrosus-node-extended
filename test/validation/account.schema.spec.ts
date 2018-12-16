/* tslint:disable */
import * as Ajv from 'ajv';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';

import { accountSchema, isAddress, isBase64, isObjectId } from '../../src/validation';

chai.use(chaiAsPromised);
const { expect } = chai;

const ajv = new Ajv({ allErrors: true });

describe('(Schema) Accounts', () => {
    let test: any;

    before(() => {
        ajv.addKeyword('isObjectId', {
            async: true,
            type: 'string',
            validate: isObjectId,
        });
        ajv.addKeyword('isBase64', {
            async: true,
            type: 'string',
            validate: isBase64,
        });
        ajv.addKeyword('isAddress', {
            async: true,
            type: 'string',
            validate: isAddress,
        });
        test = ajv.compile(accountSchema.accountDetails);
    });

    describe('Account details', () => {

        it('should fail with no data provided', async () => {
            try {
                await test({});
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');
            }
        });

        it('should fail with no address provided', async () => {
            try {
                await test({});
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const data: any = {};
                error.errors.map(error => data[error.params.missingProperty] = error);

                expect(data.address).to.exist;
            }
        });

        it('should fail with fullName and timeZone requiring min 2 and 3 characters', async () => {
            try {
                await test({
                    fullName: 'a',
                    timeZone: 'aa',
                });
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const data: any = {};
                error.errors.map(error => {
                    const title = (error.dataPath.split('.'))[1];
                    data[title] = error;
                });

                expect(data.fullName.keyword).to.equal('minLength');
                expect(data.timeZone.keyword).to.equal('minLength');
            }
        });

        it('should fail with email being invalid', async () => {
            try {
                await test({
                    email: 'lazareric.com'
                });
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const data: any = {};
                error.errors.map(error => {
                    const title = (error.dataPath.split('.'))[1];
                    data[title] = error;
                });

                expect(data.email.keyword).to.equal('pattern');
            }
        });

        it('should fail with address being invalid web3 address', async () => {
            try {
                await test({
                    address: '123'
                });
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const data: any = {};
                error.errors.map(error => {
                    const title = (error.dataPath.split('.'))[1];
                    data[title] = error;
                });

                expect(data.address.keyword).to.equal('isAddress');
            }
        });

        it('should succeed with address being valid web3 address', async () => {
            try {
                const validate = await test({
                    address: '0x92C4e1E93820cab92718F30C4dDE3d7D8743B5E6'
                });
                expect(validate).to.haveOwnProperty('address');
            } catch (error) {
                expect(error).to.not.haveOwnProperty('errors');
            }
        });

        it('should fail with additional properties', async () => {
            try {
                await test({
                    new: 'asd'
                });
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const additionalProperties = error.errors.map(error => error.keyword === 'additionalProperties');
                expect(additionalProperties).to.exist;
            }
        });

        it('should fail with token being invalid base64', async () => {
            try {
                await test({
                    token: '123'
                });
            } catch (error) {
                expect(error).to.haveOwnProperty('errors');

                const data: any = {};
                error.errors.map(error => {
                    const title = (error.dataPath.split('.'))[1];
                    data[title] = error;
                });

                expect(data.token.keyword).to.equal('isBase64');
            }
        });

        it('should succeed with token being valid base64', async () => {
            try {
                const validate = await test({
                    address: '0x92C4e1E93820cab92718F30C4dDE3d7D8743B5E6',
                    token: 'eyJ2ZXJzaW9uIjozLCJpZCI6IjA1MGU4MmNiLWQwOTctNDMxYS1iZTUzLTk1MGZkNjk0N2Q1YiIsImFkZHJlc3MiOiIyZmRiMjYyZjA3MTY2NjZlYjBjZTMyNTA5ZGIxOWJlMzhlNThjZDI4IiwiY3J5cHRvIjp7ImNpcGhlcnRleHQiOiI0MDVmMzZmYWQ2MjIyNTg1NjgzNzhkZDA4ZDFiNGJmMzhmNjBmMWEyZWZlOTIyN2Q3OTgzMTA4ZmUyYTY2NWRkIiwiY2lwaGVycGFyYW1zIjp7Iml2IjoiOTdlNzcyZmQ2ZjQ2YTc3NGRiNGZmMDFiZjFjNjVjYTAifSwiY2lwaGVyIjoiYWVzLTEyOC1jdHIiLCJrZGYiOiJzY3J5cHQiLCJrZGZwYXJhbXMiOnsiZGtsZW4iOjMyLCJzYWx0IjoiMTg1NGIwZDFkYjE1MzdjYjc1NDQ4MTZiMDY3NjliZTliMTU4M2I3MTU1MmUwOWE5ZjIyY2ZjYTU4MDY1MGJjZCIsIm4iOjgxOTIsInIiOjgsInAiOjF9LCJtYWMiOiI4Zjk5MjU0M2JlYjMxNzJiMDU3OTM0YjAwNDNlNDVhYmUyOGNmNWQ0Y2FmZTQ2NjVmYzRjMzFlNDhkOTE1MDM4In19'
                });

                expect(validate).to.haveOwnProperty('address');
                expect(validate).to.haveOwnProperty('token');
            } catch (error) {
                expect(error).to.not.haveOwnProperty('errors');
            }
        });

    });
});
