import React from 'react';
import Modal from './Modal';
import Button from '../Button';
import './ui.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ICONS: Record<string, string> = {
  danger: '🗑',
  warning: '⚠',
  info: 'ℹ',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal
    open={open}
    onClose={onCancel}
    size="sm"
    closeOnBackdrop={!loading}
    title=""
    footer={
      <>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </>
    }
  >
    <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
      <div className={`confirm-icon confirm-icon-${tone}`}>{ICONS[tone]}</div>
      <h4 className="confirm-title">{title}</h4>
      <p className="confirm-message">{message}</p>
    </div>
  </Modal>
);

export default ConfirmDialog;
