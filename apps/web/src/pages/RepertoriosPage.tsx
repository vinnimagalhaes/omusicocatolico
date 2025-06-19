import React, { useState, useEffect } from 'react';

const RepertoriosPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [repertorios, _setRepertorios] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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
                <div className="nav-link nav-dropdown-toggle active">
                  <i className="fas fa-list nav-icon"></i>
                  Repertórios
                  <i className="fas fa-chevron-down nav-dropdown-icon"></i>
                </div>
                <div className="nav-dropdown-menu">
                  <a href="/repertorios" data-nav="repertorios" className="nav-dropdown-item active">
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
                <a href="/categorias" data-nav="categorias" className="nav-link">
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
                <button className="nav-mobile-dropdown-toggle active">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-list nav-icon"></i>
                    Repertórios
                  </div>
                  <i className="fas fa-chevron-down nav-mobile-dropdown-icon"></i>
                </button>
                <div className="nav-mobile-dropdown-menu">
                  <a href="/repertorios" data-nav="repertorios" className="nav-mobile-dropdown-item active">
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
                <a href="/categorias" data-nav="categorias" className="nav-mobile-link">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Repertórios</h1>
          <p className="text-gray-600">Organize suas cifras em repertórios personalizados</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Novo Repertório
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
          <div id="loading" className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">Carregando repertórios...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && repertorios.length === 0 && (
          <div id="emptyState" className="text-center py-12">
            <i className="fas fa-music text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum repertório encontrado</h3>
            <p className="text-gray-600 mb-6">Crie seu primeiro repertório para organizar suas cifras!</p>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Primeiro Repertório
            </button>
          </div>
        )}

        {/* Repertórios Grid */}
        <div id="repertoriosGrid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards de repertórios serão inseridos aqui */}
        </div>
      </main>

      {/* Modal Novo/Editar Repertório */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Novo Repertório</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Repertório
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Missa de Domingo"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o repertório..."
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar Repertório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepertoriosPage; 