// Autenticação e gerenciamento de sessão - OMúsicoCatólico
// Última atualização: 17/06/2025 12:36 - Testando deploy automático

// Configuração Google OAuth - TEMPORARIAMENTE REMOVIDO PARA CORRIGIR ERRO DE SINTAXE
// const GOOGLE_CLIENT_ID = 'your_google_client_id_here'; // Substitua pelo seu Client ID real

// Inicializar Google Sign-In - TEMPORARIAMENTE DESABILITADO
// window.onload = function() {
//     if (typeof google !== 'undefined' && google.accounts) {
//         google.accounts.id.initialize({
//             client_id: GOOGLE_CLIENT_ID,
//             callback: handleGoogleResponse
//         });
//     }
// };

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('passwordIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

// Login com email/senha
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Verificar se já existe um listener (prevenir duplicação)
    if (!loginForm.hasAttribute('data-listener-added')) {
        console.log('🔧 [FRONTEND] Adicionando event listener de login');
        loginForm.setAttribute('data-listener-added', 'true');
        
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevenir múltiplas submissões
            if (this.hasAttribute('data-submitting')) {
                console.log('⚠️ [FRONTEND] Tentativa de submissão dupla bloqueada');
                return;
            }
            
            this.setAttribute('data-submitting', 'true');
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            console.log('🚀 [FRONTEND] Iniciando processo de login para:', email);
            
            try {
                const response = await fetch(apiUrl('/auth/login'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                console.log('📡 [FRONTEND] Resposta recebida, status:', response.status);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('✅ [FRONTEND] Login bem-sucedido');
                showToast('Login realizado com sucesso!', 'success');
                localStorage.setItem('token', data.token);
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Redirecionar para dashboard
                setTimeout(() => {
                    window.location.href = '/inicio';
                }, 1000);
            } catch (error) {
                console.error('❌ [FRONTEND] Erro no login:', error);
                showToast('Erro interno. Tente novamente.', 'error');
            } finally {
                // Remover flag de submissão
                this.removeAttribute('data-submitting');
            }
        });
    } else {
        console.log('⚠️ [FRONTEND] Event listener de login já existe, não adicionando duplicado');
    }
}

// Login com Google
function loginWithGoogle() {
    google.accounts.id.prompt();
}

// Handle Google response
async function handleGoogleResponse(response) {
    try {
        const result = await fetch(apiUrl('/api/auth/google'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                credential: response.credential 
            })
        });
        
        const data = await result.json();
        
        if (result.ok) {
            showToast('Login com Google realizado com sucesso!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar para dashboard
            setTimeout(() => {
                window.location.href = '/inicio';
            }, 1000);
        } else {
            showToast(data.message || 'Erro ao fazer login com Google', 'error');
        }
    } catch (error) {
        console.error('Erro no login Google:', error);
        showToast('Erro interno. Tente novamente.', 'error');
    }
}

// Sistema de Toast
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `
        bg-white border-l-4 border-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 
        p-4 rounded-lg shadow-lg mb-4 max-w-sm transform transition-all duration-300 
        translate-x-full opacity-0
    `;
    
    toast.innerHTML = `
        <div class="flex items-center">
            <div class="flex-shrink-0">
                <i class="fas fa-${type === 'success' ? 'check-circle text-green-500' : 
                                 type === 'error' ? 'times-circle text-red-500' : 
                                 'info-circle text-blue-500'}"></i>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">${message}</p>
            </div>
            <div class="ml-auto pl-3">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        class="text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 5000);
}

// Verificar se usuário está logado
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        // Usuário não logado, redirecionar para login
        window.location.href = '/login';
    }
}

// Logout
function logout() {
    fetch(apiUrl('/auth/logout'), {
        method: 'POST',
        credentials: 'include',
    }).finally(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    });
}

// Verificar se está autenticado
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
}

// Obter token de autenticação
function getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken');
}

// Função para decodificar JWT e verificar expiração
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        // Verificar se o token tem 3 partes (header.payload.signature)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('[TOKEN CHECK] Token inválido - formato incorreto');
            return true;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        
        // Verificar se o payload tem o campo exp
        if (!payload.exp) {
            console.warn('[TOKEN CHECK] Token sem campo de expiração');
            return false; // Se não tem exp, assumir que é válido
        }
        
        const currentTime = Math.floor(Date.now() / 1000);
        const buffer = 30; // 30 segundos de buffer
        
        console.log('[TOKEN CHECK] Token exp:', new Date(payload.exp * 1000).toLocaleString());
        console.log('[TOKEN CHECK] Current time:', new Date().toLocaleString());
        console.log('[TOKEN CHECK] Token expired:', payload.exp < (currentTime + buffer));
        
        return payload.exp < (currentTime + buffer);
    } catch (error) {
        console.error('[TOKEN CHECK] Erro ao decodificar token:', error);
        return true;
    }
}

// Função para tentar renovar token automaticamente
async function tryRenewToken() {
    try {
        console.log('[TOKEN RENEWAL] Tentando renovar token...');
        
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.email) {
            console.log('[TOKEN RENEWAL] Usuário não encontrado para renovação');
            return false;
        }
        
        // Se temos um refresh token ou podemos tentar um login silencioso
        // Por agora, vamos apenas limpar e redirecionar
        console.log('[TOKEN RENEWAL] Token expirado, redirecionando para login');
        localStorage.clear();
        window.location.href = '/login';
        return false;
        
    } catch (error) {
        console.error('[TOKEN RENEWAL] Erro ao renovar token:', error);
        return false;
    }
}

// Fetch com autenticação
async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    if (!token) {
        console.error('[FETCH_AUTH] Token não encontrado no localStorage');
        throw new Error('Token de autenticação não encontrado');
    }

    // Temporariamente desabilitado - deixar o servidor validar
    // if (isTokenExpired(token)) {
    //     console.warn('[FETCH_AUTH] Token expirado, tentando renovar...');
    //     const renewed = await tryRenewToken();
    //     if (!renewed) {
    //         throw new Error('Token expirado e não foi possível renovar');
    //     }
    // }

    console.log('[FETCH_AUTH] Token encontrado:', token.substring(0, 20) + '...');
    console.log('[FETCH_AUTH] URL da requisição:', url);

    const fullUrl = url.startsWith('http') ? url : apiUrl(url);
    
    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        
        console.log('[FETCH_AUTH] Response status:', response.status);
        console.log('[FETCH_AUTH] Response headers:', [...response.headers.entries()]);
        
        if (response.status === 401) {
            console.error('[FETCH_AUTH] Token rejeitado pelo servidor (401)');
            
            // Tentar renovar token uma vez
            const renewed = await tryRenewToken();
            if (!renewed) {
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                throw new Error('Sessão expirada. Faça login novamente.');
            }
        }
        
        return response;
    } catch (error) {
        console.error('[FETCH_AUTH] Erro na requisição autenticada:', error);
        throw error;
    }
}

// Verificar auth na inicialização (apenas se não estiver na página de login)
// Removido checkAuth automático para permitir acesso sem login 