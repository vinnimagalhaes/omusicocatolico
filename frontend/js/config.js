// Configuração da API
const API_BASE_URL = window.location.origin;

// Função helper para construir URLs da API
function apiUrl(endpoint) {
    // Garantir que o endpoint começa com /api
    if (!endpoint.startsWith('/api')) {
        endpoint = '/api' + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
    }
    return `${API_BASE_URL}${endpoint}`;
}

// Verificar se a API está disponível
async function checkApiHealth() {
    try {
        const response = await fetch(apiUrl('/cifras'));
        return response.ok;
    } catch (error) {
        console.error('API não está disponível:', error);
        return false;
    }
} 