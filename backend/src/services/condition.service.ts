import { IField, IConditionRule } from "../models/FormSchema.model";

interface IAnswer {
  fieldId: string;
  value: any;
}

// Evaluates a single condition rule against the current answers
const evaluateRule = (rule: IConditionRule, answerMap: Record<string, any>): boolean => {
  const fieldValue = answerMap[rule.fieldId];

  switch (rule.operator) {
    case "equals":
      return fieldValue === rule.value;

    case "notEquals":
      return fieldValue !== rule.value;

    case "greaterThan":
      return Number(fieldValue) > Number(rule.value);

    case "lessThan":
      return Number(fieldValue) < Number(rule.value);

    case "contains":
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(rule.value);
      }
      if (typeof fieldValue === "string") {
        return fieldValue.includes(rule.value ?? "");
      }
      return false;

    case "isEmpty":
      return (
        fieldValue === undefined ||
        fieldValue === null ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    case "isNotEmpty":
      return (
        fieldValue !== undefined &&
        fieldValue !== null &&
        fieldValue !== "" &&
        !(Array.isArray(fieldValue) && fieldValue.length === 0)
      );

    default:
      return false;
  }
};

// Evaluates all conditions for a field and returns if it should be visible
const isFieldVisible = (field: IField, answerMap: Record<string, any>): boolean => {
  // No conditions — respect the default visibility
  if (!field.conditions || field.conditions.length === 0) {
    return field.visibility === "visible";
  }

  for (const condition of field.conditions) {
    const { action, logic, rules } = condition;

    // Evaluate all rules based on AND / OR logic
    const ruleResults = rules.map((rule) => evaluateRule(rule, answerMap));

    const conditionMet =
      logic === "AND"
        ? ruleResults.every(Boolean)
        : ruleResults.some(Boolean);

    if (conditionMet) {
      return action === "show";
    }
  }

  // No condition matched — fall back to default visibility
  return field.visibility === "visible";
};

// Strips answers for fields that are conditionally hidden
export const stripHiddenFields = (
  fields: IField[],
  answers: IAnswer[]
): IAnswer[] => {
  // Build answer lookup map
  const answerMap: Record<string, any> = {};
  answers.forEach((a) => {
    answerMap[a.fieldId] = a.value;
  });

  // Find all visible field IDs
  const visibleFieldIds = fields
    .filter((field) => isFieldVisible(field, answerMap))
    .map((field) => field.fieldId);

  // Return only answers for visible fields
  return answers.filter((answer) => visibleFieldIds.includes(answer.fieldId));
};

export default isFieldVisible;