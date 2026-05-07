import { useState, useEffect } from 'react';
import { api } from '../api';

export default function Historico({ currentUser }: { currentUser: string | null }) {
  const [records, setRecords] = useState<any[]>([]);
  const [searchStore, setSearchStore] = useState('');
  const [searchPrestador, setSearchPrestador] = useState('');
  const [searchDate, setSearchDate] = useState('');

  const fetchRecords = async () => {
    try {
      const data = await api.getRecords(currentUser || undefined);
      setRecords(data);
    } catch (e: any) {
      console.error(e.message);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [currentUser]);

  const filteredRecords = records.filter(rec => {
    const matchStore = rec.store_name.toLowerCase().includes(searchStore.toLowerCase());
    const matchPrestador = rec.courier_name.toLowerCase().includes(searchPrestador.toLowerCase()) || 
                          rec.cpf.includes(searchPrestador);
    const matchDate = searchDate ? rec.entry_time.startsWith(searchDate) : true;
    
    return matchStore && matchPrestador && matchDate;
  });

  return (
    <section className="tab-section active">
      <div className="section-header flex-between align-center">
        <div>
          <h3>Histórico de Movimentação</h3>
          <p>Consulte todos os registros de acesso realizados.</p>
        </div>
        <button onClick={fetchRecords} className="btn-secondary">Atualizar</button>
      </div>

      {/* Filter Bar */}
      <div className="card shadow-card mt-4 mb-4" style={{ padding: '1.8rem' }}>
        <div className="filters-grid">
           <div className="filter-item">
              <label className="filter-label">Loja de Destino</label>
              <div className="glass-input flex align-center px-3 mt-1">
                <input 
                  type="text" 
                  placeholder="Pesquisar loja..." 
                  value={searchStore}
                  onChange={e => setSearchStore(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
           </div>
           <div className="filter-item">
              <label className="filter-label">Prestador / CPF</label>
              <div className="glass-input flex align-center px-3 mt-1">
                <input 
                  type="text" 
                  placeholder="Nome ou documento..." 
                  value={searchPrestador}
                  onChange={e => setSearchPrestador(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
           </div>
           <div className="filter-item">
              <label className="filter-label">Data da Operação</label>
              <div className="glass-input flex align-center px-3 mt-1 date-filter-wrapper">
                <input 
                  type="date" 
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  className="custom-date-input"
                  style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '0.9rem' }}
                />
              </div>
           </div>
           {(searchStore || searchPrestador || searchDate) && (
             <div className="filter-actions">
               <button 
                 onClick={() => { setSearchStore(''); setSearchPrestador(''); setSearchDate(''); }}
                 className="btn-secondary clear-filters-btn"
               >
                 Limpar Filtros
               </button>
             </div>
           )}
        </div>
      </div>

      <div className="card shadow-card p-0 mt-4">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Prestador / Entregador</th>
                <th>Loja / Doca</th>
                <th>Operação</th>
                <th>Operador / Hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map(rec => {
                  let badgeClass = 'status-pill status-entrega';
                  let emojiOp = '📦 Entrega';
                  
                  if (rec.operation_type === 'coleta') {
                    badgeClass = 'status-pill status-coleta';
                    emojiOp = '🚚 Coleta';
                  } else if (rec.operation_type === 'servico') {
                    badgeClass = 'status-pill status-servico';
                    emojiOp = '🛠️ Serviço';
                  }
                  
                  return (
                    <tr key={rec.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <div className="operator-avatar" style={{ width: '32px', height: '32px', fontSize: '0.8rem', background: '#e5e7eb', color: '#4b5563' }}>
                            {rec.courier_name[0]}
                          </div>
                          <div>
                            <strong style={{ color: 'var(--primary-dark)', fontWeight: 600, display: 'block' }}>{rec.courier_name}</strong>
                            <small style={{ color: 'var(--text-muted)' }}>{rec.cpf}</small>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span>{rec.store_name}</span>
                          <span style={{ color: 'var(--accent-green)', fontSize: '0.75rem', fontWeight: 600 }}>{rec.dock_number || '-'}</span>
                        </div>
                      </td>
                      <td><span className={badgeClass}>{emojiOp}</span></td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ color: 'var(--primary-dark)', fontWeight: 600, fontSize: '0.9rem' }}>{rec.operator_name || '-'}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {new Date(rec.entry_time).toLocaleDateString('pt-BR')} • {new Date(rec.entry_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Nenhum registro encontrado para os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
