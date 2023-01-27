import { All, Controller, Req, Res } from '@nestjs/common';
import { ApolloServer } from '@apollo/server';
import {
  executeHTTPGraphQLRequest,
  Raw,
  Request,
  Response,
} from '@node-libraries/nest-apollo-server';

import { gql } from 'graphql-tag';

export const typeDefs = gql`
  scalar Date
  type Query {
    date: Date!
  }
`;

export const resolvers = {
  Query: {
    date: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return new Date();
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});

apolloServer.start();

@Controller('/graphql')
export class GraphqlController {
  @All()
  async graphql(@Req() req: Request, @Res() res: Response) {
    await executeHTTPGraphQLRequest({
      req,
      res,
      apolloServer,
      context: async () => ({ req: Raw(req), res: Raw(res) }),
    });
  }
}
