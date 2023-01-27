import { promises as fs } from 'fs';
import { All, Controller, Req, Res } from '@nestjs/common';
import { ApolloServer } from '@apollo/server';
import {
  executeHTTPGraphQLRequest,
  FormidableFile,
  Raw,
  Request,
  Response,
} from '@node-libraries/nest-apollo-server';

export const typeDefs = `
  # Return date
  scalar Date
  type Query {
    date: Date!
  }

  # Return file information
  type File {
    name: String!
    type: String!
    value: String!
  }
  scalar Upload
  type Mutation {
    upload(file: Upload!): File!
  }
`;

export const resolvers = {
  Query: {
    date: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return new Date();
    },
  },
  Mutation: {
    upload: async (_context, { file }: { file: FormidableFile }) => {
      return {
        name: file.originalFilename,
        type: file.mimetype,
        value: await fs.readFile(file.filepath, { encoding: 'utf8' }),
      };
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
      options: {
        //Maximum upload file size set at 10 MB
        maxFileSize: 10 * 1024 * 1024,
      },
    });
  }
}
