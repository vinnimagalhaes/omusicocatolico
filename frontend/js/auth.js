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
    loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch(apiUrl('/api/auth/login'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showToast('Login realizado com sucesso!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirecionar para dashboard
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showToast(data.message || 'Erro ao fazer login', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showToast('Erro interno. Tente novamente.', 'error');
    }
    });
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
                window.location.href = 'index.html';
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
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
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Token de autenticação não encontrado');
    }
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    // Se a URL não começa com http, assumir que é um endpoint da API
    const fullUrl = url.startsWith('http') ? url : apiUrl(url);
    
    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers
        });
        
        // Se o token estiver inválido/expirado, limpar localStorage
        if (response.status === 401) {
            console.log('Token expirado, limpando localStorage...');
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