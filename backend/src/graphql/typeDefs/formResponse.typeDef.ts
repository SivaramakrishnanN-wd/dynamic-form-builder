import { gql } from "apollo-server-express";

const formResponseTypeDef = gql`
  type Answer {
    fieldId: String!
    value: String
  }

  type FormResponse {
    id: ID!
    formId: String!
    formVersion: Int!
    submittedBy: String!
    submittedAt: String!
    status: String!
    answers: [Answer!]!
    createdAt: String
    updatedAt: String
  }

  type SubmitFormResponseResult {
    success: Boolean!
    message: String!
    responseId: String
    errors: [FieldError]
  }

  type FieldError {
    fieldId: String!
    message: String!
  }

  # ─── Inputs ───────────────────────────────────────────

  input AnswerInput {
    fieldId: String!
    value: String
  }

  input SubmitFormResponseInput {
    formId: String!
    submittedBy: String!
    answers: [AnswerInput!]!
  }

  # ─── Queries & Mutations ──────────────────────────────

  type Query {
    getFormResponses(formId: String!): [FormResponse!]!
    getResponseById(responseId: String!): FormResponse
  }

  type Mutation {
    submitFormResponse(input: SubmitFormResponseInput!): SubmitFormResponseResult!
    deleteFormResponse(responseId: String!): String!
  }
`;

export default formResponseTypeDef;