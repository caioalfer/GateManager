import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastContext';
import CustomSelect from '../components/CustomSelect';

export default function Registro({ currentUser, currentDock }: { currentUser: string, currentDock: string }) {
  const { showToast } = useToast();
  const [cpf, setCpf] = useState('');
  const [nomeBusca, setNomeBusca] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  
  const [courier, setCourier] = useState<any>(null);
  const [isNewCourier, setIsNewCourier] = useState(false);
  
  // New Courier form
  const [newNome, setNewNome] = useState('');
  const [newPlaca, setNewPlaca] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Stores
  const [stores, setStores] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [showStoreSuggestions, setShowStoreSuggestions] = useState(false);
  const [operationType, setOperationType] = useState('entrega');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const storeRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getStores().then(setStores).catch(console.error);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (storeRef.current && !storeRef.current.contains(event.target as Node)) {
        setShowStoreSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      stopCamera();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCpfChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    else if (value.length > 6) value = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    else if (value.length > 3) value = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    setCpf(value);

    if (value.length === 14) {
      buscarPorCpf(value);
    }
  };

  const buscarPorCpf = async (overrideCpf?: any) => {
    const targetCpf = typeof overrideCpf === 'string' ? overrideCpf : cpf;
    const cpfCru = targetCpf.replace(/\D/g, '');
    if (cpfCru.length !== 11) return showToast("Digite um CPF válido.", "error");

    try {
      const data = await api.getCourierByCpf(cpfCru);
      setCourier(data);
      setIsNewCourier(false);
      stopCamera();
      showToast("Entregador encontrado!", "success");
    } catch (e: any) {
      if (e.message.includes("não encontrado") || e.message.includes("404")) {
        setIsNewCourier(true);
        setCourier(null);
        startCamera();
        showToast("CPF não encontrado. Inicie o cadastro.", "info");
      } else {
        showToast("Erro ao buscar.", "error");
      }
    }
  };

  const handleNameSearch = async (e: any) => {
    const val = e.target.value;
    setNomeBusca(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const data = await api.searchCourierByName(val);
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    }
  };

  const selectSuggestion = (c: any) => {
    setNomeBusca(c.name);
    setCpf(c.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4'));
    setSuggestions([]);
    setCourier(c);
    setIsNewCourier(false);
    showToast("Entregador selecionado!", "success");
  };

  const startCamera = async () => {
    if (stream) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error(err);
      showToast("Permita o uso da câmera.", "error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const tirarFoto = (e: any) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const b64 = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoBase64(b64);
      stopCamera();
      showToast("Foto capturada!", "success");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          setPhotoBase64(canvas.toDataURL('image/jpeg', 0.8));
          stopCamera();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };
  const cancelRegistration = () => {
    setIsNewCourier(false);
    setCpf('');
    setNomeBusca('');
    setNewNome('');
    setNewPlaca('');
    setNewCompany('');
    setPhotoBase64('');
    stopCamera();
  };

  const cadastrarMotoboy = async () => {
    if (!newNome) return showToast("O nome é obrigatório.", "error");
    const cpfCru = cpf.replace(/\D/g, '');
    try {
      const data = await api.createCourier({
        name: newNome, cpf: cpfCru, license_plate: newPlaca, company: newCompany, photo_url: photoBase64
      });
      setIsNewCourier(false);
      setCourier(data);
      showToast("Entregador cadastrado com sucesso!", "success");
    } catch (e: any) {
      showToast("Erro: " + e.message, "error");
    }
  };

  const registrarEntrada = async () => {
    if (!selectedStore) return showToast("Selecione a loja.", "error");
    try {
      await api.createRecord({
        courier_id: courier.id,
        store_name: selectedStore,
        operation_type: operationType,
        operator_name: currentUser,
        dock_number: currentDock
      });
      showToast("✅ Registro realizado com sucesso!", "success");
      setCpf(''); setCourier(null); setSelectedStore('');
    } catch (e: any) {
      showToast("Erro: " + e.message, "error");
    }
  };

  return (
    <section className="tab-section active">
      <div className="section-header">
        <h3>Registro de Acesso</h3>
        <p>Controle de entrada e saída de prestadores e entregas.</p>
      </div>

      <div className="grid-layout">
        <div className="card dark-card">
          <h4 className="card-title-light">Buscar Prestador / Entregador</h4>
          
          <div className="search-area glass-input">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              value={cpf} 
              onChange={handleCpfChange} 
              onKeyDown={(e) => e.key === 'Enter' && buscarPorCpf()}
              placeholder="Digite o CPF..." 
              maxLength={14} 
              autoComplete="off" 
              className="dark-input" 
            />
            <button onClick={buscarPorCpf} className="btn-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
          
          <div className="search-area glass-input mt-2" style={{ position: 'relative' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <input 
              type="text" 
              value={nomeBusca} 
              onChange={handleNameSearch} 
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions.length > 0) {
                  selectSuggestion(suggestions[0]);
                }
              }}
              placeholder="Ou busque por nome completo..." 
              autoComplete="off" 
              className="dark-input" 
            />
            {suggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {suggestions.map(s => (
                  <div key={s.id} className="suggestion-item" onClick={() => selectSuggestion(s)}>
                    <span className="suggestion-name">{s.name}</span>
                    <span className="suggestion-doc">CPF: {s.cpf} | {s.company || 'Autônomo / Outros'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isNewCourier && (
            <div className="action-area mt-4">
              <p style={{ color: '#a1a1aa', marginBottom: '1rem', fontSize: '0.9rem' }}>Pessoa não encontrada. Preencha os dados e tire a foto:</p>
              
              <div className="webcam-container mb-4">
                {!photoBase64 ? (
                  <>
                    <div style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)', background: '#000', overflow: 'hidden', position: 'relative' }}>
                      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                    </div>
                    <div className="webcam-controls mt-2" style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={tirarFoto} className="btn-secondary" style={{ flex: 1 }}>Tirar Foto</button>
                      <button onClick={() => fileInputRef.current?.click()} className="btn-secondary" style={{ flex: 1 }}>Enviar Arquivo</button>
                    </div>
                  </>
                ) : (
                  <>
                    <img src={photoBase64} style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '200px', objectFit: 'cover' }} alt="Preview" />
                    <div className="webcam-controls mt-2">
                      <button onClick={(e) => { e.preventDefault(); setPhotoBase64(''); startCamera(); }} className="btn-secondary" style={{ width: '100%' }}>Refazer Foto</button>
                    </div>
                  </>
                )}
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>

              <div className="form-group">
                <input 
                  type="text" 
                  value={newNome} 
                  onChange={e => setNewNome(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && cadastrarMotoboy()}
                  placeholder="Nome Completo" 
                  className="dark-input border-bottom" 
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  value={newPlaca} 
                  onChange={e => setNewPlaca(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && cadastrarMotoboy()}
                  placeholder="Placa (Ex: ABC-1234)" 
                  className="dark-input border-bottom mt-2" 
                />
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={e => setNewCompany(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && cadastrarMotoboy()}
                  placeholder="Transportadora (Ex: Loggi)" 
                  className="dark-input border-bottom mt-2" 
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }} className="mt-4">
                <button onClick={cadastrarMotoboy} className="btn-success" style={{ flex: 2 }}>Cadastrar e Seguir</button>
                <button onClick={cancelRegistration} className="btn-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        <div className="card shadow-card" style={{ opacity: courier ? 1 : 0.5, pointerEvents: courier ? 'auto' : 'none' }}>
          <h4 className="card-title">Detalhes da Operação</h4>
          
          <div className="courier-profile modern-profile mt-4">
            {courier?.photo_url ? (
              <img src={courier.photo_url} style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" />
            ) : (
              <div className="avatar-large">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            )}
            <div className="profile-info">
              <h3>{courier ? courier.name : 'Aguardando busca...'}</h3>
              <div>
                <span className="badge-modern">{courier?.license_plate || '---'}</span>
                <span className="badge-modern" style={{ marginLeft: '0.5rem', color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', borderColor: 'transparent' }}>
                  {courier?.company || '---'}
                </span>
              </div>
            </div>
          </div>

          <div className="form-grid mt-4">
            <div className="form-group" style={{ position: 'relative' }} ref={storeRef}>
              <label>Loja de Destino/Origem</label>
              <input 
                type="text"
                value={selectedStore}
                onChange={e => setSelectedStore(e.target.value)}
                onFocus={() => setShowStoreSuggestions(true)}
                placeholder="Selecione a loja..."
                className="modern-select"
              />
              {showStoreSuggestions && stores.length > 0 && (
                <div className="suggestions-dropdown light">
                  {stores
                    .filter(s => {
                      const search = selectedStore.toLowerCase();
                      return (s.name?.toLowerCase().includes(search) || 
                              s.code?.toLowerCase().includes(search) || 
                              s.razao_social?.toLowerCase().includes(search));
                    })
                    .slice(0, 50) // Limitar para não travar a UI
                    .map(s => (
                      <div 
                        key={s.id} 
                        className="suggestion-item" 
                        onClick={() => {
                          setSelectedStore(s.name);
                          setShowStoreSuggestions(false);
                        }}
                      >
                        <span className="suggestion-name" style={{ fontWeight: 600 }}>{s.name}</span>
                        <span className="suggestion-doc" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                          {s.code ? `LUC: ${s.code}` : ''} {s.razao_social ? ` | ${s.razao_social}` : ''}
                        </span>
                        {s.location && (
                          <span className="suggestion-doc" style={{ fontSize: '0.75rem', opacity: 0.5, fontStyle: 'italic' }}>
                            {s.location}
                          </span>
                        )}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            <CustomSelect 
              label="Operação"
              value={operationType}
              onChange={setOperationType}
              options={[
                { value: 'entrega', label: '📦 Entrega' },
                { value: 'coleta', label: '🚚 Coleta' },
                { value: 'servico', label: '🛠️ Serviço' }
              ]}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button onClick={registrarEntrada} className="btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Confirmar Acesso 
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: '0.5rem' }}><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button 
              onClick={() => { setCourier(null); setCpf(''); setNomeBusca(''); setSelectedStore(''); }} 
              className="btn-secondary" 
              style={{ flex: 1, border: '1px solid #e5e7eb', color: '#666' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
