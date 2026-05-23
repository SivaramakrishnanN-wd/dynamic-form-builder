import express from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import { typeDefs, resolvers } from "./graphql";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";

dotenv.config();

async function startServer(): Promise<void> {
  // 1 — Connect to MongoDB
  await connectDB();

  // 2 — Create Express app
  const app = express();
  app.use(
    cors({
      origin: [
        "http://localhost:5173",
        "https://dynamic-form-builder-sigma-lac.vercel.app/"
      ],
      credentials: true,
    })
  );
  app.use(express.json());

  // 3 — Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
      console.error("[GraphQL Error]", error.message);
      return error;
    },
  });

  await server.start();


  // 4 — Apply Apollo middleware to Express
  // Cast required because apollo-server-express@3 types expect Express 4
  server.applyMiddleware({ app: app as any, path: "/graphql" });

  // 5 — Global error handler (must be last)
  app.use(errorHandler);

  // 6 — Start listening
  const PORT = process.env.PORT ?? 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(
      `📡 GraphQL playground: http://localhost:${PORT}${server.graphqlPath}`
    );
  });
}

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
