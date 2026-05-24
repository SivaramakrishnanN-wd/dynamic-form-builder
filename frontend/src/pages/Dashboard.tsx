import { FC, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { LIST_FORM_SCHEMAS } from '../graphql/queries';
import { DELETE_FORM_SCHEMA } from '../graphql/mutations';
import ConfirmationModal from '../components/ConfirmationModal';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: FC = () => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<{ formId: string; title: string } | null>(null);
  const { loading, error, data } = useQuery(LIST_FORM_SCHEMAS);
  const [deleteFormSchema, { loading: deleting, error: deleteError }] = useMutation(DELETE_FORM_SCHEMA, {
    refetchQueries: [{ query: LIST_FORM_SCHEMAS }],
    awaitRefetchQueries: true,
  });

  if (loading) return <div className="page"><div className="page-header"><div className="page-title">Loading...</div></div></div>;
  if (error) return <div className="page"><div className="page-header"><div className="page-title text-red">Error loading forms</div><div className="page-sub">{error.message}</div></div></div>;

  const schemas = data?.listFormSchemas || [];

  const handleDeleteConfirmation = (formId: string, title: string) => {
    setConfirmDelete({ formId, title });
  };

  const handleDeleteForm = async () => {
    if (!confirmDelete) return;

    try {
      await deleteFormSchema({ variables: { formId: confirmDelete.formId } });
    } catch (err) {
      console.error('Delete form schema failed', err);
    } finally {
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => setConfirmDelete(null);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-sub">Monitor your form schemas and submission pipeline</div>
      </div>

      <div className="card">
        <div className="card-header card-header-responsive">
          <span className="card-title">Form Schemas</span>
          <div className="card-actions">
            {deleteError && <span className="error-message">Delete failed: {deleteError.message}</span>}
            <button className="btn-solid" onClick={() => navigate('/builder')}>+ New Schema</button>
          </div>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Form Name</th><th>Status</th><th>Fields</th><th>Version</th><th>Responses</th><th>Updated</th><th></th>
              </tr>
            </thead>
            <tbody>
              {schemas.map((form: any) => (
                <tr key={form.id} onClick={() => navigate(`/builder/${form.formId}`)}>
                  <td data-label="Form Name">
                    <div className="td-main">{form.meta.title}</div>
                    <div className="td-sub">{form.formId}</div>
                  </td>
                  <td data-label="Status"><span className={`badge ${form.meta.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{form.meta.status}</span></td>
                  <td data-label="Fields" style={{ color: 'var(--text-dim)' }}>{form.fields.length}</td>
                  <td data-label="Version"><span className="version-chip">v{form.meta.version}</span></td>
                  <td data-label="Responses" style={{ color: 'var(--text-dim)' }}>142</td>
                  <td data-label="Updated" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(parseInt(form.updatedAt || form.createdAt)).toLocaleDateString()}</td>
                  <td data-label="Actions">
                    <div className="action-group">
                      <button className="action-btn btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/builder/${form.formId}`); }}>Edit</button>
                      <button className="action-btn btn-primary" onClick={(e) => { e.stopPropagation(); navigate(`/renderer/${form.formId}`); }}>Preview</button>
                      <button
                        className="action-btn btn-outline danger-btn"
                        disabled={deleting}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfirmation(form.formId, form.meta.title);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {schemas.length === 0 && (
          <div className="empty">
            <div className="empty-icon">⊞</div>
            <div className="empty-text">No schemas found. Create your first one!</div>
          </div>
        )}
      </div>

      <ConfirmationModal
        open={Boolean(confirmDelete)}
        title="Delete form schema"
        message={
          confirmDelete
            ? `Are you sure you want to archive "${confirmDelete.title}"? This will remove it from the dashboard list.`
            : ''
        }
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={handleDeleteForm}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default Dashboard;
