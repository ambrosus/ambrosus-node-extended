export * from './datetime.util';
export * from './mongo.util';
export * from './request.util';
export * from './crypto.util';
export * from './email.util';

export const matchHexOfLength = (text, length) =>
  new RegExp(`^0x[a-f0-9]{${length}}$`, 'gi').test(text);

export const to = promise => {
  return new Promise((resolve, reject) => {
    promise
      .then(response => resolve(response))
      .catch(error => reject({ error }));
  });
};
