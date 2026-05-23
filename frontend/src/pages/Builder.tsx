import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORM_SCHEMA, LIST_FORM_SCHEMAS } from '../graphql/queries';
import { UPDATE_FORM_SCHEMA, CREATE_FORM_SCHEMA } from '../graphql/mutations';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setCurrentSchema, 
  setSelectedFieldId, 
  addField, 
  updateField, 
  deleteField,
  updateSchemaMeta 
} from '../store/slices/formSlice';
import { Field, FieldType } from '../types/form.types';
import './Builder.css';

const FIELD_TYPES: { type: FieldType; color: string }[] = [
  { type: 'text', color: '#3b82f6' },
  { type: 'email', color: '#8b5cf6' },
  { type: 'textarea', color: '#ec4899' },
  { type: 'number', color: '#10b981' },
  { type: 'select', color: '#f59e0b' },
  { type: 'radio', color: '#f97316' },
  { type: 'checkbox_group', color: '#06b6d4' },
  { type: 'toggle', color: '#84cc16' },
  { type: 'date', color: '#a78bfa' },
  { type: 'password', color: '#64748b' },
];

const Builder: FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentSchema, selectedFieldId } = useAppSelector((state) => state.form);

  const { loading, data } = useQuery(GET_FORM_SCHEMA, {
    variables: { formId },
    skip: !formId,
  });

  const [updateSchema] = useMutation(UPDATE_FORM_SCHEMA, {
    refetchQueries: [{ query: LIST_FORM_SCHEMAS }],
  });

  const [createSchema] = useMutation(CREATE_FORM_SCHEMA, {
    refetchQueries: [{ query: LIST_FORM_SCHEMAS }],
  });

  useEffect(() => {
    if (data?.getFormSchema) {
      dispatch(setCurrentSchema(data.getFormSchema));
    } else if (!formId) {
      // Initialize new schema
      dispatch(setCurrentSchema({
        id: '',
        formId: `form_${Math.floor(Math.random() * 1000)}`,
        meta: { title: 'New Form', version: 1, status: 'active', createdBy: 'Admin' },
        settings: { isMultiStep: false, allowSaveDraft: true, submitButtonLabel: 'Submit', successMessage: 'Submitted!' },
        fields: []
      } as any));
    }
  }, [data, formId, dispatch]);

  const handleAddField = (type: FieldType) => {
    const newField: Field = {
      fieldId: `field_${Math.floor(Math.random() * 10000)}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      placeholder: `Enter ${type}...`,
      order: (currentSchema?.fields.length || 0) + 1,
      visibility: 'visible',
    };
    dispatch(addField(newField));
  };

  const handleSave = async () => {
    if (!currentSchema) return;
    
    // Clean data for GraphQL
    const { id, __typename, ...input } = currentSchema as any;
    const cleanMeta = (({ __typename, ...m }) => m)(input.meta);
    const cleanSettings = (({ __typename, ...s }) => s)(input.settings);
    const cleanFields = input.fields.map(({ __typename, ...f }: any) => ({
      ...f,
      validation: f.validation ? (({ __typename, ...v }) => v)(f.validation) : null,
      options: f.options ? f.options.map(({ __typename, ...o }: any) => o) : null,
      conditions: f.conditions ? f.conditions.map(({ __typename, ...c }: any) => ({
        ...c,
        rules: c.rules.map(({ __typename, ...r }: any) => r)
      })) : null
    }));

    try {
      if (formId) {
        await updateSchema({
          variables: { formId, input: { ...input, meta: cleanMeta, settings: cleanSettings, fields: cleanFields } }
        });
        alert('Schema updated successfully!');
      } else {
        await createSchema({
          variables: { input: { ...input, meta: cleanMeta, settings: cleanSettings, fields: cleanFields } }
        });
        alert('Schema created successfully!');
        navigate('/');
      }
    } catch (err: any) {
      alert(`Error saving schema: ${err.message}`);
    }
  };

  const selectedField = currentSchema?.fields.find(f => f.fieldId === selectedFieldId);

  if (loading) return <div className="page"><div className="page-header"><div className="page-title">Loading Builder...</div></div></div>;

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Form Builder</div>
          <div className="page-sub">
            {formId ? (
              <>Editing: <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{formId}</span> — <span style={{ color: 'var(--green)' }}>v{currentSchema?.meta.version}</span></>
            ) : (
              'Create a new form schema'
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {formId && <button className="btn-outline" onClick={() => navigate(`/renderer/${formId}`)}>Preview Form</button>}
          <button className="btn-solid" onClick={handleSave}>Save Schema</button>
        </div>
      </div>

      <div className="builder-layout">
        <div className="builder-panel">
          <div className="panel-head"><div className="panel-label">Field Palette</div></div>
          <div className="panel-body">
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'var(--font-head)' }}>Click to add</div>
            {FIELD_TYPES.map(ft => (
              <div key={ft.type} className="type-chip" onClick={() => handleAddField(ft.type)}>
                <div className="type-dot" style={{ background: ft.color }}></div>
                <div className="type-name">{ft.type.replace('_', ' ')}</div>
                <div className="type-add">+</div>
              </div>
            ))}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div className="panel-label" style={{ marginBottom: '10px' }}>Form Settings</div>
              <div className="prop-row">
                <span className="prop-label">Title</span>
                <input 
                  className="prop-input" 
                  value={currentSchema?.meta.title || ''} 
                  onChange={(e) => dispatch(updateSchemaMeta({ title: e.target.value }))}
                />
              </div>
              <div className="prop-row">
                <span className="prop-label">Status</span>
                <div className="toggle-row">
                  <button 
                    className={`toggle-opt ${currentSchema?.meta.status === 'active' ? 'on' : ''}`}
                    onClick={() => dispatch(updateSchemaMeta({ status: 'active' }))}
                  >Active</button>
                  <button 
                    className={`toggle-opt ${currentSchema?.meta.status === 'inactive' ? 'on' : ''}`}
                    onClick={() => dispatch(updateSchemaMeta({ status: 'inactive' }))}
                  >Inactive</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="builder-panel">
          <div className="panel-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="panel-label">Schema Canvas</div>
          </div>
          <div className="panel-body">
            {currentSchema?.fields.map((field) => (
              <div 
                key={field.fieldId} 
                className={`field-card ${selectedFieldId === field.fieldId ? 'selected' : ''}`}
                onClick={() => dispatch(setSelectedFieldId(field.fieldId))}
              >
                <div className="field-row">
                  <div className="drag-handle">⠿</div>
                  <div style={{ width: '7px', height: '7px', borderRadius: '2px', background: FIELD_TYPES.find(t => t.type === field.type)?.color, flexShrink: 0 }}></div>
                  <div className="field-label">{field.label}</div>
                  {field.validation?.required && <span className="req-tag">REQ</span>}
                  <div className="field-type-tag" style={{ 
                    background: (FIELD_TYPES.find(t => t.type === field.type)?.color || '#fff') + '18', 
                    color: FIELD_TYPES.find(t => t.type === field.type)?.color,
                    border: `1px solid ${FIELD_TYPES.find(t => t.type === field.type)?.color}30`
                  }}>
                    {field.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
            {currentSchema?.fields.length === 0 && (
              <div className="empty">
                <div className="empty-icon">◈</div>
                <div className="empty-text">Click palette items to start building</div>
              </div>
            )}
            <button className="add-field-btn" onClick={() => handleAddField('text')}>+ Add Field</button>
          </div>
        </div>

        <div className="builder-panel">
          <div className="panel-head"><div className="panel-label">Field Properties</div></div>
          <div className="panel-body">
            {selectedField ? (
              <div className="properties-form">
                <div className="prop-row">
                  <span className="prop-label">Field ID</span>
                  <div className="prop-value blue" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{selectedField.fieldId}</div>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Type</span>
                  <div className="prop-value" style={{ color: FIELD_TYPES.find(t => t.type === selectedField.type)?.color }}>{selectedField.type}</div>
                </div>
                <div className="prop-row">
                  <span className="prop-label">Label</span>
                  <input 
                    className="prop-input" 
                    value={selectedField.label} 
                    onChange={(e) => dispatch(updateField({ fieldId: selectedField.fieldId, updates: { label: e.target.value } }))}
                  />
                </div>
                <div className="prop-row">
                  <span className="prop-label">Placeholder</span>
                  <input 
                    className="prop-input" 
                    value={selectedField.placeholder || ''} 
                    onChange={(e) => dispatch(updateField({ fieldId: selectedField.fieldId, updates: { placeholder: e.target.value } }))}
                  />
                </div>
                <div className="prop-row">
                  <span className="prop-label">Required</span>
                  <div className="toggle-row">
                    <button 
                      className={`toggle-opt ${selectedField.validation?.required ? 'on' : ''}`}
                      onClick={() => dispatch(updateField({ fieldId: selectedField.fieldId, updates: { validation: { ...selectedField.validation, required: true } } }))}
                    >Yes</button>
                    <button 
                      className={`toggle-opt ${!selectedField.validation?.required ? 'on' : ''}`}
                      onClick={() => dispatch(updateField({ fieldId: selectedField.fieldId, updates: { validation: { ...selectedField.validation, required: false } } }))}
                    >No</button>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '6px', marginTop: '24px' }}>
                  <button className="btn-outline" style={{ flex: 1, fontSize: '12px' }} onClick={() => dispatch(deleteField(selectedField.fieldId))}>Delete</button>
                  <button className="btn-solid" style={{ flex: 1, fontSize: '12px' }} onClick={() => dispatch(setSelectedFieldId(null))}>Done</button>
                </div>
              </div>
            ) : (
              <div className="empty">
                <div className="empty-icon">◈</div>
                <div className="empty-text">Click a field to edit properties</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;
