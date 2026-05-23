import { gql } from "apollo-server-express";

const formSchemaTypeDef = gql`
  type ValidationRule {
    required: Boolean
    minLength: Int
    maxLength: Int
    min: Float
    max: Float
    pattern: String
    minSelect: Int
    maxSelect: Int
    customMessage: String
  }

  type ConditionRule {
    fieldId: String!
    operator: String!
    value: String
  }

  type Condition {
    conditionId: String!
    action: String!
    logic: String!
    rules: [ConditionRule!]!
  }

  type Option {
    label: String!
    value: String!
  }

  type Field {
    fieldId: String!
    type: String!
    label: String!
    placeholder: String
    helpText: String
    defaultValue: String
    order: Int!
    visibility: String!
    options: [Option]
    validation: ValidationRule
    conditions: [Condition]
  }

  type Step {
    stepId: String!
    title: String!
    description: String
    order: Int!
    fields: [String!]!
  }

  type FormMeta {
    title: String!
    description: String
    version: Int!
    status: String!
    createdBy: String!
    tags: [String]
  }

  type FormSettings {
    isMultiStep: Boolean!
    allowSaveDraft: Boolean!
    submitButtonLabel: String!
    successMessage: String!
    redirectUrl: String
  }

  type FormSchema {
    id: ID!
    formId: String!
    meta: FormMeta!
    settings: FormSettings!
    steps: [Step]
    fields: [Field!]!
    createdAt: String
    updatedAt: String
  }

  # ─── Inputs ───────────────────────────────────────────

  input ValidationRuleInput {
    required: Boolean
    minLength: Int
    maxLength: Int
    min: Float
    max: Float
    pattern: String
    minSelect: Int
    maxSelect: Int
    customMessage: String
  }

  input ConditionRuleInput {
    fieldId: String!
    operator: String!
    value: String
  }

  input ConditionInput {
    conditionId: String!
    action: String!
    logic: String!
    rules: [ConditionRuleInput!]!
  }

  input OptionInput {
    label: String!
    value: String!
  }

  input FieldInput {
    fieldId: String!
    type: String!
    label: String!
    placeholder: String
    helpText: String
    defaultValue: String
    order: Int!
    visibility: String!
    options: [OptionInput]
    validation: ValidationRuleInput
    conditions: [ConditionInput]
  }

  input StepInput {
    stepId: String!
    title: String!
    description: String
    order: Int!
    fields: [String!]!
  }

  input FormMetaInput {
    title: String!
    description: String
    version: Int
    status: String
    createdBy: String!
    tags: [String]
  }

  input FormSettingsInput {
    isMultiStep: Boolean
    allowSaveDraft: Boolean
    submitButtonLabel: String
    successMessage: String
    redirectUrl: String
  }

  input CreateFormSchemaInput {
    formId: String!
    meta: FormMetaInput!
    settings: FormSettingsInput!
    steps: [StepInput]
    fields: [FieldInput!]!
  }

  input UpdateFormSchemaInput {
    meta: FormMetaInput
    settings: FormSettingsInput
    steps: [StepInput]
    fields: [FieldInput!]
  }

  # ─── Queries & Mutations ──────────────────────────────

  type Query {
    getFormSchema(formId: String!): FormSchema
    listFormSchemas: [FormSchema!]!
  }

  type Mutation {
    createFormSchema(input: CreateFormSchemaInput!): FormSchema!
    updateFormSchema(formId: String!, input: UpdateFormSchemaInput!): FormSchema!
    deleteFormSchema(formId: String!): String!
  }
`;

export default formSchemaTypeDef;