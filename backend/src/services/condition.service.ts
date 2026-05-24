import { IField, ICondition, IConditionRule } from "../models/FormSchema.model";

type Answer = { fieldId: string; value: any };

function normalizeAnswerForField(field: IField, value: any): any {
  if (field.type === "checkbox_group") {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore invalid JSON and leave string form
      }
    }
    return [];
  }

  if (field.type === "toggle") {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value === "true";
  }

  return value;
}

// ── Single rule evaluator ───────────────────────────────────────────────────
function evaluateRule(
  rule: IConditionRule,
  answers: Map<string, any>
): boolean {
  const fieldValue = answers.get(rule.fieldId);
  const ruleValue = rule.value;

  switch (rule.operator) {
    case "equals":
      return String(fieldValue) === String(ruleValue);

    case "notEquals":
      return String(fieldValue) !== String(ruleValue);

    case "greaterThan":
      return Number(fieldValue) > Number(ruleValue);

    case "lessThan":
      return Number(fieldValue) < Number(ruleValue);

    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(ruleValue);
      }
      return String(fieldValue).includes(String(ruleValue));

    case "isEmpty":
      return (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "isNotEmpty":
      return !(
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    default:
      return false;
  }
}

// ── Condition evaluator (AND / OR logic) ───────────────────────────────────
function evaluateCondition(
  condition: ICondition,
  answers: Map<string, any>
): boolean {
  const results = condition.rules.map((rule) => evaluateRule(rule, answers));
  return condition.logic === "AND"
    ? results.every(Boolean)
    : results.some(Boolean);
}

// ── Determine if a field should be visible ─────────────────────────────────
function isFieldVisible(field: IField, answers: Map<string, any>): boolean {
  if (!field.conditions || field.conditions.length === 0) {
    return field.visibility === "visible";
  }

  for (const condition of field.conditions) {
    const met = evaluateCondition(condition, answers);
    if (condition.action === "show" && met) return true;
    if (condition.action === "hide" && met) return false;
  }

  // No condition changed visibility — fall back to base setting
  return field.visibility === "visible";
}

// ── Strip answers that belong to hidden fields ──────────────────────────────
export function stripHiddenFields(
  fields: IField[],
  answers: Answer[]
): Answer[] {
  const fieldMap = new Map(fields.map((field) => [field.fieldId, field]));
  const answerMap = new Map(
    answers.map((a) => {
      const field = fieldMap.get(a.fieldId);
      return [a.fieldId, field ? normalizeAnswerForField(field, a.value) : a.value];
    })
  );

  const visibilityMap = new Map<string, boolean>();
  for (const field of fields) {
    visibilityMap.set(field.fieldId, isFieldVisible(field, answerMap));
  }

  return answers.filter(
    (answer) => visibilityMap.get(answer.fieldId) !== false
  );
}
