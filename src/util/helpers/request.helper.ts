import { Request } from 'express';

export const getParamValue = (req: Request, name: string) => {
  {
    const params = req.params || {};
    const body = req.body || {};
    const query = req.query || {};

    if (undefined !== params[name] && params.hasOwnProperty(name)) {
      return params[name];
    }
    if (undefined !== body[name]) {
      return body[name];
    }
    if (undefined !== query[name]) {
      return query[name];
    }
    return undefined;
  }
};
