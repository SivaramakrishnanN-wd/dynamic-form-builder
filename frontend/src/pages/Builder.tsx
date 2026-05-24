import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORM_SCHEMA, LIST_FORM_SCHEMAS } from '../graphql/queries';
import { UPDATE_FORM_SCHEMA, CREATE_FORM_SCHEMA, DELETE_FORM_SCHEMA } from '../graphql/mutations';
import ConfirmationModal from '../components/ConfirmationModal';
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
  { type: 'time', color: '#0ea5e9' },
  { type: 'file', color: '#f43f5e' },
  { type: 'section_header', color: '#9ca3af' },
  { type: 'hidden', color: '#64748b' },
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

  const [deleteSchema, { loading: deletingSchema, error: deleteSchemaError }] = useMutation(DELETE_FORM_SCHEMA, {
    refetchQueries: [{ query: LIST_FORM_SCHEMAS }],
    awaitRefetchQueries: true,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const createDefaultOptions = (type: FieldType) => {
    if (type === 'select' || type === 'radio') {
      return [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
      ];
    }
    if (type === 'checkbox_group') {
      return [
        { label: 'Option 1', value: 'option_1' },
        { label: 'Option 2', value: 'option_2' },
      ];
    }
    return undefined;
  };

  const handleAddField = (type: FieldType) => {
    const newField: Field = {
      fieldId: `field_${Math.floor(Math.random() * 10000)}`,
      type,
      label: `New ${type.replace('_', ' ')}`,
      placeholder: `Enter ${type}...`,
      order: (currentSchema?.fields.length || 0) + 1,
      visibility: 'visible',
      options: createDefaultOptions(type),
    };
    dispatch(addField(newField));
  };

  const handleUpdateFieldOptions = (fieldId: string, updater: (options: any[]) => any[]) => {
    const field = currentSchema?.fields.find((f) => f.fieldId === fieldId);
    if (!field) return;
    const nextOptions = updater(field.options ?? []);
    dispatch(updateField({ fieldId, updates: { options: nextOptions } }));
  };

  const handleOptionChange = (fieldId: string, index: number, key: 'label' | 'value', nextValue: string) => {
    handleUpdateFieldOptions(fieldId, (options) =>
      options.map((option, idx) => idx === index ? { ...option, [key]: nextValue } : option)
    );
  };

  const handleAddOption = (fieldId: string) => {
    handleUpdateFieldOptions(fieldId, (options) => [
      ...options,
      { label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` },
    ]);
  };

  const handleRemoveOption = (fieldId: string, index: number) => {
    handleUpdateFieldOptions(fieldId, (options) => options.filter((_, idx) => idx !== index));
  };

  const handleDeleteSchema = async () => {
    if (!formId) return;

    try {
      await deleteSchema({ variables: { formId } });
      dispatch(setCurrentSchema(null));
      navigate('/');
    } catch (err: any) {
      alert(`Error deleting schema: ${err.message}`);
    } finally {
      setConfirmDelete(false);
    }
  };

  const openDeleteConfirmation = () => setConfirmDelete(true);
  const closeDeleteConfirmation = () => setConfirmDelete(false);

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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {formId && (
            <>
              <button className="btn-outline" onClick={() => navigate(`/renderer/${formId}`)}>Preview Form</button>
              <button
                className="btn-outline"
                style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                disabled={deletingSchema}
                onClick={openDeleteConfirmation}
              >
                Delete Form
              </button>
            </>
          )}
          <button className="btn-solid" onClick={handleSave}>Save Schema</button>
        </div>
        {deleteSchemaError && (
          <div style={{ marginTop: '12px', color: 'var(--red)', fontSize: '12px' }}>
            Delete failed: {deleteSchemaError.message}
          </div>
        )}

        <ConfirmationModal
          open={confirmDelete}
          title="Delete form schema"
          message="Delete this form schema? This action will archive the schema and remove it from the dashboard list."
          confirmText="Delete"
          cancelText="Cancel"
          loading={deletingSchema}
          onConfirm={handleDeleteSchema}
          onCancel={closeDeleteConfirmation}
        />
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

                {['select', 'radio', 'checkbox_group'].includes(selectedField.type) && (
                  <div className="prop-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                    <span className="prop-label">Options</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {(selectedField.options ?? []).map((option, index) => (
                        <div key={`${option.value}-${index}`} className="option-row">
                          <input
                            className="prop-input"
                            value={option.label}
                            placeholder={`Label ${index + 1}`}
                            onChange={(e) => handleOptionChange(selectedField.fieldId, index, 'label', e.target.value)}
                          />
                          <input
                            className="prop-input"
                            value={option.value}
                            placeholder={`Value ${index + 1}`}
                            onChange={(e) => handleOptionChange(selectedField.fieldId, index, 'value', e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn-outline btn-small"
                            onClick={() => handleRemoveOption(selectedField.fieldId, index)}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {(selectedField.options ?? []).length === 0 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No options configured yet.</div>
                      )}
                      <button
                        type="button"
                        className="btn-solid"
                        style={{ width: 'fit-content', fontSize: '12px' }}
                        onClick={() => handleAddOption(selectedField.fieldId)}
                      >
                        Add option
                      </button>
                    </div>
                  </div>
                )}

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
