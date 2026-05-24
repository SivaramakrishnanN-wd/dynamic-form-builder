import { FC } from 'react';
import './ConfirmationModal.css';

interface ConfirmationModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="confirmation-modal-overlay" role="dialog" aria-modal="true">
      <div className="confirmation-modal-card">
        <div className="confirmation-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="confirmation-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirmation-modal-actions">
          <button className="btn-outline" type="button" onClick={onCancel} disabled={loading}>
            {cancelText}
          </button>
          <button className="btn-solid" type="button" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
