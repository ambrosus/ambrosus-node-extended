import { HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { Request, Response } from 'express';
import { printSchema } from 'graphql';
import { inject } from 'inversify';
import { BaseHttpController, controller, httpGet, httpPost } from 'inversify-express-utils';
import * as url from 'url';

import { TYPES } from '../constant/types';
import { IGraphQLSchema } from '../graphql';

@controller('/graphql', TYPES.AuthorizedMiddleware)
export class GraphQLController extends BaseHttpController {
  constructor(@inject(TYPES.GraphQLSchema) private graphQL: IGraphQLSchema) {
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
