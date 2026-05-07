import { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContext';

export default function Lojas() {
  const { showToast } = useToast();
  const [stores, setStores] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [storeName, setStoreName] = useState('');
  const [storeCode, setStoreCode] = useState('');
  const [storeRazao, setStoreRazao] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeDocks, setStoreDocks] = useState('');

  const fetchStores = async () => {
    try {
      const data = await api.getStores();
      setStores(data);
    } catch (e: any) {
      showToast("Erro ao buscar lojas: " + e.message, "error");
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.code && s.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.razao_social && s.razao_social.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSave = async () => {
    if (!storeName) return showToast("O nome da loja é obrigatório.", "error");
    const storeData = {
      name: storeName,
      code: storeCode,
      razao_social: storeRazao,
      location: storeLocation,
      docks: storeDocks
    };

    try {
      if (currentStore) {
        await api.updateStore(currentStore.id, storeData);
        showToast("Loja atualizada com sucesso!", "success");
      } else {
        await api.createStore(storeData);
        showToast("Loja criada com sucesso!", "success");
      }
      setIsModalOpen(false);
      fetchStores();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const openModal = (store: any = null) => {
    setCurrentStore(store);
    setStoreName(store ? store.name : '');
    setStoreCode(store ? (store.code || '') : '');
    setStoreRazao(store ? (store.razao_social || '') : '');
    setStoreLocation(store ? (store.location || '') : '');
    setStoreDocks(store ? (store.docks || '') : '');
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!currentStore) return;
    try {
      await api.deleteStore(currentStore.id);
      showToast("Loja excluída!", "success");
      fetchStores();
    } catch (e: any) {
      showToast(e.message, "error");
    }
  };

  const openDeleteConfirm = (store: any) => {
    setCurrentStore(store);
    setIsConfirmOpen(true);
  };

  return (
    <section className="tab-section active">
      <div className="section-header flex-between align-center">
        <div>
          <h3>Gestão de Lojas</h3>
          <p>Administre as lojas de destino/origem. Passe o mouse sobre o nome para ver detalhes.</p>
        </div>
        <button onClick={() => openModal()} className="btn-success" style={{ width: 'auto', padding: '0.6rem 1.2rem' }}>+ Nova Loja</button>
      </div>

      <div className="search-bar-container mt-4 mb-4">
         <div className="glass-input flex align-center px-3" style={{ maxWidth: '400px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Pesquisar loja por nome, código ou razão..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '0.9rem' }}
            />
         </div>
      </div>

      <div className="card shadow-card p-0 mt-4">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nome da Loja</th>
                <th>Localização / Docas</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div className="tooltip-container">
                      {s.name}
                      <div className="tooltip-box">
                        <div className="tooltip-row">
                          <span className="tooltip-label">Código (LUC)</span>
                          <span className="tooltip-value">{s.code || '---'}</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">Razão Social</span>
                          <span className="tooltip-value">{s.razao_social || '---'}</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">Localização</span>
                          <span className="tooltip-value">{s.location || '---'}</span>
                        </div>
                        <div className="tooltip-row">
                          <span className="tooltip-label">Docas</span>
                          <span className="tooltip-value">{s.docks || '---'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {s.location || '---'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 600 }}>
                      {s.docks || ''}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <button onClick={() => openModal(s)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => openDeleteConfirm(s)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Excluir</button>
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
        title="Excluir Loja"
        message={`Tem certeza que deseja excluir a loja "${currentStore?.name}"?`}
        type="danger"
      />

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentStore ? "Editar Loja" : "Nova Loja"}
      >
        <div className="form-grid">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label>Nome Fantasia (Principal)</label>
            <input 
              type="text" 
              className="modern-select" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              placeholder="Ex: FESTVAL"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Código (LUC)</label>
            <input 
              type="text" 
              className="modern-select" 
              value={storeCode} 
              onChange={e => setStoreCode(e.target.value)} 
              placeholder="Ex: 101"
            />
          </div>
          <div className="form-group">
            <label>Razão Social</label>
            <input 
              type="text" 
              className="modern-select" 
              value={storeRazao} 
              onChange={e => setStoreRazao(e.target.value)} 
              placeholder="Ex: CIA.BEAL DE ALIMENTOS"
            />
          </div>
          <div className="form-group">
            <label>Localização</label>
            <input 
              type="text" 
              className="modern-select" 
              value={storeLocation} 
              onChange={e => setStoreLocation(e.target.value)} 
              placeholder="Ex: L1 - PRINCIPAL SUL"
            />
          </div>
          <div className="form-group">
            <label>Docas de Entregas</label>
            <input 
              type="text" 
              className="modern-select" 
              value={storeDocks} 
              onChange={e => setStoreDocks(e.target.value)} 
              placeholder="Ex: DOCA 01"
            />
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary mt-4">Salvar Alterações</button>
      </Modal>
    </section>
  );
}
