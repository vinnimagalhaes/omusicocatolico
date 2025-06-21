import React, { useState, useEffect } from 'react';

interface Repertorio {
  id: number;
  nome: string;
  descricao: string;
  publico: boolean;
  cifras: number;
  criadoEm: string;
  atualizadoEm: string;
}

interface NovoRepertorio {
  nome: string;
  descricao: string;
  publico: boolean;
}

const RepertoriosPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [repertorios, setRepertorios] = useState<Repertorio[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRepertorio, setEditingRepertorio] = useState<Repertorio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NovoRepertorio>({
    nome: '',
    descricao: '',
    publico: false
  });

  useEffect(() => {
    loadRepertorios();
  }, []);

  const loadRepertorios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const response = await fetch('/api/repertorios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar repertórios');
      }

      const data = await response.json();
      setRepertorios(data);
    } catch (err) {
      console.error('Erro ao carregar repertórios:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const url = editingRepertorio 
        ? `/api/repertorios/${editingRepertorio.id}`
        : '/api/repertorios';
      
      const method = editingRepertorio ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar repertório');
      }

      // Recarregar lista
      await loadRepertorios();
      
      // Fechar modal e limpar form
      setShowModal(false);
      setEditingRepertorio(null);
      setFormData({ nome: '', descricao: '', publico: false });
      
    } catch (err) {
      console.error('Erro ao salvar repertório:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  const handleEdit = (repertorio: Repertorio) => {
    setEditingRepertorio(repertorio);
    setFormData({
      nome: repertorio.nome,
      descricao: repertorio.descricao,
      publico: repertorio.publico
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este repertório?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/repertorios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir repertório');
      }

      await loadRepertorios();
    } catch (err) {
      console.error('Erro ao excluir repertório:', err);
      setError(err instanceof Error ? err.message : 'Erro ao excluir');
    }
  };

  const openNewModal = () => {
    setEditingRepertorio(null);
    setFormData({ nome: '', descricao: '', publico: false });
    setShowModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
            onClick={openNewModal}
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
              <span className="text-red-700">{error}</span>
              <button 
                onClick={loadRepertorios}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <i className="fas fa-redo mr-1"></i>
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
            <p className="mt-4 text-gray-600">Carregando repertórios...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && repertorios.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-music text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum repertório encontrado</h3>
            <p className="text-gray-600 mb-6">Crie seu primeiro repertório para organizar suas cifras!</p>
            <button 
              onClick={openNewModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Criar Primeiro Repertório
            </button>
          </div>
        )}

        {/* Repertórios Grid */}
        {!loading && !error && repertorios.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repertorios.map((repertorio) => (
              <div key={repertorio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {repertorio.nome}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {repertorio.publico && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Público
                        </span>
                      )}
                      <div className="relative">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 hidden">
                          <button 
                            onClick={() => handleEdit(repertorio)}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <i className="fas fa-edit mr-2"></i>
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(repertorio.id)}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <i className="fas fa-trash mr-2"></i>
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {repertorio.descricao && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {repertorio.descricao}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-music mr-1"></i>
                      {repertorio.cifras} cifras
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-calendar mr-1"></i>
                      {formatDate(repertorio.criadoEm)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEdit(repertorio)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Editar
                    </button>
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      <i className="fas fa-eye mr-1"></i>
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Novo/Editar Repertório */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRepertorio ? 'Editar Repertório' : 'Novo Repertório'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Repertório
                </label>
                <input 
                  type="text" 
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva o repertório..."
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="publico"
                  checked={formData.publico}
                  onChange={(e) => setFormData({ ...formData, publico: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="publico" className="ml-2 text-sm font-medium text-gray-700">
                  Tornar repertório público
                </label>
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
                  {editingRepertorio ? 'Salvar Alterações' : 'Criar Repertório'}
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