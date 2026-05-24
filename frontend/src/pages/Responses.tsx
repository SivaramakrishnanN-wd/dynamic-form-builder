import { FC } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_FORM_RESPONSES } from '../graphql/queries';
import './Responses.css';

const Responses: FC = () => {
  const { formId } = useParams<{ formId: string }>();

  const { loading, error, data } = useQuery(GET_FORM_RESPONSES, {
    variables: { formId },
    skip: !formId
  });

  if (loading) return <div className="page"><div className="page-header"><div className="page-title">Loading responses...</div></div></div>;
  if (error) return <div className="page"><div className="page-header"><div className="page-title text-red">Error</div><div className="page-sub">{error.message}</div></div></div>;

  const responses = data?.getFormResponses || [];

  return (
    <div className="page fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="page-title">Responses</div>
          <div className="page-sub">Submissions for <span style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>{formId || 'all forms'}</span></div>
        </div>
        <button className="btn-outline" style={{ fontSize: '12px' }}>↓ Export CSV</button>
      </div>

      <div className="responses-grid">
        <div className="resp-stat">
          <div className="resp-stat-num" style={{ color: 'var(--blue)' }}>{responses.length}</div>
          <div className="resp-stat-lbl">Total Submissions</div>
        </div>
        <div className="resp-stat">
          <div className="resp-stat-num" style={{ color: 'var(--green)' }}>{responses.filter((r: any) => r.status === 'submitted').length}</div>
          <div className="resp-stat-lbl">Completed</div>
        </div>
        <div className="resp-stat">
          <div className="resp-stat-num" style={{ color: 'var(--amber)' }}>{responses.filter((r: any) => r.status === 'draft').length}</div>
          <div className="resp-stat-lbl">Drafts</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header card-header-responsive">
          <span className="card-title">All Responses</span>
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Response ID</th><th>User</th><th>Submitted</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {responses.map((resp: any) => (
                <tr key={resp.id}>
                  <td data-label="Response ID"><span className="version-chip">{resp.id.slice(-6).toUpperCase()}</span></td>
                  <td data-label="User"><div className="td-main">{resp.submittedBy}</div></td>
                  <td data-label="Submitted" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(parseInt(resp.submittedAt)).toLocaleDateString()}</td>
                  <td data-label="Status"><span className={`badge ${resp.status === 'submitted' ? 'badge-active' : 'badge-inactive'}`}>{resp.status}</span></td>
                  <td data-label="Actions"><button className="action-btn btn-ghost">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {responses.length === 0 && (
          <div className="empty">
            <div className="empty-icon">◫</div>
            <div className="empty-text">No responses yet for this form.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Responses;
