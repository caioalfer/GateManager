import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar',
  type = 'info'
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.5' }}>
        {message}
      </p>
      <div className="flex-between" style={{ gap: '1rem' }}>
        <button 
          onClick={onClose} 
          className="btn-secondary" 
          style={{ width: '100%', padding: '0.8rem' }}
        >
          {cancelText}
        </button>
        <button 
          onClick={() => {
            onConfirm();
            onClose();
          }} 
          className={type === 'danger' ? 'btn-primary' : 'btn-success'}
          style={{ 
            width: '100%', 
            padding: '0.8rem', 
            background: type === 'danger' ? '#ef4444' : 'var(--accent-green)' 
          }}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
