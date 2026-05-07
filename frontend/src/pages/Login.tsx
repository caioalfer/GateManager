import { useState } from 'react';
import { api } from '../api';
import { useToast } from '../components/ToastContext';
import CustomSelect from '../components/CustomSelect';

export default function Login({ onLogin }: { onLogin: (user: string, dock: string) => void }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dock, setDock] = useState('Doca 2');
  const [loading, setLoading] = useState(false);

  const docks = [
    { value: 'Doca 4', label: 'Doca 4' },
    { value: 'Doca 2', label: 'Doca 2' },
    { value: 'Doca 6', label: 'Doca 6' },
    { value: 'Doca 7', label: 'Doca 7' },
    { value: 'Doca Especial', label: 'Doca Especial' },
  ];

  const handleSubmit = async () => {
    if (!username || !password) return showToast("Preencha usuário e senha.", "error");
    setLoading(true);
    try {
      if (tab === 'login') {
        const res = await api.login({ username, password });
        if (res.success) {
          showToast(`Bem-vindo, ${username}!`, "success");
          onLogin(username, dock);
        }
      } else {
        const res = await api.register({ username, password });
        if (res.success) {
          showToast("Perfil criado com sucesso! Faça login.", "success");
          setTab('login');
        }
      }
    } catch (e: any) {
      showToast(e.message || "Erro de conexão.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-split-container">
        <div className="login-left">
          <div className="login-form-wrapper">
            <div className="login-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <img src="/logo.svg" alt="GateManager Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            </div>
            
            <h1 className="login-welcome-title">{tab === 'login' ? 'GateManager' : 'Criar Conta'}</h1>
            <p className="login-welcome-subtitle">{tab === 'login' ? 'Acesse o painel de logística' : 'Cadastre-se no GateManager'}</p>

            <div className="form-group">
              <label>Usuário</label>
              <input 
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Seu nome ou cargo" 
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="••••••••" 
              />
            </div>

            {tab === 'login' && (
              <CustomSelect 
                label="Doca de Operação" 
                value={dock} 
                onChange={setDock} 
                options={docks} 
              />
            )}

            <button onClick={handleSubmit} className="btn-primary mt-4" disabled={loading}>
              {loading ? 'Processando...' : tab === 'login' ? 'Entrar no Sistema' : 'Cadastrar agora'}
            </button>

            <p className="login-switch-text">
              {tab === 'login' ? (
                <>Não tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('register'); }}>Pedir um acesso</a></>
              ) : (
                <>Já tem conta? <a href="#" onClick={(e) => { e.preventDefault(); setTab('login'); }}>Voltar ao login</a></>
              )}
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-features-list">
            <div className="feature-item">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>
              <div className="feature-text">
                <h4>Acesso Seguro</h4>
                <p>Controle total de quem entra e sai das suas docas.</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
              <div className="feature-text">
                <h4>Histórico em Tempo Real</h4>
                <p>Monitore todas as operações de carga e descarga.</p>
              </div>
            </div>
            <div className="feature-item border-none">
              <div className="feature-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg></div>
              <div className="feature-text">
                <h4>Gestão de Frotas</h4>
                <p>Cadastre motoboys e transportadoras parceiras.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
