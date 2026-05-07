import { useState, useEffect } from 'react';
import './index.css';
import { api } from './api';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Historico from './pages/Historico';
import Motoristas from './pages/Motoristas';
import Registro from './pages/Registro';
import Lojas from './pages/Lojas';
import Usuarios from './pages/Usuarios';
import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('currentUser'));
  const [currentDock, setCurrentDock] = useState<string | null>(localStorage.getItem('currentDock'));
  const [activeTab, setActiveTab] = useState('registro');
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser && currentDock) {
      localStorage.setItem('currentUser', currentUser);
      localStorage.setItem('currentDock', currentDock);
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentDock');
    }
  }, [currentUser, currentDock]);

  const confirmLogout = () => {
    setCurrentUser(null);
    setCurrentDock(null);
    setIsLogoutModalOpen(false);
  };

  if (!currentUser || !currentDock) {
    return <Login onLogin={(user, dock) => {
      setCurrentUser(user);
      setCurrentDock(dock);
    }} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar / Navigation */}
      <aside className="sidebar">
        <div className="logo" style={{ marginBottom: '2rem' }}>
          <img src="/logo.svg" alt="GateManager Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>
        <nav className="nav-links">
          <a href="#registro" className={activeTab === 'registro' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('registro'); }} title="Novo Registro">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </a>
          <a href="#historico" className={activeTab === 'historico' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('historico'); }} title="Histórico">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          </a>
          <a href="#motoristas" className={activeTab === 'motoristas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('motoristas'); }} title="Prestadores">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          </a>
          <a href="#lojas" className={activeTab === 'lojas' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('lojas'); }} title="Lojas">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </a>
          {currentUser === 'Operador' && (
            <a href="#usuarios" className={activeTab === 'usuarios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('usuarios'); }} title="Usuários">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </a>
          )}
          <a href="#dashboard" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }} title="Dashboard">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <h2>Gestão de Docas</h2>
          <div className="user-profile">
            <div style={{ textAlign: 'right' }}>
              <span className="user-name">{currentUser}</span><br />
              <span className="badge-modern" style={{ fontSize: '0.7rem', marginTop: 0 }}>{currentDock}</span>
            </div>
            <div className="avatar-small" onClick={() => setIsLogoutModalOpen(true)} style={{ cursor: 'pointer' }} title="Sair">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
          </div>
        </header>

        <div className="content-wrapper">
          {activeTab === 'registro' && <Registro currentUser={currentUser} currentDock={currentDock} />}
          {activeTab === 'historico' && <Historico currentUser={currentUser} />}
          {activeTab === 'motoristas' && <Motoristas />}
          {activeTab === 'lojas' && <Lojas />}
          {activeTab === 'usuarios' && currentUser === 'Operador' && <Usuarios />}
          {activeTab === 'dashboard' && <Dashboard currentUser={currentUser} />}
        </div>
      </main>

      <ConfirmModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        title="Encerrar Sessão"
        message="Deseja realmente sair do sistema?"
        type="danger"
      />
    </div>
  );
}
