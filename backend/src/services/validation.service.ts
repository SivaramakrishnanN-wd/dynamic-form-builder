import { IField } from "../models/FormSchema.model";

export interface FieldError {
  fieldId: string;
  message: string;
}

export function validateFormResponse(
  fields: IField[],
  answers: { fieldId: string; value: any }[]
): FieldError[] {
  const errors: FieldError[] = [];
  const answerMap = new Map(answers.map((a) => [a.fieldId, a.value]));

  for (const field of fields) {
    if (field.visibility === "hidden") continue;

    const value = answerMap.get(field.fieldId);
    const v = field.validation;
    if (!v) continue;

    // ── Required ──────────────────────────────────────────
    if (v.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        errors.push({
          fieldId: field.fieldId,
          message: v.customMessage ?? `${field.label} is required`,
        });
        continue; // skip further checks if empty
      }
    }

    if (value === undefined || value === null || value === "") continue;

    // ── Per-type validation ────────────────────────────────
    switch (field.type) {
      case "text":
      case "textarea":
      case "password": {
        const str = String(value);
        if (v.minLength !== undefined && str.length < v.minLength) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ??
              `${field.label} must be at least ${v.minLength} characters`,
          });
        }
        if (v.maxLength !== undefined && str.length > v.maxLength) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ??
              `${field.label} must be at most ${v.maxLength} characters`,
          });
        }
        if (v.pattern) {
          const regex = new RegExp(v.pattern);
          if (!regex.test(str)) {
            errors.push({
              fieldId: field.fieldId,
              message: v.customMessage ?? `${field.label} format is invalid`,
            });
          }
        }
        break;
      }

      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ??
              `${field.label} must be a valid email address`,
          });
        }
        break;
      }

      case "number": {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            fieldId: field.fieldId,
            message: v.customMessage ?? `${field.label} must be a valid number`,
          });
          break;
        }
        if (v.min !== undefined && num < v.min) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ?? `${field.label} must be at least ${v.min}`,
          });
        }
        if (v.max !== undefined && num > v.max) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ?? `${field.label} must be at most ${v.max}`,
          });
        }
        break;
      }

      case "checkbox_group": {
        const selected: string[] = Array.isArray(value) ? value : [];
        if (v.minSelect !== undefined && selected.length < v.minSelect) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ??
              `${field.label}: select at least ${v.minSelect} option(s)`,
          });
        }
        if (v.maxSelect !== undefined && selected.length > v.maxSelect) {
          errors.push({
            fieldId: field.fieldId,
            message:
              v.customMessage ??
              `${field.label}: select at most ${v.maxSelect} option(s)`,
          });
        }
        break;
      }

      default:
        break;
    }
  }

  return errors;
}
