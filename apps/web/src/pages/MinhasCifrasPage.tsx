import React, { useState, useEffect } from 'react';

// Declarar as funções JavaScript globais para TypeScript
declare global {
  interface Window {
    showAddCifraModal: () => void;
    openCifraEditor: () => void;
    openUrlImportModal: () => void;
    openCifraUploader: () => void;
    reactAppReady: () => void;
  }
}

const MinhasCifrasPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [cifras, _setCifras] = useState([]);
  const [scriptsReady, setScriptsReady] = useState(false);

  useEffect(() => {
    console.log('🚀 [REACT] MinhasCifrasPage montado!');
    
    // Verificar se as funções estão disponíveis imediatamente
    const checkFunctions = () => {
      console.log('🔍 [REACT] Verificando funções JavaScript...');
      console.log('🔍 [REACT] showAddCifraModal:', typeof window.showAddCifraModal);
      console.log('🔍 [REACT] openCifraEditor:', typeof window.openCifraEditor);
      console.log('🔍 [REACT] openUrlImportModal:', typeof window.openUrlImportModal);
      console.log('🔍 [REACT] openCifraUploader:', typeof window.openCifraUploader);
      
      const functionsAvailable = 
        typeof window.showAddCifraModal === 'function' &&
        typeof window.openCifraEditor === 'function';
      
      if (functionsAvailable) {
        console.log('✅ [REACT] Todas as funções estão disponíveis!');
        setScriptsReady(true);
        setupEventListeners(); // Configurar event listeners nativos
      } else {
        console.log('⚠️ [REACT] Algumas funções não estão disponíveis ainda...');
      }
      
      return functionsAvailable;
    };

    // Configurar event listeners nativos (mais confiável que onClick do React)
    const setupEventListeners = () => {
      console.log('🔧 [REACT] Configurando event listeners nativos...');
      
      // Aguardar um pouco para garantir que os elementos foram renderizados
      setTimeout(() => {
        const novaCifraBtn = document.getElementById('nova-cifra-btn');
        const criarPrimeiraCifraBtn = document.getElementById('criar-primeira-cifra-btn');
        
        if (novaCifraBtn) {
          novaCifraBtn.addEventListener('click', handleNovaCifraClick);
          console.log('✅ [REACT] Event listener adicionado ao botão Nova Cifra');
        } else {
          console.log('⚠️ [REACT] Botão Nova Cifra não encontrado');
        }
        
        if (criarPrimeiraCifraBtn) {
          criarPrimeiraCifraBtn.addEventListener('click', handleNovaCifraClick);
          console.log('✅ [REACT] Event listener adicionado ao botão Criar Primeira Cifra');
        } else {
          console.log('⚠️ [REACT] Botão Criar Primeira Cifra não encontrado');
        }
      }, 100);
    };

    // Verificar imediatamente
    if (!checkFunctions()) {
      // Se não estão disponíveis, tentar novamente em intervalos
      let attempts = 0;
      const maxAttempts = 20; // Aumentei para 20 tentativas
      
      const interval = setInterval(() => {
        attempts++;
        console.log(`🔄 [REACT] Tentativa ${attempts}/${maxAttempts} de verificar funções...`);
        
        if (checkFunctions() || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts) {
            console.error('❌ [REACT] Não foi possível carregar as funções JavaScript!');
          }
        }
      }, 200); // Reduzido para 200ms para tentar mais rápido
    }

    // Chamar função de callback se disponível
    if (typeof window.reactAppReady === 'function') {
      window.reactAppReady();
    }

    // Simular carregamento das cifras
    setTimeout(() => {
      setLoading(false);
    }, 1000);

    // Cleanup: remover event listeners quando componente for desmontado
    return () => {
      const novaCifraBtn = document.getElementById('nova-cifra-btn');
      const criarPrimeiraCifraBtn = document.getElementById('criar-primeira-cifra-btn');
      
      if (novaCifraBtn) {
        novaCifraBtn.removeEventListener('click', handleNovaCifraClick);
      }
      if (criarPrimeiraCifraBtn) {
        criarPrimeiraCifraBtn.removeEventListener('click', handleNovaCifraClick);
      }
    };
  }, []);

  // Handler nativo para os cliques
  const handleNovaCifraClick = (event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🎵 [REACT] Botão clicado via event listener nativo!');
    console.log('🔍 [REACT] Scripts prontos:', scriptsReady);
    console.log('🔍 [REACT] showAddCifraModal disponível:', typeof window.showAddCifraModal);
    
    if (window.showAddCifraModal && typeof window.showAddCifraModal === 'function') {
      console.log('✅ [REACT] Chamando showAddCifraModal...');
      try {
        window.showAddCifraModal();
      } catch (error) {
        console.error('❌ [REACT] Erro ao chamar showAddCifraModal:', error);
      }
    } else {
      console.error('❌ [REACT] showAddCifraModal não está disponível');
      
      // Debug: listar todas as propriedades do window
      console.log('🔍 [REACT] Propriedades do window:', Object.keys(window).filter(key => key.includes('show') || key.includes('open')));
      
      alert('⚠️ Scripts não carregados ainda. Aguarde ou recarregue a página.');
    }
  };

  return (
    <div className="bg-gray-50 font-sans">
      {/* Status de carregamento dos scripts */}
      {!scriptsReady && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded z-50">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Aguardando scripts JavaScript...
        </div>
      )}
      
      {scriptsReady && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded z-50">
          <i className="fas fa-check mr-2"></i>
          Scripts carregados!
        </div>
      )}
      
      {/* Navegação Principal Unificada */}
      <nav className="main-navigation" id="mainNavigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <i className="fas fa-music text-blue-600 text-2xl mr-2"></i>
                <span className="font-bold text-xl text-gray-900">OMúsicoCatólico</span>
              </a>
            </div>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i className="fas fa-home mr-2"></i>Início
              </a>
              <a href="/categorias.html" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i className="fas fa-list mr-2"></i>Categorias
              </a>
              <a href="/favoritas.html" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i className="fas fa-heart mr-2"></i>Favoritas
              </a>
              <a href="/minhas-cifras.html" className="text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium">
                <i className="fas fa-music mr-2"></i>Minhas Cifras
              </a>
              <a href="/repertorios.html" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                <i className="fas fa-folder mr-2"></i>Repertórios
              </a>
            </div>

            {/* Botão Nova Cifra */}
            <div className="flex items-center space-x-4">
              <button 
                id="nova-cifra-btn"
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Nova Cifra
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Minhas Cifras</h1>
          <p className="text-gray-600">Gerencie suas cifras pessoais</p>
        </div>

        {/* Estado de Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-gray-600">Carregando suas cifras...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Estado Vazio */}
            {cifras.length === 0 ? (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto">
                  <i className="fas fa-music text-6xl text-gray-300 mb-6"></i>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Nenhuma cifra encontrada
                  </h3>
                  <p className="text-gray-600 mb-8">
                    Você ainda não criou nenhuma cifra. Que tal começar agora?
                  </p>
                  <button 
                    id="criar-primeira-cifra-btn"
                    type="button"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Criar Primeira Cifra
                  </button>
                </div>
              </div>
            ) : (
              /* Lista de Cifras */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cifras.map((cifra: any) => (
                  <div key={cifra.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{cifra.titulo}</h3>
                    <p className="text-gray-600 text-sm mb-4">{cifra.artista}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Tom: {cifra.tom}</span>
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-800">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MinhasCifrasPage; 