import React, { useState, useEffect } from 'react';

interface User {
  id: number;
  nome: string;
  email: string;
  role?: string;
}

interface NavigationProps {
  currentPage?: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage = '' }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está logado
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
      }
    }
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
  };

  const getUserInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isActive = (page: string) => {
    return currentPage === page ? 'active' : '';
  };

  return (
    <nav className="main-navigation" id="mainNavigation">
      <div className="nav-container">
        {/* Desktop Navigation */}
        <div className="nav-desktop">
          <a href="/" className="nav-brand">OMúsicoCatólico</a>
          
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="/inicio" data-nav="inicio" className={`nav-link ${isActive('inicio')}`}>
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
              <a href="/favoritas" data-nav="favoritas" className={`nav-link ${isActive('favoritas')}`}>
                <i className="fas fa-heart nav-icon"></i>
                Favoritas
              </a>
            </li>
            
            <li className="nav-item">
              <a href="/minhas-cifras" data-nav="minhas-cifras" className={`nav-link ${isActive('minhas-cifras')}`}>
                <i className="fas fa-music nav-icon"></i>
                Minhas Cifras
              </a>
            </li>
            
            <li className="nav-item">
              <a href="/categorias" data-nav="categorias" className={`nav-link ${isActive('categorias')}`}>
                <i className="fas fa-tags nav-icon"></i>
                Categorias
              </a>
            </li>
          </ul>

          {/* User Menu */}
          <div className="nav-user-menu">
            {!user ? (
              <div id="notLoggedIn">
                <a href="/login.html" className="nav-login-btn">
                  <i className="fas fa-sign-in-alt nav-icon"></i>
                  Entrar
                </a>
              </div>
            ) : (
              <div id="loggedIn" className="nav-user-dropdown">
                <button onClick={toggleUserMenu} className="nav-user-btn">
                  <div className="nav-user-avatar" id="userInitials">
                    {getUserInitials(user.nome)}
                  </div>
                  <span id="userName" className="nav-user-name">{user.nome}</span>
                  <i className="fas fa-chevron-down nav-user-icon"></i>
                </button>
                
                {isUserMenuOpen && (
                  <div id="userDropdown" className="nav-user-dropdown-menu">
                    <div className="nav-user-dropdown-header">
                      <span id="userNameDropdown">{user.nome}</span>
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
                    {user.role === 'master' && (
                      <>
                        <hr className="nav-user-divider" />
                        <a href="/master-dashboard.html" className="nav-user-dropdown-item nav-user-dropdown-item-master">
                          <i className="fas fa-crown nav-icon"></i>
                          Painel Master
                        </a>
                      </>
                    )}
                    <hr className="nav-user-divider" />
                    <button onClick={logout} className="nav-user-dropdown-item nav-user-dropdown-item-logout">
                      <i className="fas fa-sign-out-alt nav-icon"></i>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="nav-mobile">
          <a href="/" className="nav-brand">OMúsicoCatólico</a>
          <button className="nav-toggle" onClick={toggleMobileMenu} aria-label="Abrir menu">
            <i className="fas fa-bars nav-toggle-icon"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="nav-mobile-menu">
          <div className="nav-mobile-content">
            <div className="nav-mobile-header">
              <span className="nav-brand">OMúsicoCatólico</span>
              <button className="nav-mobile-close" onClick={toggleMobileMenu} aria-label="Fechar menu">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <ul className="nav-mobile-list">
              <li className="nav-mobile-item">
                <a href="/inicio" data-nav="inicio" className={`nav-mobile-link ${isActive('inicio')}`}>
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
                <a href="/favoritas" data-nav="favoritas" className={`nav-mobile-link ${isActive('favoritas')}`}>
                  <i className="fas fa-heart nav-icon"></i>
                  Favoritas
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/minhas-cifras" data-nav="minhas-cifras" className={`nav-mobile-link ${isActive('minhas-cifras')}`}>
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/categorias" data-nav="categorias" className={`nav-mobile-link ${isActive('categorias')}`}>
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>

            {/* Mobile User Menu */}
            <div className="nav-mobile-user">
              {!user ? (
                <div id="mobileNotLoggedIn">
                  <a href="/login.html" className="nav-mobile-login-btn">
                    <i className="fas fa-sign-in-alt nav-icon"></i>
                    Entrar
                  </a>
                </div>
              ) : (
                <div id="mobileLoggedIn" className="nav-mobile-user-info">
                  <div className="nav-mobile-user-header">
                    <div className="nav-user-avatar" id="mobileUserInitials">
                      {getUserInitials(user.nome)}
                    </div>
                    <span id="mobileUserName">{user.nome}</span>
                  </div>
                  
                  <div className="nav-mobile-user-menu">
                    <a href="/perfil" className="nav-mobile-user-item">
                      <i className="fas fa-user nav-icon"></i>
                      Meu Perfil
                    </a>
                    <a href="/repertorios" className="nav-mobile-user-item">
                      <i className="fas fa-list nav-icon"></i>
                      Meus Repertórios
                    </a>
                    <a href="#" className="nav-mobile-user-item">
                      <i className="fas fa-cog nav-icon"></i>
                      Configurações
                    </a>
                    {user.role === 'master' && (
                      <a href="/master-dashboard.html" className="nav-mobile-user-item nav-mobile-user-item-master">
                        <i className="fas fa-crown nav-icon"></i>
                        Painel Master
                      </a>
                    )}
                    <button onClick={logout} className="nav-mobile-user-item nav-mobile-user-item-logout">
                      <i className="fas fa-sign-out-alt nav-icon"></i>
                      Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 