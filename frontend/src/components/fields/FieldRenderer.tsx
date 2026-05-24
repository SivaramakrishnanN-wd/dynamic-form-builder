import { FC, ChangeEvent } from 'react';
import { Field } from '../../types/form.types';

interface FieldRendererProps {
  field: Field;
  value: any;
  onChange: (value: any) => void;
}

const normalizeValue = (value: any, fallback: any) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }
  return value;
};

const FieldRenderer: FC<FieldRendererProps> = ({ field, value, onChange }) => {
  const currentValue = normalizeValue(value, field.defaultValue ?? (field.type === 'checkbox_group' ? [] : field.type === 'toggle' ? false : ''));

  switch (field.type) {
    case 'section_header':
      return (
        <div style={{ margin: '20px 0 12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)' }}>{field.label}</div>
          {field.helpText && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>{field.helpText}</div>}
        </div>
      );

    case 'hidden':
      return (
        <input
          type="hidden"
          name={field.fieldId}
          value={String(currentValue)}
        />
      );

    case 'textarea':
      return (
        <textarea
          className="finput"
          placeholder={field.placeholder}
          value={String(currentValue)}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'select':
      return (
        <select
          className="finput"
          value={String(currentValue)}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select an option</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options?.map((option) => (
            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <input
                type="radio"
                name={field.fieldId}
                value={option.value}
                checked={currentValue === option.value}
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox_group':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {field.options?.map((option) => {
            const selected = Array.isArray(currentValue) && currentValue.includes(option.value);
            return (
              <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  name={field.fieldId}
                  value={option.value}
                  checked={selected}
                  onChange={(e) => {
                    const next = Array.isArray(currentValue) ? [...currentValue] : [];
                    if (e.target.checked) {
                      if (!next.includes(option.value)) next.push(option.value);
                    } else {
                      const index = next.indexOf(option.value);
                      if (index !== -1) next.splice(index, 1);
                    }
                    onChange(next);
                  }}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      );

    case 'toggle':
      return (
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <span style={{ fontSize: '13px', color: 'var(--text)' }}>{field.label}</span>
          <input
            type="checkbox"
            checked={Boolean(currentValue)}
            onChange={(e) => onChange(e.target.checked)}
          />
        </label>
      );

    case 'file':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            className="finput"
            type="file"
            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.files?.[0] ?? null)}
          />
          {currentValue && typeof currentValue === 'object' && 'name' in currentValue && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(currentValue as File).name}</div>
          )}
        </div>
      );

    case 'password':
    case 'email':
    case 'number':
    case 'date':
    case 'time':
    case 'text':
      return (
        <input
          className="finput"
          type={field.type}
          placeholder={field.placeholder}
          value={field.type === 'number' ? String(currentValue) : String(currentValue ?? '')}
          onChange={(e) => onChange(field.type === 'number' ? e.target.value : e.target.value)}
        />
      );

    default:
      return (
        <input
          className="finput"
          type="text"
          placeholder={field.placeholder}
          value={String(currentValue)}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

export default FieldRenderer;
