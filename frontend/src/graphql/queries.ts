import { gql } from '@apollo/client';

export const LIST_FORM_SCHEMAS = gql`
  query ListFormSchemas {
    listFormSchemas {
      id
      formId
      meta {
        title
        description
        version
        status
        createdBy
        tags
      }
      settings {
        isMultiStep
        submitButtonLabel
      }
      fields {
        fieldId
        type
        label
        order
        visibility
      }
    }
  }
`;

export const GET_FORM_SCHEMA = gql`
  query GetFormSchema($formId: String!) {
    getFormSchema(formId: $formId) {
      id
      formId
      meta {
        title
        description
        version
        status
        createdBy
        tags
      }
      settings {
        isMultiStep
        allowSaveDraft
        submitButtonLabel
        successMessage
        redirectUrl
      }
      steps {
        stepId
        title
        description
        order
        fields
      }
      fields {
        fieldId
        type
        label
        placeholder
        helpText
        defaultValue
        order
        visibility
        options {
          label
          value
        }
        validation {
          required
          minLength
          maxLength
          min
          max
          pattern
          minSelect
          maxSelect
          customMessage
        }
        conditions {
          conditionId
          action
          logic
          rules {
            fieldId
            operator
            value
          }
        }
      }
    }
  }
`;

export const GET_FORM_RESPONSES = gql`
  query GetFormResponses($formId: String!) {
    getFormResponses(formId: $formId) {
      id
      formId
      formVersion
      submittedBy
      submittedAt
      status
      answers {
        fieldId
        value
      }
    }
  }
`;
