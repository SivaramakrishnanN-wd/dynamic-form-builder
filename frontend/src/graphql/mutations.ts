import { gql } from '@apollo/client';

export const CREATE_FORM_SCHEMA = gql`
  mutation CreateFormSchema($input: CreateFormSchemaInput!) {
    createFormSchema(input: $input) {
      id
      formId
      meta {
        title
        description
        version
        status
      }
      fields {
        fieldId
        type
        label
        order
      }
    }
  }
`;

export const UPDATE_FORM_SCHEMA = gql`
  mutation UpdateFormSchema($formId: String!, $input: UpdateFormSchemaInput!) {
    updateFormSchema(formId: $formId, input: $input) {
      id
      formId
      meta {
        title
        version
      }
    }
  }
`;

export const DELETE_FORM_SCHEMA = gql`
  mutation DeleteFormSchema($formId: String!) {
    deleteFormSchema(formId: $formId)
  }
`;

export const SUBMIT_FORM_RESPONSE = gql`
  mutation SubmitFormResponse($input: SubmitFormResponseInput!) {
    submitFormResponse(input: $input) {
      success
      message
      responseId
      errors {
        fieldId
        message
      }
    }
  }
`;
