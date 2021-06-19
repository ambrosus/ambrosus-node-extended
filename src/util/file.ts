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

import fs from 'fs';
import path from 'path';

export const writeFile = (filepath, data, opts = {}) =>
  new Promise((resolve, reject) => {
    fs.mkdir(path.dirname(filepath), { recursive: true }, (err) => {
      if (err) {
        throw new Error(`can't create dir for ${filepath}: ${err}`);
      }
    });

    fs.writeFile(filepath, data, opts, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

export const readFile = async (filepath: string) =>
  new Promise((resolve, reject) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });

export const removeFile = (filepath) =>
  new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(void(0));
      }
    });
  });

export const checkFileExists = (filepath) =>
  new Promise((resolve) => {
    fs.access(filepath, (err) => {
      resolve(!err);
    });
  });

export const listDirectory = (filepath) =>
  new Promise((resolve, reject) => {
    fs.readdir(filepath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

export const removeDirectory = (filepath) =>
  new Promise((resolve, reject) => {
    fs.rmdir(filepath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(void(0));
      }
    });
  });

export const makeDirectory = (filepath) =>
  new Promise((resolve, reject) => {
    fs.mkdir(filepath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(void(0));
      }
    });
  });

export const getfilepath = (filepath) =>
  new Promise((resolve, reject) => {
    fs.lstat(filepath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
