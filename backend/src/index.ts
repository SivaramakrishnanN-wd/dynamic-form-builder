import express from "express";
import { ApolloServer } from "apollo-server-express";
import connectDB from "./config/db";
import { typeDefs, resolvers } from "./graphql";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";

dotenv.config();

const startServer = async () => {
  const app = express();
  
  // Connect to Database
  await connectDB();

  // Parse JSON bodies
  app.use(express.json());

  // Setup Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  // Use Error Handler
  app.use(errorHandler);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  });
};

startServer().catch(err => {
  console.error("Failed to start server", err);
});
