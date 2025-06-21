import React, { useState, useEffect } from 'react';

interface Repertorio {
  id: number;
  nome: string;
  descricao: string;
  autor: string;
  cifras: number;
  categoria: string;
  publico: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export default function RepertoriosComunidadePage() {
  const [repertorios, setRepertorios] = useState<Repertorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortFilter, setSortFilter] = useState('recent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRepertorios();
  }, []);

  const loadRepertorios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/repertorios/publicos');
      
      if (!response.ok) {
        throw new Error('Erro ao carregar repertórios');
      }
      
      const data = await response.json();
      setRepertorios(data);
    } catch (err) {
      console.error('Erro ao carregar repertórios:', err);
      setError('Erro ao carregar repertórios da comunidade');
    } finally {
      setLoading(false);
    }
  };

  const filteredRepertorios = repertorios
    .filter(repertorio => 
      repertorio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repertorio.autor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repertorio.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortFilter) {
        case 'popular':
          return b.cifras - a.cifras;
        case 'name':
          return a.nome.localeCompare(b.nome);
        case 'recent':
        default:
          return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      'Missa': 'bg-purple-100 text-purple-800',
      'Adoração': 'bg-yellow-100 text-yellow-800',
      'Louvor': 'bg-blue-100 text-blue-800',
      'Contemplação': 'bg-green-100 text-green-800',
      'Natal': 'bg-red-100 text-red-800',
      'Páscoa': 'bg-orange-100 text-orange-800',
      'Mariano': 'bg-indigo-100 text-indigo-800',
      'default': 'bg-gray-100 text-gray-800'
    };
    return colors[categoria] || colors.default;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  <i className="fas fa-users text-green-600 mr-3"></i>
                  Repertórios da Comunidade
                </h1>
                <p className="text-gray-600 mt-2">Descubra e explore repertórios compartilhados pela comunidade católica</p>
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <i className="fas fa-exclamation-triangle text-red-500 text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar repertórios</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadRepertorios}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da página */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <i className="fas fa-users text-green-600 mr-3"></i>
                Repertórios da Comunidade
              </h1>
              <p className="text-gray-600 mt-2">Descubra e explore repertórios compartilhados pela comunidade católica</p>
            </div>
            
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select 
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>

          {/* Barra de pesquisa */}
          <div className="mt-6">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Pesquisar repertórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Lista de repertórios */}
        {filteredRepertorios.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-music text-gray-400 text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nenhum repertório encontrado</h2>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar sua pesquisa' : 'Ainda não há repertórios públicos disponíveis'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRepertorios.map((repertorio) => (
              <div key={repertorio.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {repertorio.nome}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(repertorio.categoria)}`}>
                      {repertorio.categoria}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {repertorio.descricao}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-user mr-1"></i>
                      {repertorio.autor}
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-music mr-1"></i>
                      {repertorio.cifras} cifras
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatDate(repertorio.criadoEm)}
                    </span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                      Ver Repertório
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estatísticas */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas da Comunidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{repertorios.length}</div>
              <div className="text-sm text-gray-600">Repertórios Públicos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {repertorios.reduce((total, rep) => total + rep.cifras, 0)}
              </div>
              <div className="text-sm text-gray-600">Total de Cifras</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(repertorios.map(rep => rep.autor)).size}
              </div>
              <div className="text-sm text-gray-600">Contribuidores</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 