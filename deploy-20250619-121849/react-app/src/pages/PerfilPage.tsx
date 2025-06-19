import React, { useState, useEffect } from 'react';

const PerfilPage: React.FC = () => {
  const [userData, setUserData] = useState({
    nome: '',
    email: '',
    bio: '',
    localizacao: '',
    stats: {
      cifras: 0,
      favoritos: 0,
      repertorios: 0
    }
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados do usuário
    setTimeout(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setUserData({
        nome: user.nome || 'Usuário',
        email: user.email || 'usuario@email.com',
        bio: '',
        localizacao: '',
        stats: {
          cifras: 0,
          favoritos: 0,
          repertorios: 0
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Implementar sistema de toast aqui
    console.log(`${type}: ${message}`);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Perfil atualizado com sucesso!', 'success');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    if (passwords.newPassword.length < 6) {
      showToast('A nova senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    showToast('Senha alterada com sucesso!', 'success');
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-gray-400"></i>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Navegação Principal Unificada */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4">
            <a href="/inicio" data-nav="inicio" className="nav-item flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm whitespace-nowrap">
              <i className="fas fa-home w-4 h-4 mr-2 text-gray-500"></i>
              Início
            </a>
            <a href="/repertorios" data-nav="repertorios" className="nav-item flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm whitespace-nowrap">
              <i className="fas fa-list w-4 h-4 mr-2 text-gray-500"></i>
              Meus Repertórios
            </a>
            <a href="/favoritas" data-nav="favoritas" className="nav-item flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm whitespace-nowrap">
              <i className="fas fa-heart w-4 h-4 mr-2 text-gray-500"></i>
              Favoritas
            </a>
            <a href="/minhas-cifras" data-nav="minhas-cifras" className="nav-item flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm whitespace-nowrap">
              <i className="fas fa-music w-4 h-4 mr-2 text-gray-500"></i>
              Minhas Cifras
            </a>
            <a href="/categorias" data-nav="categorias" className="nav-item flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-white hover:shadow-sm whitespace-nowrap">
              <i className="fas fa-tags w-4 h-4 mr-2 text-gray-500"></i>
              Categorias
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{getInitials(userData.nome)}</span>
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{userData.nome}</h2>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500 mt-1">Membro desde 2024</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-music text-blue-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Cifras Criadas</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.cifras}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-heart text-red-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Favoritos</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.favoritos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="fas fa-list text-green-600 text-xl"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Repertórios</p>
                <p className="text-2xl font-bold text-gray-900">{userData.stats.repertorios}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Data Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Dados Pessoais</h3>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                <input 
                  type="text" 
                  value={userData.nome}
                  onChange={(e) => setUserData(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={userData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" 
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea 
                rows={3} 
                value={userData.bio}
                onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Conte um pouco sobre você..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Localização</label>
              <input 
                type="text" 
                value={userData.localizacao}
                onChange={(e) => setUserData(prev => ({ ...prev, localizacao: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Cidade, Estado"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <i className="fas fa-save mr-2"></i>Salvar Alterações
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Alterar Senha</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha Atual</label>
                <input 
                  type="password" 
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nova Senha</label>
                <input 
                  type="password" 
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  minLength={6} 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Nova Senha</label>
                <input 
                  type="password" 
                  value={passwords.confirmNewPassword}
                  onChange={(e) => setPasswords(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                <i className="fas fa-key mr-2"></i>Alterar Senha
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Toast Container */}
      <div id="toastContainer" className="fixed top-4 right-4 z-50"></div>
    </div>
  );
};

export default PerfilPage; 