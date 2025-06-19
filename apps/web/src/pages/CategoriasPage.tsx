import React, { useState, useEffect } from 'react';

const CategoriasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [_categorias, _setCategorias] = useState([]);
  const [filtros, setFiltros] = useState({
    parteMissa: '',
    tempoLiturgico: ''
  });

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div className="bg-gray-50">
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
                <a href="/minhas-cifras" data-nav="minhas-cifras" className="nav-link">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-item">
                <a href="/categorias" data-nav="categorias" className="nav-link active">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>
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
                <a href="/minhas-cifras" data-nav="minhas-cifras" className="nav-mobile-link">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/categorias" data-nav="categorias" className="nav-mobile-link active">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/inicio" data-nav="inicio" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                <i className="fas fa-home mr-2"></i>
                Início
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <i className="fas fa-chevron-right text-gray-400 mr-2"></i>
                <span className="text-sm font-medium text-gray-500">Categorias</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cifras por Categoria</h1>
          <p className="text-gray-600">Encontre cifras organizadas por momentos da missa e tempo litúrgico</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <i className="fas fa-filter text-blue-600 mr-2"></i>
            Filtros
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parte da Missa */}
            <div>
              <label htmlFor="parteMissa" className="block text-sm font-medium text-gray-700 mb-2">
                Parte da Missa
              </label>
              <select 
                id="parteMissa" 
                value={filtros.parteMissa}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas as partes</option>
                <option value="entrada">Entrada</option>
                <option value="ato-penitencial">Ato Penitencial</option>
                <option value="gloria">Glória</option>
                <option value="salmo">Salmo Responsorial</option>
                <option value="aleluia">Aleluia/Aclamação</option>
                <option value="ofertorio">Ofertório</option>
                <option value="santo">Santo</option>
                <option value="comunhao">Comunhão</option>
                <option value="final">Final</option>
              </select>
            </div>

            {/* Tempo Litúrgico */}
            <div>
              <label htmlFor="tempoLiturgico" className="block text-sm font-medium text-gray-700 mb-2">
                Tempo Litúrgico
              </label>
              <select 
                id="tempoLiturgico"
                value={filtros.tempoLiturgico}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os tempos</option>
                <option value="advento">Advento</option>
                <option value="natal">Natal</option>
                <option value="quaresma">Quaresma</option>
                <option value="pascoa">Páscoa</option>
                <option value="comum">Tempo Comum</option>
                <option value="solenidades">Solenidades</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">Carregando categorias...</p>
          </div>
        )}

        {/* Categorias Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de categorias serão inseridos aqui */}
          {!loading && (
            <>
              {/* Exemplo de categoria card */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-door-open text-blue-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Entrada</h3>
                    <p className="text-sm text-gray-500">24 cifras</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">Cifras para o momento de entrada da celebração</p>
                <button className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                  Ver Cifras
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-gift text-amber-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Ofertório</h3>
                    <p className="text-sm text-gray-500">18 cifras</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">Cifras para o momento do ofertório</p>
                <button className="w-full bg-amber-50 text-amber-600 py-2 rounded-lg hover:bg-amber-100 transition-colors">
                  Ver Cifras
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-bread-slice text-green-600 text-xl"></i>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Comunhão</h3>
                    <p className="text-sm text-gray-500">32 cifras</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">Cifras para o momento da comunhão</p>
                <button className="w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors">
                  Ver Cifras
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriasPage; 