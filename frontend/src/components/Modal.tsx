import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 10000, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease'
    }}>
      <div className="card shadow-card" style={{ width: '90%', maxWidth: '500px', position: 'relative' }}>
        <div className="flex-between mb-4">
          <h3 style={{ fontSize: '1.4rem', fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 300 }}>&times;</button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
