import formSchemaTypeDef from "./typeDefs/formSchema.typeDef";
import formResponseTypeDef from "./typeDefs/formResponse.typeDef";
import formSchemaResolver from "./resolvers/formSchema.resolver";
import formResponseResolver from "./resolvers/formResponse.resolver";

export const typeDefs = [formSchemaTypeDef, formResponseTypeDef];
export const resolvers = [formSchemaResolver, formResponseResolver];
