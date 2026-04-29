import FormResponse from "../../models/FormResponse.model";
import FormSchema from "../../models/FormSchema.model";
import { validateFormResponse } from "../../services/validation.service";
import { stripHiddenFields } from "../../services/condition.service";

const formResponseResolver = {
  Query: {
    // Fetch all responses for a form
    getFormResponses: async (_: any, { formId }: { formId: string }) => {
      try {
        const responses = await FormResponse.find({ formId });
        if (!responses) throw new Error(`No responses found for form "${formId}"`);
        return responses;
      } catch (error) {
        throw new Error(`Error fetching form responses: ${error}`);
      }
    },

    // Fetch single response by ID
    getResponseById: async (_: any, { responseId }: { responseId: string }) => {
      try {
        const response = await FormResponse.findById(responseId);
        if (!response) throw new Error(`Response with id "${responseId}" not found`);
        return response;
      } catch (error) {
        throw new Error(`Error fetching response: ${error}`);
      }
    },
  },

  Mutation: {
    // Main form submission flow
    submitFormResponse: async (_: any, { input }: { input: any }) => {
      try {
        const { formId, submittedBy, answers } = input;

        // Step 1 — Fetch the form schema
        const schema = await FormSchema.findOne({
          formId,
          "meta.status": "active",
        });

        if (!schema) {
          return {
            success: false,
            message: `Form schema "${formId}" not found or inactive`,
            responseId: null,
            errors: [],
          };
        }

        // Step 2 — Strip answers for hidden fields
        const cleanedAnswers = stripHiddenFields(schema.fields, answers);

        // Step 3 — Validate answers against schema rules
        const validationErrors = validateFormResponse(schema.fields, cleanedAnswers);

        if (validationErrors.length > 0) {
          return {
            success: false,
            message: "Validation failed. Please fix the errors and resubmit.",
            responseId: null,
            errors: validationErrors,
          };
        }

        // Step 4 — Save the response
        const response = new FormResponse({
          formId,
          formVersion: schema.meta.version,
          submittedBy,
          submittedAt: new Date(),
          status: "submitted",
          answers: cleanedAnswers,
        });

        await response.save();

        return {
          success: true,
          message: schema.settings.successMessage,
          responseId: response._id.toString(),
          errors: [],
        };
      } catch (error) {
        throw new Error(`Error submitting form response: ${error}`);
      }
    },

    // Delete a response by ID
    deleteFormResponse: async (_: any, { responseId }: { responseId: string }) => {
      try {
        const response = await FormResponse.findById(responseId);
        if (!response) throw new Error(`Response "${responseId}" not found`);

        await FormResponse.findByIdAndDelete(responseId);
        return `Response "${responseId}" deleted successfully`;
      } catch (error) {
        throw new Error(`Error deleting response: ${error}`);
      }
    },
  },
};

export default formResponseResolver;