import { ObjectId } from 'mongodb';

export const isObjectId = (schema, data) => {
  return new Promise((resolve, reject) => {
    try {
      const value = new ObjectId(data);
      /* tslint:disable */
      resolve(value == data);
    } catch (e) { resolve(false); }
  });
};
