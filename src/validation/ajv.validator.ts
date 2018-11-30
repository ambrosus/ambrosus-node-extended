import { ObjectId } from 'mongodb';
import * as checkBase64 from 'is-base64';
import web3 = require('web3');

export const isObjectId = (schema, data) => {
  return new Promise((resolve, reject) => {
    try {
      const value = new ObjectId(data);
      /* tslint:disable */
      resolve(value == data);
    } catch (e) {
      resolve(false);
    }
  });
};

export const isBase64 = (schema, data) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(checkBase64(data));
    } catch (e) {
      resolve(false);
    }
  });
}

export const isAddress = (schema, data) => {
  return new Promise((resolve, reject) => {
    try {
      resolve(web3.utils.isAddress(data));
    } catch (e) {
      resolve(false);
    }
  });
}
