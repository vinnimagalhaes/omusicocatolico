// ===== PÁGINA DE CATEGORIAS =====

let todasCifras = [];
let cifrasFiltradas = [];

// Inicializar página
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    carregarCifraspagina();
    setupEventListeners();
    
    // Verificar se há filtros na URL
    const urlParams = new URLSearchParams(window.location.search);
    const parteMissa = urlParams.get('parte');
    const tempoLiturgico = urlParams.get('tempo');
    
    if (parteMissa) {
        document.getElementById('parteMissa').value = parteMissa;
    }
    if (tempoLiturgico) {
        document.getElementById('tempoLiturgico').value = tempoLiturgico;
    }
    
    // Aplicar filtros se existirem
    if (parteMissa || tempoLiturgico) {
        setTimeout(() => {
            aplicarFiltros();
        }, 1000);
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para os selects
    document.getElementById('parteMissa').addEventListener('change', function() {
        if (this.value) {
            aplicarFiltros();
        }
    });
    
    document.getElementById('tempoLiturgico').addEventListener('change', function() {
        if (this.value) {
            aplicarFiltros();
        }
    });
}

// Carregar cifras da API
async function carregarCifraspagina() {
    try {
        showLoadingState();
        
        const response = await fetch(apiUrl('/api/cifras'));
        const data = await response.json();
        
        todasCifras = data.cifras || [];
        cifrasFiltradas = [...todasCifras];
        
        hideLoadingState();
        renderizarResultados();
        
    } catch (error) {
        console.error('Erro ao carregar cifras:', error);
        hideLoadingState();
        showEmptyState();
        showToast('Erro ao carregar cifras', 'error');
    }
}

// Aplicar filtros
function aplicarFiltros() {
    const parteMissa = document.getElementById('parteMissa').value;
    const tempoLiturgico = document.getElementById('tempoLiturgico').value;
    
    cifrasFiltradas = todasCifras.filter(cifra => {
        let matches = true;
        
        // Filtro por parte da missa
        if (parteMissa && parteMissa !== '') {
            // Mapear valores do select para categorias das cifras
            const mapeamentoPartes = {
                'entrada': 'entrada',
                'ato-penitencial': 'entrada', // Pode ser usado como entrada
                'gloria': 'entrada', // Pode ser usado como entrada
                'salmo': 'entrada', // Pode ser usado como entrada
                'aleluia': 'entrada', // Pode ser usado como entrada
                'ofertorio': 'ofertorio',
                'santo': 'ofertorio', // Pode ser usado no ofertório
                'pai-nosso': 'comunhao', // Pode ser usado na comunhão
                'cordeiro': 'comunhao', // Pode ser usado na comunhão
                'comunhao': 'comunhao',
                'final': 'final',
                'adoracao': 'adoracao',
                'mariana': 'mariana'
            };
            
            const categoriaEsperada = mapeamentoPartes[parteMissa];
            
            // Se não tem mapeamento específico, busca pelo nome na categoria ou tags
            if (categoriaEsperada) {
                matches = matches && (cifra.categoria === categoriaEsperada);
            } else {
                // Busca mais flexível para partes específicas da missa
                const busca = parteMissa.toLowerCase();
                matches = matches && (
                    cifra.categoria.toLowerCase().includes(busca) ||
                    (cifra.tags && cifra.tags.some(tag => tag.toLowerCase().includes(busca))) ||
                    cifra.titulo.toLowerCase().includes(busca)
                );
            }
        }
        
        // Filtro por tempo litúrgico
        if (tempoLiturgico && tempoLiturgico !== '') {
            // Buscar no título, tags ou propriedades da cifra
            const busca = tempoLiturgico.toLowerCase();
            matches = matches && (
                (cifra.tempoLiturgico && cifra.tempoLiturgico.toLowerCase().includes(busca)) ||
                (cifra.tags && cifra.tags.some(tag => tag.toLowerCase().includes(busca))) ||
                cifra.titulo.toLowerCase().includes(busca.replace('-', ' ')) ||
                // Mapeamentos específicos
                (tempoLiturgico === 'maria' && cifra.categoria === 'mariana') ||
                (tempoLiturgico === 'santos' && cifra.titulo.toLowerCase().includes('santo')) ||
                (tempoLiturgico === 'natal' && cifra.titulo.toLowerCase().includes('natal')) ||
                (tempoLiturgico === 'pascoa' && cifra.titulo.toLowerCase().includes('aleluia')) ||
                (tempoLiturgico === 'quaresma' && cifra.titulo.toLowerCase().includes('quaresma'))
            );
        }
        
        return matches;
    });
    
    renderizarResultados();
    atualizarTitulo();
    
    // Atualizar URL
    atualizarURL();
}

// Limpar filtros
function limparFiltros() {
    document.getElementById('parteMissa').value = '';
    document.getElementById('tempoLiturgico').value = '';
    
    cifrasFiltradas = [...todasCifras];
    renderizarResultados();
    atualizarTitulo();
    
    // Limpar URL
    window.history.replaceState({}, document.title, window.location.pathname);
}

// Renderizar resultados
function renderizarResultados() {
    const resultsGrid = document.getElementById('resultsGrid');
    const emptyState = document.getElementById('emptyState');
    const contadorResultados = document.getElementById('contadorResultados');
    
    if (cifrasFiltradas.length === 0) {
        resultsGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        contadorResultados.textContent = '0 cifras encontradas';
        return;
    }
    
    emptyState.classList.add('hidden');
    resultsGrid.classList.remove('hidden');
    
    // Atualizar contador
    contadorResultados.textContent = `${cifrasFiltradas.length} cifra${cifrasFiltradas.length !== 1 ? 's' : ''} encontrada${cifrasFiltradas.length !== 1 ? 's' : ''}`;
    
    // Renderizar cards das cifras
    resultsGrid.innerHTML = cifrasFiltradas.map(cifra => createCifraCard(cifra)).join('');
    
    // Configurar event listeners dos cards
    setupCardEventListeners();
}

// Atualizar título baseado nos filtros
function atualizarTitulo() {
    const parteMissa = document.getElementById('parteMissa').value;
    const tempoLiturgico = document.getElementById('tempoLiturgico').value;
    const tituloResultados = document.getElementById('tituloResultados');
    
    let titulo = 'Todas as Cifras';
    
    if (parteMissa && tempoLiturgico) {
        const nomeParteMissa = document.getElementById('parteMissa').options[document.getElementById('parteMissa').selectedIndex].text;
        const nomeTempoLiturgico = document.getElementById('tempoLiturgico').options[document.getElementById('tempoLiturgico').selectedIndex].text;
        titulo = `${nomeParteMissa} - ${nomeTempoLiturgico}`;
    } else if (parteMissa) {
        const nomeParteMissa = document.getElementById('parteMissa').options[document.getElementById('parteMissa').selectedIndex].text;
        titulo = `Cifras de ${nomeParteMissa}`;
    } else if (tempoLiturgico) {
        const nomeTempoLiturgico = document.getElementById('tempoLiturgico').options[document.getElementById('tempoLiturgico').selectedIndex].text;
        titulo = `Cifras de ${nomeTempoLiturgico}`;
    }
    
    tituloResultados.textContent = titulo;
}

// Atualizar URL com filtros
function atualizarURL() {
    const parteMissa = document.getElementById('parteMissa').value;
    const tempoLiturgico = document.getElementById('tempoLiturgico').value;
    
    const params = new URLSearchParams();
    
    if (parteMissa) params.append('parte', parteMissa);
    if (tempoLiturgico) params.append('tempo', tempoLiturgico);
    
    const newURL = params.toString() ? 
        `${window.location.pathname}?${params.toString()}` : 
        window.location.pathname;
    
    window.history.replaceState({}, document.title, newURL);
}

// Estados da UI
function showLoadingState() {
    document.getElementById('loadingState').classList.remove('hidden');
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('resultsGrid').classList.add('hidden');
}

function hideLoadingState() {
    document.getElementById('loadingState').classList.add('hidden');
}

function showEmptyState() {
    document.getElementById('emptyState').classList.remove('hidden');
    document.getElementById('resultsGrid').classList.add('hidden');
    document.getElementById('contadorResultados').textContent = '0 cifras encontradas';
}

// Função auxiliar para obter cores das categorias (reutilizada do app.js)
function getCategoryColor(categoria) {
    const colors = {
        entrada: 'bg-green-100 text-green-800',
        comunhao: 'bg-yellow-100 text-yellow-800',
        final: 'bg-purple-100 text-purple-800',
        adoracao: 'bg-red-100 text-red-800',
        mariana: 'bg-blue-100 text-blue-800',
        ofertorio: 'bg-green-100 text-green-800'
    };
    return colors[categoria] || 'bg-gray-100 text-gray-800';
}

// Função auxiliar para formatar nomes das categorias
function formatCategory(categoria) {
    const names = {
        entrada: 'Entrada',
        comunhao: 'Comunhão',
        final: 'Final',
        adoracao: 'Adoração',
        mariana: 'Mariana',
        ofertorio: 'Ofertório'
    };
    return names[categoria] || categoria;
}

// Função de busca para o header
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        // Se busca vazia, voltar aos filtros atuais
        aplicarFiltros();
        return;
    }
    
    // Filtrar todas as cifras pela busca
    cifrasFiltradas = todasCifras.filter(cifra => 
        cifra.titulo.toLowerCase().includes(searchTerm) ||
        cifra.artista.toLowerCase().includes(searchTerm) ||
        cifra.categoria.toLowerCase().includes(searchTerm)
    );
    
    renderizarResultados();
    
    // Atualizar título para mostrar busca
    document.getElementById('tituloResultados').textContent = `Resultados para "${searchTerm}"`;
}

// Função para voltar à página inicial (quando clica no logo)
function goToHome() {
    window.location.href = '/inicio';
}

// Funções de navegação
function filtrarMinhasCifras() {
    window.location.href = '/minhas-cifras';
}

function filtrarFavoritas() {
    window.location.href = '/favoritas';
} 