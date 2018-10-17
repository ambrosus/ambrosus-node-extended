import * as graphql from 'graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { injectable, multiInject } from 'inversify';
import { merge } from 'lodash';

import { TYPES } from '../constant/types';

export interface IGraphQLSchema {
  schema: graphql.GraphQLSchema;
}

export interface IGraphQLType {
  defs: string;
}

export interface IGraphQLResolver {
  resolver: object;
}

@injectable()
export class GraphQLSchema implements IGraphQLSchema {
  public schema;

  public constructor(
    @multiInject(TYPES.GraphQLType) typesClasses: IGraphQLType[],
    @multiInject(TYPES.GraphQLResolver) resolversClasses: IGraphQLResolver[]
  ) {
    const typeDefs = typesClasses.map(t => t.defs);
    const resolvers = merge(resolversClasses.map(r => r.resolver));

    this.schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }
}
