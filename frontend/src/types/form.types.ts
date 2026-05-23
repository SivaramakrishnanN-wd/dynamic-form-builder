export type FieldType =
  | 'text' | 'textarea' | 'email' | 'number' | 'password'
  | 'date' | 'time' | 'select' | 'radio' | 'checkbox_group'
  | 'toggle' | 'file' | 'section_header' | 'hidden';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  minSelect?: number;
  maxSelect?: number;
  customMessage?: string;
}

export interface Option {
  label: string;
  value: string;
}

export interface ConditionRule {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'isEmpty' | 'isNotEmpty';
  value?: string;
}

export interface Condition {
  conditionId: string;
  action: 'show' | 'hide';
  logic: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface Field {
  fieldId: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string;
  order: number;
  visibility: 'visible' | 'hidden';
  options?: Option[];
  validation?: ValidationRule;
  conditions?: Condition[];
}

export interface Step {
  stepId: string;
  title: string;
  description?: string;
  order: number;
  fields: string[];
}

export interface FormMeta {
  title: string;
  description?: string;
  version: number;
  status: 'active' | 'inactive' | 'archived';
  createdBy: string;
  tags?: string[];
}

export interface FormSettings {
  isMultiStep: boolean;
  allowSaveDraft: boolean;
  submitButtonLabel: string;
  successMessage: string;
  redirectUrl?: string;
}

export interface FormSchema {
  id: string;
  formId: string;
  meta: FormMeta;
  settings: FormSettings;
  steps?: Step[];
  fields: Field[];
  createdAt?: string;
  updatedAt?: string;
}
