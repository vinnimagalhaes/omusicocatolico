// Configuração da API
// Como estamos usando nginx como proxy, sempre usar URLs relativas
const API_BASE_URL = '';

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