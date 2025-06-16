// Configuração Google OAuth
const GOOGLE_CLIENT_ID = 'your_google_client_id_here'; // Substitua pelo seu Client ID real

// Inicializar Google Sign-In
window.onload = function() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse
        });
    }
};

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
        window.location.href = 'login.html';
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
        window.location.href = 'login.html';
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

// Fetch com autenticação
async function fetchWithAuth(url, options = {}) {
    // Não precisa mais de token, cookies httpOnly são enviados automaticamente
    const fullUrl = url.startsWith('http') ? url : apiUrl(url);
    try {
        const response = await fetch(fullUrl, {
            ...options,
            credentials: 'include',
        });
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        return response;
    } catch (error) {
        console.error('Erro na requisição autenticada:', error);
        throw error;
    }
}

// Verificar auth na inicialização (apenas se não estiver na página de login)
// Removido checkAuth automático para permitir acesso sem login 