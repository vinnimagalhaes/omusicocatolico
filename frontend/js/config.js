// Configuração da API
// Se estivermos na mesma porta, usar URLs relativas, senão usar localhost:8000
const API_BASE_URL = window.location.port === '8000' ? '' : 'http://localhost:8000';

// Função helper para construir URLs da API
function apiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}

// Verificar se a API está disponível
async function checkApiHealth() {
    try {
        const response = await fetch(apiUrl('/api/cifras'));
        return response.ok;
    } catch (error) {
        console.error('API não está disponível:', error);
        return false;
    }
} 