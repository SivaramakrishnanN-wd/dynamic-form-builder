
import mongoose, { Schema, Document } from "mongoose";

export interface IValidation {
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

export interface IConditionRule {
  fieldId: string;
  operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "contains" | "isEmpty" | "isNotEmpty";
  value?: any;
}

export interface ICondition {
  conditionId: string;
  action: "show" | "hide";
  logic: "AND" | "OR";
  rules: IConditionRule[];
}

export interface IOption {
  label: string;
  value: string;
}

export interface IField {
  fieldId: string;
  type: "text" | "textarea" | "email" | "number" | "password" | "date" | "time" | "select" | "radio" | "checkbox_group" | "toggle" | "file" | "section_header" | "hidden";
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  order: number;
  visibility: "visible" | "hidden";
  options?: IOption[];
  validation?: IValidation;
  conditions?: ICondition[];
}

export interface IStep {
  stepId: string;
  title: string;
  description?: string;
  order: number;
  fields: string[];
}

export interface IFormSchema extends Document {
  formId: string;
  meta: {
    title: string;
    description?: string;
    version: number;
    status: "active" | "inactive" | "archived";
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    tags?: string[];
  };
  settings: {
    isMultiStep: boolean;
    allowSaveDraft: boolean;
    submitButtonLabel: string;
    successMessage: string;
    redirectUrl?: string;
  };
  steps?: IStep[];
  fields: IField[];
}

const ValidationSchema = new Schema<IValidation>({
  required: Boolean,
  minLength: Number,
  maxLength: Number,
  min: Number,
  max: Number,
  pattern: String,
  minSelect: Number,
  maxSelect: Number,
  customMessage: String,
}, { _id: false });

const ConditionRuleSchema = new Schema<IConditionRule>({
  fieldId: { type: String, required: true },
  operator: { type: String, required: true },
  value: Schema.Types.Mixed,
}, { _id: false });

const ConditionSchema = new Schema<ICondition>({
  conditionId: { type: String, required: true },
  action: { type: String, enum: ["show", "hide"], required: true },
  logic: { type: String, enum: ["AND", "OR"], required: true },
  rules: [ConditionRuleSchema],
}, { _id: false });

const OptionSchema = new Schema<IOption>({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const FieldSchema = new Schema<IField>({
  fieldId: { type: String, required: true },
  type: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: String,
  helpText: String,
  defaultValue: Schema.Types.Mixed,
  order: { type: Number, required: true },
  visibility: { type: String, enum: ["visible", "hidden"], default: "visible" },
  options: [OptionSchema],
  validation: ValidationSchema,
  conditions: [ConditionSchema],
}, { _id: false });

const StepSchema = new Schema<IStep>({
  stepId: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  fields: [String],
}, { _id: false });

const FormSchemaModel = new Schema<IFormSchema>(
  {
    formId: { type: String, required: true, unique: true },
    meta: {
      title: { type: String, required: true },
      description: String,
      version: { type: Number, default: 1 },
      status: { type: String, enum: ["active", "inactive", "archived"], default: "active" },
      createdBy: { type: String, required: true },
      tags: [String],
    },
    settings: {
      isMultiStep: { type: Boolean, default: false },
      allowSaveDraft: { type: Boolean, default: false },
      submitButtonLabel: { type: String, default: "Submit" },
      successMessage: { type: String, default: "Form submitted successfully!" },
      redirectUrl: String,
    },
    steps: [StepSchema],
    fields: [FieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model<IFormSchema>("FormSchema", FormSchemaModel);