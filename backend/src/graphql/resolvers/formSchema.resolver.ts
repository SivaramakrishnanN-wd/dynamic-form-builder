import FormSchema from "../../models/FormSchema.model";

const formSchemaResolver = {
  Query: {
    // Fetch single form schema by formId
    getFormSchema: async (_: any, { formId }: { formId: string }) => {
      try {
        const schema = await FormSchema.findOne({ formId, "meta.status": { $ne: "archived" } });
        if (!schema) throw new Error(`Form schema with id "${formId}" not found`);
        return schema;
      } catch (error) {
        throw new Error(`Error fetching form schema: ${error}`);
      }
    },

    // Fetch all active form schemas
    listFormSchemas: async () => {
      try {
        const schemas = await FormSchema.find({ "meta.status": { $ne: "archived" } });
        return schemas;
      } catch (error) {
        throw new Error(`Error fetching form schemas: ${error}`);
      }
    },
  },

  Mutation: {
    // Create a new form schema
    createFormSchema: async (_: any, { input }: { input: any }) => {
      try {
        const existing = await FormSchema.findOne({ formId: input.formId });
        if (existing) throw new Error(`Form schema with id "${input.formId}" already exists`);

        const schema = new FormSchema({
          ...input,
          meta: {
            ...input.meta,
            version: 1,
            status: "active",
          },
        });

        await schema.save();
        return schema;
      } catch (error) {
        throw new Error(`Error creating form schema: ${error}`);
      }
    },

    // Update existing form schema and increment version
    updateFormSchema: async (
      _: any,
      { formId, input }: { formId: string; input: any }
    ) => {
      try {
        const existing = await FormSchema.findOne({ formId });
        if (!existing) throw new Error(`Form schema with id "${formId}" not found`);

        // Increment version on every update
        const newVersion = existing.meta.version + 1;

        const updated = await FormSchema.findOneAndUpdate(
          { formId },
          {
            ...input,
            meta: {
              ...(existing.toObject() as any).meta,
              ...input.meta,
              version: newVersion,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );

        return updated;
      } catch (error) {
        throw new Error(`Error updating form schema: ${error}`);
      }
    },

    // Soft delete — sets status to archived
    deleteFormSchema: async (_: any, { formId }: { formId: string }) => {
      try {
        const existing = await FormSchema.findOne({ formId });
        if (!existing) throw new Error(`Form schema with id "${formId}" not found`);

        await FormSchema.findOneAndUpdate(
          { formId },
          { "meta.status": "archived" }
        );

        return `Form schema "${formId}" has been archived successfully`;
      } catch (error) {
        throw new Error(`Error deleting form schema: ${error}`);
      }
    },
  },
};

export default formSchemaResolver;