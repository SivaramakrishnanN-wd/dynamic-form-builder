import { FC } from 'react';
import { useQuery } from '@apollo/client';
import { LIST_FORM_SCHEMAS } from '../graphql/queries';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard: FC = () => {
  const { loading, error, data } = useQuery(LIST_FORM_SCHEMAS);
  const navigate = useNavigate();

  if (loading) return <div className="page"><div className="page-header"><div className="page-title">Loading...</div></div></div>;
  if (error) return <div className="page"><div className="page-header"><div className="page-title text-red">Error loading forms</div><div className="page-sub">{error.message}</div></div></div>;

  const schemas = data?.listFormSchemas || [];

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">Overview</div>
        <div className="page-sub">Monitor your form schemas and submission pipeline</div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Form Schemas</span>
          <button className="btn-solid" onClick={() => navigate('/builder')}>+ New Schema</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Form Name</th><th>Status</th><th>Fields</th><th>Version</th><th>Responses</th><th>Updated</th><th></th>
            </tr>
          </thead>
          <tbody>
            {schemas.map((form: any) => (
              <tr key={form.id} onClick={() => navigate(`/builder/${form.formId}`)}>
                <td>
                  <div className="td-main">{form.meta.title}</div>
                  <div className="td-sub">{form.formId}</div>
                </td>
                <td><span className={`badge ${form.meta.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>{form.meta.status}</span></td>
                <td style={{ color: 'var(--text-dim)' }}>{form.fields.length}</td>
                <td><span className="version-chip">v{form.meta.version}</span></td>
                <td style={{ color: 'var(--text-dim)' }}>142</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(parseInt(form.updatedAt || form.createdAt)).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="action-btn btn-ghost" onClick={(e) => { e.stopPropagation(); navigate(`/builder/${form.formId}`); }}>Edit</button>
                    <button className="action-btn btn-primary" onClick={(e) => { e.stopPropagation(); navigate(`/renderer/${form.formId}`); }}>Preview</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schemas.length === 0 && (
          <div className="empty">
            <div className="empty-icon">⊞</div>
            <div className="empty-text">No schemas found. Create your first one!</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
