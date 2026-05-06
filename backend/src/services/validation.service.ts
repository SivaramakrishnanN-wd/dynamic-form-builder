import { IField } from "../models/FormSchema.model";

interface IAnswer {
  fieldId: string;
  value: any;
}

export interface IFieldError {
  fieldId: string;
  message: string;
}

export const validateFormResponse = (
  fields: IField[],
  answers: IAnswer[]
): IFieldError[] => {
  const errors: IFieldError[] = [];

  // Build a quick lookup map — fieldId → answer value
  const answerMap: Record<string, any> = {};
  answers.forEach((a) => {
    answerMap[a.fieldId] = a.value;
  });

  for (const field of fields) {
    const value = answerMap[field.fieldId];
    const rules = field.validation;

    if (!rules) continue;

    // ── Required check ──────────────────────────────
    if (rules.required) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push({
          fieldId: field.fieldId,
          message: rules.customMessage ?? `${field.label} is required`,
        });
        continue; // skip further checks if value is missing
      }
    }

    // Skip remaining checks if value is empty and not required
    if (value === undefined || value === null || value === "") continue;

    // ── Text length checks ───────────────────────────
    if (typeof value === "string") {
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} must be at least ${rules.minLength} characters`,
        });
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} must not exceed ${rules.maxLength} characters`,
        });
      }

      // ── Pattern / Regex check ──────────────────────
      if (rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          errors.push({
            fieldId: field.fieldId,
            message: rules.customMessage ?? `${field.label} format is invalid`,
          });
        }
      }
    }

    // ── Number range checks ──────────────────────────
    if (field.type === "number" && typeof value === "number") {
      if (rules.min !== undefined && value < rules.min) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} must be at least ${rules.min}`,
        });
      }

      if (rules.max !== undefined && value > rules.max) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} must not exceed ${rules.max}`,
        });
      }
    }

    // ── Checkbox group selection checks ──────────────
    if (field.type === "checkbox_group" && Array.isArray(value)) {
      if (rules.minSelect && value.length < rules.minSelect) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} requires at least ${rules.minSelect} selection(s)`,
        });
      }

      if (rules.maxSelect && value.length > rules.maxSelect) {
        errors.push({
          fieldId: field.fieldId,
          message:
            rules.customMessage ??
            `${field.label} allows at most ${rules.maxSelect} selection(s)`,
        });
      }
    }

    // ── Email format check ───────────────────────────
    if (field.type === "email" && typeof value === "string") {
      const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
      if (!emailRegex.test(value)) {
        errors.push({
          fieldId: field.fieldId,
          message: rules.customMessage ?? `${field.label} must be a valid email address`,
        });
      }
    }
  }

  return errors;
};