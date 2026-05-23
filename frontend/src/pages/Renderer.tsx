import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORM_SCHEMA } from '../graphql/queries';
import { SUBMIT_FORM_RESPONSE } from '../graphql/mutations';
import './Renderer.css';

const Renderer: FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());
  
  const { loading, error, data } = useQuery(GET_FORM_SCHEMA, {
    variables: { formId },
    skip: !formId
  });

  const [submitForm] = useMutation(SUBMIT_FORM_RESPONSE);

  const form = data?.getFormSchema;

  // Simple condition evaluation
  useEffect(() => {
    if (!form) return;
    
    const newVisible = new Set<string>();
    form.fields.forEach((field: any) => {
      if (!field.conditions || field.conditions.length === 0) {
        newVisible.add(field.fieldId);
        return;
      }

      // Check each condition
      const isVisible = field.conditions.some((cond: any) => {
        return cond.rules.every((rule: any) => {
          const val = answers[rule.fieldId];
          switch (rule.operator) {
            case 'equals': return val === rule.value;
            case 'notEquals': return val !== rule.value;
            case 'greaterThan': return parseFloat(val) > parseFloat(rule.value);
            case 'lessThan': return parseFloat(val) < parseFloat(rule.value);
            case 'contains': return val?.includes(rule.value);
            case 'isNotEmpty': return !!val;
            case 'isEmpty': return !val;
            default: return false;
          }
        });
      });

      if (isVisible) newVisible.add(field.fieldId);
    });

    setVisibleFields(newVisible);
  }, [answers, form]);

  const handleSubmit = async () => {
    try {
      const input = {
        formId,
        submittedBy: 'Public User',
        answers: Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value: String(value) }))
      };
      const { data } = await submitForm({ variables: { input } });
      if (data.submitFormResponse.success) {
        alert('Form submitted successfully!');
        navigate('/');
      } else {
        alert('Validation errors: ' + data.submitFormResponse.errors.map((e: any) => e.message).join(', '));
      }
    } catch (err: any) {
      alert('Error submitting: ' + err.message);
    }
  };

  if (loading) return <div className="page"><div className="page-header"><div className="page-title">Loading form...</div></div></div>;
  if (error) return <div className="page"><div className="page-header"><div className="page-title text-red">Error</div><div className="page-sub">{error.message}</div></div></div>;
  if (!form) return <div className="page"><div className="page-header"><div className="page-title">Form not found</div></div></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div className="page-title">Form Preview</div>
        <div className="page-sub">Live rendering of <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{form.formId}</span></div>
      </div>

      <div className="renderer-wrap">
        <div className="form-preview">
          <div className="form-title">{form.meta.title}</div>
          <div className="form-desc">{form.meta.description || 'Complete the form below.'}</div>

          <div className="progress-bar-wrap">
            <div className="progress-bar" style={{ width: `${(Object.keys(answers).length / form.fields.length) * 100}%` }}></div>
          </div>

          <form className="rendered-form">
            {form.fields.map((field: any) => {
              if (!visibleFields.has(field.fieldId)) return null;

              return (
                <div key={field.fieldId} className="form-field">
                  <label className="field-lbl">
                    {field.label} {field.validation?.required && <span className="field-req">*</span>}
                    {field.conditions?.length > 0 && <span style={{ fontSize: '10px', color: 'var(--amber)', marginLeft: '8px' }}>◉ Conditional</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea 
                      className="finput" 
                      placeholder={field.placeholder}
                      value={answers[field.fieldId] || ''}
                      onChange={(e) => setAnswers({ ...answers, [field.fieldId]: e.target.value })}
                    />
                  ) : field.type === 'select' ? (
                    <select 
                      className="finput"
                      value={answers[field.fieldId] || ''}
                      onChange={(e) => setAnswers({ ...answers, [field.fieldId]: e.target.value })}
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt: any) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      className="finput" 
                      type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                      placeholder={field.placeholder}
                      value={answers[field.fieldId] || ''}
                      onChange={(e) => setAnswers({ ...answers, [field.fieldId]: e.target.value })}
                    />
                  )}
                  {field.helpText && <div className="field-help">{field.helpText}</div>}
                </div>
              );
            })}

            <div className="form-footer">
              <button type="button" className="btn-outline" onClick={() => navigate('/')}>Dashboard</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Step 1 of 1</span>
                <button type="button" className="btn-solid" onClick={handleSubmit}>Submit Form</button>
              </div>
            </div>
          </form>
        </div>

        <div className="schema-panel">
          <div className="json-box">
            <div className="json-head">
              <span className="panel-label">Condition Engine</span>
            </div>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>Active conditions evaluated in real-time:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {form.fields.filter((f: any) => f.conditions?.length > 0).map((f: any) => (
                  <div key={f.fieldId} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '7px', padding: '9px 12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px', fontFamily: 'var(--font-mono)' }}>{f.fieldId}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Show if {f.conditions[0].rules[0].fieldId} {f.conditions[0].rules[0].operator} {f.conditions[0].rules[0].value}
                    </div>
                    <div style={{ fontSize: '10px', color: visibleFields.has(f.fieldId) ? 'var(--green)' : 'var(--red)', marginTop: '4px' }}>
                      {visibleFields.has(f.fieldId) ? '✓ TRUE — field is visible' : '✗ FALSE — field is hidden'}
                    </div>
                  </div>
                ))}
                {form.fields.every((f: any) => !f.conditions || f.conditions.length === 0) && (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No conditional fields in this schema.</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="json-box">
            <div className="json-head">
              <span className="panel-label">Live Schema JSON</span>
              <button className="action-btn btn-ghost" style={{ fontSize: '10px' }}>Copy</button>
            </div>
            <div className="json-body">
              <pre>{JSON.stringify(form, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Renderer;
