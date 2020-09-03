/*
 * Copyright: Ambrosus Inc.
 * Email: tech@ambrosus.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { ObjectId } from 'mongodb';
import * as checkBase64 from 'is-base64';
// tslint:disable-next-line:no-var-requires
const web3 = require('web3');

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
