import * as bodyParser from 'body-parser';
import * as express from 'express';
import { printSchema } from 'graphql';
import { graphiqlExpress, graphqlExpress } from 'graphql-server-express';
import { inject, injectable } from 'inversify';

import { TYPES } from '../constant/types';
import { IGraphQLSchema } from '../graphql';

@injectable()
export class GraphQLController {
  constructor(@inject(TYPES.GraphQLSchema) private graphQL: IGraphQLSchema) {}

  public setup(app: express.Application): void {
    app.use(
      '/gql',
      bodyParser.json(),
      graphqlExpress((req, res) => {
        return {
          schema: this.graphQL.schema,
          context: {
            token: req.headers.authorization,
          },
        };
      })
    );

    app.use(
      '/graphiql',
      graphiqlExpress({
        endpointURL: '/gql',
      })
    );

    app.use('/schema', (req, res) => {
      res.set('Content-Type', 'text/plain');
      res.send(printSchema(this.graphQL.schema));
    });
  }
}
