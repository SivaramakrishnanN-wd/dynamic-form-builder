import formSchemaTypeDef from "./typeDefs/formSchema.typeDef";
import formResponseTypeDef from "./typeDefs/formResponse.typeDef";
import formSchemaResolver from "./resolvers/formSchema.resolver";
import formResponseResolver from "./resolvers/formResponse.resolver";

// Both DocumentNodes are passed as an array — Apollo Server 3 merges them.
// formResponse.typeDef uses `extend type Query/Mutation` to avoid conflicts.
export const typeDefs = [formSchemaTypeDef, formResponseTypeDef];

export const resolvers = {
  Query: {
    ...formSchemaResolver.Query,
    ...formResponseResolver.Query,
  },
  Mutation: {
    ...formSchemaResolver.Mutation,
    ...formResponseResolver.Mutation,
  },
};
