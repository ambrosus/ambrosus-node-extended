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

import { HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { Request, Response } from 'express';
import { printSchema } from 'graphql';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils';
import * as url from 'url';

import { MIDDLEWARE, TYPE } from '../constant/types';
import { IGraphQLSchema } from '../graphql';
import { authorize } from '../middleware/authorize.middleware';

@controller(
  '/graphql',
  MIDDLEWARE.Context,
  authorize()
)
export class GraphQLController extends BaseHttpController {

  constructor(@inject(TYPE.GraphQLSchema) private graphQL: IGraphQLSchema) {
    super();
  }

  @httpPost('/')
  public async get(req: Request, res: Response) {
    const options = {
      schema: this.graphQL.schema,
      context: this.httpContext,
    };
    return runHttpQuery([req, res], {
      options,
      method: req.method,
      query: req.method === 'POST' ? req.body : req.query,
    }).then(
      gqlResponse => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Length', Buffer.byteLength(gqlResponse, 'utf8').toString());
        res.write(gqlResponse);
        res.end();
      },
      (error: HttpQueryError) => {
        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            res.setHeader(header, error.headers[header]);
          });
        }

        res.statusCode = error.statusCode;
        res.write(error.message);
        res.end();
      }
    );
  }

  @httpGet('/playground')
  public playground(req: Request, res: Response) {
    return new Promise(() => {
      const options = {
        endpointURL: '/graphql',
      };
      const query = req.url && url.parse(req.url, true).query;
      GraphiQL.resolveGraphiQLString(query, options, req).then(graphiqlString => {
        res.setHeader('Content-Type', 'text/html');
        res.write(graphiqlString);
        res.end();
      });
    });
  }

  @httpGet('/schema')
  public schema(req: Request, res: Response) {
    return new Promise(() => {
      res.set('Content-Type', 'text/plain');
      res.send(printSchema(this.graphQL.schema));
    });
  }
}
