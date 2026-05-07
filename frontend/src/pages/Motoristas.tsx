import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import { useToast } from '../components/ToastContext';

export default function Motoristas() {
  const { showToast } = useToast();
  const [couriers, setCouriers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentCourier, setCurrentCourier] = useState<any>(null);
  
  // Form state
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [placa, setPlaca] = useState('');
  const [company, setCompany] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCouriers = async () => {
    try {
      const data = await api.getCouriers();
      setCouriers(data);
    } catch (e: any) {
      showToast("Erro ao buscar: " + e.message, "error");
    }
  };

  useEffect(() => {
    fetchCouriers();
    return () => stopCamera();
  }, []);

  const filteredCouriers = couriers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.license_plate && c.license_plate.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCpfChange = (e: any) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    else if (value.length > 6) value = value.replace(/^(\d{3})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    else if (value.length > 3) value = value.replace(/^(\d{3})(\d{1,3}).*/, '$1.$2');
    setCpf(value);
  };

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      setStream(s);
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = s;
      }, 100);
    } catch (err) {
      showToast("Erro ao acessar câmera.", "error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const tirarFoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const b64 = canvas.toDataURL('image/jpeg', 0.8);
      setPhotoBase64(b64);
      stopCamera();
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
          
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPhotoBase64(resizedBase64);
          stopCamera();
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nome) return showToast("Nome é obrigatório.", "error");
    setLoading(true);
    try {
      await api.updateCourier(currentCourier.id, { 
        name: nome, cpf, license_plate: placa, company, photo_url: photoBase64 
      });
      showToast("Cadastro atualizado!", "success");
      setIsModalOpen(false);
      stopCamera();
      fetchCouriers();
    } catch (e: any) {
      showToast(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentCourier) return;
    try {
      await api.deleteCourier(currentCourier.id);
      showToast("Deletado com sucesso.", "success");
      fetchCouriers();
    } catch (e: any) {
      showToast("Erro ao deletar: " + e.message, "error");
    }
  };

  const openDeleteConfirm = (courier: any) => {
    setCurrentCourier(courier);
    setIsConfirmOpen(true);
  };

  const openModal = (courier: any) => {
    setCurrentCourier(courier);
    setNome(courier.name);
    setCpf(courier.cpf);
    setPlaca(courier.license_plate);
    setCompany(courier.company);
    setPhotoBase64(courier.photo_url || '');
    setIsModalOpen(true);
  };

  const DefaultAvatar = () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifySelf: 'center', background: '#f3f4f6', color: '#9ca3af' }}>
      <svg width="60%" height="60%" style={{ margin: 'auto' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
    </div>
  );

  return (
    <section className="tab-section active">
      <div className="section-header">
        <div className="flex-between align-center">
          <div>
            <h3>Gestão de Prestadores</h3>
            <p>Visualize e edite os dados dos prestadores e entregadores cadastrados.</p>
          </div>
        </div>
      </div>

      <div className="search-bar-container mt-4 mb-4">
         <div className="glass-input flex align-center px-3" style={{ maxWidth: '400px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem', opacity: 0.5 }}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Pesquisar por nome, CPF, placa ou empresa..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--primary-dark)', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '0.9rem' }}
            />
         </div>
      </div>

      <div className="card shadow-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nome</th>
                <th>CPF</th>
                <th>Placa / ID</th>
                <th>Empresa / Vínculo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCouriers.map(c => (
                <tr key={c.id}>
                  <td>
                    {c.photo_url ? (
                      <img 
                        src={c.photo_url} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                        alt="Avatar" 
                      />
                    ) : (
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      </div>
                    )}
                  </td>
                  <td className="list-item-title">{c.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.cpf}</td>
                  <td><span className="badge-modern">{c.license_plate || '---'}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{c.company || 'Autônomo / Outros'}</td>
                  <td>
                    <button onClick={() => openModal(c)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem' }}>Editar</button>
                    <button onClick={() => openDeleteConfirm(c)} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Deletar</button>
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
        title="Excluir Cadastro"
        message={`Tem certeza que deseja deletar o cadastro de "${currentCourier?.name}"? Esta ação não pode ser desfeita.`}
        type="danger"
        confirmText="Sim, Deletar"
      />

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); stopCamera(); }} title="Editar Cadastro">
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: '0 0 120px' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: 'var(--radius-md)', background: '#f3f4f6', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
              ) : photoBase64 ? (
                <img src={photoBase64} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
              ) : (
                <DefaultAvatar />
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileChange} 
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
              <button 
                onClick={isCameraActive ? tirarFoto : startCamera} 
                className="btn-secondary" 
                style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
              >
                {isCameraActive ? 'Capturar' : 'Usar Câmera'}
              </button>
              
              {!isCameraActive && (
                <button 
                  onClick={() => fileInputRef.current?.click()} 
                  className="btn-secondary" 
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
                >
                  Enviar Arquivo
                </button>
              )}

              {isCameraActive && (
                <button 
                  onClick={stopCamera} 
                  className="btn-secondary" 
                  style={{ width: '100%', fontSize: '0.75rem', padding: '0.5rem', color: '#ef4444' }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <div className="form-group">
              <label>Nome Completo</label>
              <input 
                type="text" 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="modern-select" 
              />
            </div>
            <div className="form-group mt-2">
              <label>CPF</label>
              <input 
                type="text" 
                value={cpf} 
                onChange={handleCpfChange} 
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="modern-select" 
              />
            </div>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Placa</label>
            <input 
              type="text" 
              value={placa} 
              onChange={e => setPlaca(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="modern-select" 
            />
          </div>
          <div className="form-group">
            <label>Transportadora</label>
            <input 
              type="text" 
              value={company} 
              onChange={e => setCompany(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="modern-select" 
            />
          </div>
        </div>
        
        <button onClick={handleSave} className="btn-success mt-4" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      </Modal>
    </section>
  );
}
