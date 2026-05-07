import { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContext';

export default function Usuarios() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (e: any) {
      showToast("Erro ao buscar usuários: " + e.message, "error");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePassword = async () => {
    if (!newPassword) return showToast("Digite a nova senha.", "error");
    try {
      await api.updateUserPassword(currentUser.id, { password: newPassword });
      showToast("Senha atualizada!", "success");
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;
    try {
      await api.deleteUser(currentUser.id);
      showToast("Usuário removido!", "success");
      fetchUsers();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const openDeleteConfirm = (user: any) => {
    setCurrentUser(user);
    setIsConfirmOpen(true);
  };

  const openPasswordModal = (user: any) => {
    setCurrentUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  return (
    <section className="tab-section active">
      <div className="section-header">
        <h3>Gestão de Usuários</h3>
        <p>Controle de operadores que acessam o sistema.</p>
      </div>

      <div className="card shadow-card p-0 mt-4">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nome de Usuário (Operador)</th>
                <th>Data de Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button 
                      onClick={() => openPasswordModal(u)} 
                      className="btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                    >
                      Alterar Senha
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(u)} 
                      className="btn-secondary" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    >
                      Remover Acesso
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remover Usuário"
        message={`Deseja realmente remover o acesso de "${currentUser?.username}"?`}
        type="danger"
      />

      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title={`Alterar Senha: ${currentUser?.username}`}
      >
        <div className="form-group">
          <label>Nova Senha</label>
          <input 
            type="password" 
            className="modern-select" 
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            placeholder="Digite a nova senha..."
            autoFocus
          />
        </div>
        <button onClick={handleUpdatePassword} className="btn-primary mt-4">Atualizar Senha</button>
      </Modal>
    </section>
  );
}
