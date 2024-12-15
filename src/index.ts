import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { buildSchema } from 'graphql';
import Redis from 'ioredis';

// Initialize Redis
const testgit=0;
const redis = new Redis(); // Defaults to localhost:6379

// Define GraphQL schema
const schema = buildSchema(`
  type Query {
    getValue(key: String!): String
  }
  type Mutation {
    setValue(key: String!, value: String!): String
    deleteKey(key: String!): String
  }
`);

// Define resolvers
const root = {
  getValue: async ({ key }: { key: string }) => {
    const value = await redis.get(key);
    return value || 'Key not found';
  },
  setValue: async ({ key, value }: { key: string; value: string }) => {
    await redis.set(key, value);
    return `Set key ${key} to ${value}`;
  },
  deleteKey: async ({ key }: { key: string }) => {
    await redis.del(key);
    return `Deleted key ${key}`;
  },
};

// Create an Express server and a GraphQL endpoint
const app = express();
app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`GraphQL server running at http://localhost:${PORT}/graphql`);
});
