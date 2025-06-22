import React, { useState, useEffect } from 'react';

// Declarar as funções JavaScript globais para TypeScript
declare global {
  interface Window {
    showAddCifraModal: () => void;
    openCifraEditor: () => void;
    openUrlImportModal: () => void;
    openCifraUploader: () => void;
  }
}

const MinhasCifrasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cifras, _setCifras] = useState([]);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    // Verificar se as funções JavaScript estão disponíveis
    console.log('🔍 [REACT] Verificando funções JavaScript...');
    console.log('🔍 [REACT] showAddCifraModal:', typeof window.showAddCifraModal);
    console.log('🔍 [REACT] openCifraEditor:', typeof window.openCifraEditor);
    console.log('🔍 [REACT] openUrlImportModal:', typeof window.openUrlImportModal);
    console.log('🔍 [REACT] openCifraUploader:', typeof window.openCifraUploader);
    
    // Tentar carregar as funções se não estiverem disponíveis
    if (!window.showAddCifraModal) {
      console.warn('⚠️ [REACT] Funções JavaScript não carregadas, tentando novamente em 2s...');
      setTimeout(() => {
        console.log('🔄 [REACT] Verificando novamente...');
        console.log('🔍 [REACT] showAddCifraModal:', typeof window.showAddCifraModal);
      }, 2000);
    }
  }, []);

  // Handlers para chamar as funções JavaScript
  const handleNovaCifra = () => {
    console.log('🎵 [REACT] Botão Nova Cifra clicado!');
    console.log('🔍 [REACT] showAddCifraModal disponível:', typeof window.showAddCifraModal);
    
    if (window.showAddCifraModal) {
      console.log('✅ [REACT] Chamando showAddCifraModal...');
      window.showAddCifraModal();
    } else {
      console.error('❌ [REACT] showAddCifraModal não está disponível');
      // Fallback: tentar chamar diretamente se estiver no objeto global
      if (typeof (window as any).showAddCifraModal === 'function') {
        console.log('🔄 [REACT] Tentando fallback...');
        (window as any).showAddCifraModal();
      } else {
        alert('Erro: Função showAddCifraModal não carregada. Recarregue a página.');
      }
    }
  };

  const handleCriarPrimeiraCifra = () => {
    console.log('🎵 [REACT] Botão Criar Primeira Cifra clicado!');
    handleNovaCifra(); // Reutilizar a mesma lógica
  };

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navegação Principal Unificada */}
      <nav className="main-navigation" id="mainNavigation">
        <div className="nav-container">
          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <a href="/" className="nav-brand">OMúsicoCatólico</a>
            
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="/inicio" data-nav="inicio" className="nav-link">
                  <i className="fas fa-home nav-icon"></i>
                  Início
                </a>
              </li>
              
              <li className="nav-item nav-dropdown">
                <div className="nav-link nav-dropdown-toggle" data-nav="repertorios">
                  <i className="fas fa-list nav-icon"></i>
                  Repertórios
                  <i className="fas fa-chevron-down nav-dropdown-icon"></i>
                </div>
                <div className="nav-dropdown-menu">
                  <a href="/repertorios" data-nav="repertorios" className="nav-dropdown-item">
                    <i className="fas fa-user nav-icon" style={{color: 'var(--color-primary-600)'}}></i>
                    Meus Repertórios
                  </a>
                  <a href="/repertorios-comunidade" data-nav="repertorios-comunidade" className="nav-dropdown-item">
                    <i className="fas fa-users nav-icon" style={{color: 'var(--color-secondary-600)'}}></i>
                    Repertórios da Comunidade
                  </a>
                </div>
              </li>
              
              <li className="nav-item">
                <a href="/favoritas" data-nav="favoritas" className="nav-link">
                  <i className="fas fa-heart nav-icon"></i>
                  Favoritas
                </a>
              </li>
              
              <li className="nav-item">
                <a href="/minhas-cifras" data-nav="minhas-cifras" className="nav-link active">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-item">
                <a href="/categorias" data-nav="categorias" className="nav-link">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>

            {/* User Menu */}
            <div className="nav-user-menu">
              {/* Not Logged In */}
              <div id="notLoggedIn" className="hidden">
                <a href="login.html" className="nav-login-btn">
                  <i className="fas fa-sign-in-alt nav-icon"></i>
                  Entrar
                </a>
              </div>

              {/* Logged In */}
              <div id="loggedIn" className="nav-user-dropdown">
                <button className="nav-user-btn">
                  <div className="nav-user-avatar" id="userInitials">U</div>
                  <span id="userName" className="nav-user-name">Usuário</span>
                  <i className="fas fa-chevron-down nav-user-icon"></i>
                </button>
                
                <div id="userDropdown" className="nav-user-dropdown-menu">
                  <div className="nav-user-dropdown-header">
                    <span id="userNameDropdown">Usuário</span>
                  </div>
                  <a href="/perfil" className="nav-user-dropdown-item">
                    <i className="fas fa-user nav-icon"></i>
                    Meu Perfil
                  </a>
                  <a href="/repertorios" className="nav-user-dropdown-item">
                    <i className="fas fa-list nav-icon"></i>
                    Meus Repertórios
                  </a>
                  <a href="#" className="nav-user-dropdown-item">
                    <i className="fas fa-cog nav-icon"></i>
                    Configurações
                  </a>
                  <div id="masterLink" className="hidden">
                    <hr className="nav-user-divider" />
                    <a href="master-dashboard.html" className="nav-user-dropdown-item nav-user-dropdown-item-master">
                      <i className="fas fa-crown nav-icon"></i>
                      Painel Master
                    </a>
                  </div>
                  <hr className="nav-user-divider" />
                  <button className="nav-user-dropdown-item nav-user-dropdown-item-logout">
                    <i className="fas fa-sign-out-alt nav-icon"></i>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="nav-mobile">
            <a href="/" className="nav-brand">OMúsicoCatólico</a>
            <button className="nav-toggle" aria-label="Abrir menu">
              <i className="fas fa-bars nav-toggle-icon"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="nav-mobile-menu">
          <div className="nav-mobile-content">
            <div className="nav-mobile-header">
              <span className="nav-brand">OMúsicoCatólico</span>
              <button className="nav-mobile-close" aria-label="Fechar menu">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <ul className="nav-mobile-list">
              <li className="nav-mobile-item">
                <a href="/inicio" data-nav="inicio" className="nav-mobile-link">
                  <i className="fas fa-home nav-icon"></i>
                  Início
                </a>
              </li>
              
              <li className="nav-mobile-dropdown">
                <button className="nav-mobile-dropdown-toggle">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-list nav-icon"></i>
                    Repertórios
                  </div>
                  <i className="fas fa-chevron-down nav-mobile-dropdown-icon"></i>
                </button>
                <div className="nav-mobile-dropdown-menu">
                  <a href="/repertorios" data-nav="repertorios" className="nav-mobile-dropdown-item">
                    <i className="fas fa-user nav-icon" style={{color: 'var(--color-primary-600)'}}></i>
                    Meus Repertórios
                  </a>
                  <a href="/repertorios-comunidade" data-nav="repertorios-comunidade" className="nav-mobile-dropdown-item">
                    <i className="fas fa-users nav-icon" style={{color: 'var(--color-secondary-600)'}}></i>
                    Repertórios da Comunidade
                  </a>
                </div>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/favoritas" data-nav="favoritas" className="nav-mobile-link">
                  <i className="fas fa-heart nav-icon"></i>
                  Favoritas
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/minhas-cifras" data-nav="minhas-cifras" className="nav-mobile-link active">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/categorias" data-nav="categorias" className="nav-mobile-link">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Cifras</h1>
          <p className="text-gray-600">Gerencie suas cifras criadas</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={handleNovaCifra}>
            <i className="fas fa-plus mr-2"></i>
            Nova Cifra
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
            <i className="fas fa-filter mr-2"></i>
            Filtros
          </button>
          <button className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors">
            <i className="fas fa-sort mr-2"></i>
            Ordenar
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">Carregando suas cifras...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && cifras.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-music text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhuma cifra encontrada</h3>
            <p className="text-gray-600 mb-6">Crie sua primeira cifra para começar!</p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors" onClick={handleCriarPrimeiraCifra}>
              <i className="fas fa-plus mr-2"></i>
              Criar Primeira Cifra
            </button>
          </div>
        )}

        {/* Cifras Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de cifras serão inseridos aqui */}
        </div>
      </main>
    </div>
  );
};

export default MinhasCifrasPage; 