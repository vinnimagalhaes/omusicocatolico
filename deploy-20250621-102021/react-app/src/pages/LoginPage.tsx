import React, { useState } from 'react'

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui vamos integrar com a API depois
    console.log('Login form submitted')
  }

  const loginWithGoogle = () => {
    // Integração com Google OAuth
    console.log('Google login clicked')
  }

  return (
    <>
      {/* Estilos inline preservados exatos */}
      <style>{`
        .gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Body com HTML EXATO preservado */}
      <div className="gradient-bg min-h-screen flex items-center justify-center p-4">
        {/* Login Container */}
        <div className="glass-effect rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Logo e Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <i className="fas fa-music text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">OMúsicoCatólico</h1>
            <p className="text-gray-600">Entre na sua conta</p>
          </div>

          {/* Login Form */}
          <form id="loginForm" className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input 
                type="email" 
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors pr-12"
                  placeholder="••••••••"
                  required
                />
                <button 
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-3 top-half transform translate-y-neg-half text-gray-400 hover:text-gray-600"
                >
                  <i id="passwordIcon" className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
                Esqueci a senha
              </a>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Entrar
            </button>
          </form>

          {/* Divider */}
          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
          </div>

          {/* Google Login */}
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5 mr-3" />
            Continuar com Google
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Não tem uma conta? </span>
            <a href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Criar conta
            </a>
          </div>
        </div>

        {/* Toast Container */}
        <div id="toastContainer" className="fixed top-4 right-4 z-50"></div>
      </div>
    </>
  )
}

export default LoginPage 