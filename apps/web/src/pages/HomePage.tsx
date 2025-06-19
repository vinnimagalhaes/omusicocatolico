import React, { useEffect } from 'react'

const HomePage: React.FC = () => {
  useEffect(() => {
    // Aqui vamos integrar os scripts JS existentes
    // Por enquanto, apenas placeholder para funcionalidades
  }, [])

  return (
    <>
      {/* Navegação Principal Unificada - HTML EXATO preservado */}
      <nav className="main-navigation" id="mainNavigation">
        <div className="nav-container">
          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <a href="/" className="nav-brand">OMúsicoCatólico</a>
            
            <ul className="nav-menu">
              <li className="nav-item">
                <a href="/inicio" className="nav-link active" data-nav="inicio">
                  <i className="fas fa-home nav-icon"></i>
                  Início
                </a>
              </li>
              
              <li className="nav-item nav-dropdown">
                <div className="nav-link nav-dropdown-toggle" data-nav="repertorios">
                  <i className="fas fa-list nav-icon"></i>
                  Repertórios
                  <i className="fas fa-chevron-down nav-dropdown-icon"></i>
                </div>
                <div className="nav-dropdown-menu">
                  <a href="/repertorios" className="nav-dropdown-item" data-nav="repertorios">
                    <i className="fas fa-user nav-icon" style={{color: 'var(--color-primary-600)'}}></i>
                    Meus Repertórios
                  </a>
                  <a href="/repertorios-comunidade" className="nav-dropdown-item" data-nav="repertorios-comunidade">
                    <i className="fas fa-users nav-icon" style={{color: 'var(--color-secondary-600)'}}></i>
                    Repertórios da Comunidade
                  </a>
                </div>
              </li>
              
              <li className="nav-item">
                <a href="/favoritas" className="nav-link" data-nav="favoritas">
                  <i className="fas fa-heart nav-icon"></i>
                  Favoritas
                </a>
              </li>
              
              <li className="nav-item">
                <a href="/minhas-cifras" className="nav-link" data-nav="minhas-cifras">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-item">
                <a href="/categorias" className="nav-link" data-nav="categorias">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>
            </ul>

            {/* User Menu */}
            <div className="nav-user-menu">
              {/* Not Logged In */}
              <div id="notLoggedIn" className="hidden">
                <a href="/login" className="nav-login-btn">
                  <i className="fas fa-sign-in-alt nav-icon"></i>
                  Entrar
                </a>
              </div>

              {/* Logged In */}
              <div id="loggedIn" className="nav-user-dropdown">
                <button className="nav-user-btn">
                  <div className="nav-user-avatar" id="userInitials">U</div>
                  <span id="userName" className="nav-user-name">Usuário</span>
                  <i className="fas fa-chevron-down nav-user-icon"></i>
                </button>
                
                <div id="userDropdown" className="nav-user-dropdown-menu">
                  <div className="nav-user-dropdown-header">
                    <span id="userNameDropdown">Usuário</span>
                  </div>
                  <a href="/perfil" className="nav-user-dropdown-item">
                    <i className="fas fa-user nav-icon"></i>
                    Meu Perfil
                  </a>
                  <a href="/repertorios" className="nav-user-dropdown-item">
                    <i className="fas fa-list nav-icon"></i>
                    Meus Repertórios
                  </a>
                  <a href="#" className="nav-user-dropdown-item">
                    <i className="fas fa-cog nav-icon"></i>
                    Configurações
                  </a>
                  <div id="masterLink" className="hidden">
                    <hr className="nav-user-divider" />
                    <a href="master-dashboard.html" className="nav-user-dropdown-item nav-user-dropdown-item-master">
                      <i className="fas fa-crown nav-icon"></i>
                      Painel Master
                    </a>
                  </div>
                  <hr className="nav-user-divider" />
                  <button className="nav-user-dropdown-item nav-user-dropdown-item-logout">
                    <i className="fas fa-sign-out-alt nav-icon"></i>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="nav-mobile">
            <a href="/" className="nav-brand">OMúsicoCatólico</a>
            <button className="nav-toggle" aria-label="Abrir menu">
              <i className="fas fa-bars nav-toggle-icon"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className="nav-mobile-menu">
          <div className="nav-mobile-content">
            <div className="nav-mobile-header">
              <span className="nav-brand">OMúsicoCatólico</span>
              <button className="nav-mobile-close" aria-label="Fechar menu">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <ul className="nav-mobile-list">
              <li className="nav-mobile-item">
                <a href="/inicio" className="nav-mobile-link active" data-nav="inicio">
                  <i className="fas fa-home nav-icon"></i>
                  Início
                </a>
              </li>
              
              <li className="nav-mobile-dropdown">
                <button className="nav-mobile-dropdown-toggle" data-nav="repertorios">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-list nav-icon"></i>
                    Repertórios
                  </div>
                  <i className="fas fa-chevron-down nav-mobile-dropdown-icon"></i>
                </button>
                <div className="nav-mobile-dropdown-menu">
                  <a href="/repertorios" className="nav-mobile-dropdown-item" data-nav="repertorios">
                    <i className="fas fa-user nav-icon" style={{color: 'var(--color-primary-600)'}}></i>
                    Meus Repertórios
                  </a>
                  <a href="/repertorios-comunidade" className="nav-mobile-dropdown-item" data-nav="repertorios-comunidade">
                    <i className="fas fa-users nav-icon" style={{color: 'var(--color-secondary-600)'}}></i>
                    Repertórios da Comunidade
                  </a>
                </div>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/favoritas" className="nav-mobile-link" data-nav="favoritas">
                  <i className="fas fa-heart nav-icon"></i>
                  Favoritas
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/minhas-cifras" className="nav-mobile-link" data-nav="minhas-cifras">
                  <i className="fas fa-music nav-icon"></i>
                  Minhas Cifras
                </a>
              </li>
              
              <li className="nav-mobile-item">
                <a href="/categorias" className="nav-mobile-link" data-nav="categorias">
                  <i className="fas fa-tags nav-icon"></i>
                  Categorias
                </a>
              </li>

              {/* Mobile User Menu */}
              <li className="nav-mobile-item nav-mobile-user">
                <div id="notLoggedInMobile" className="hidden">
                  <a href="/login" className="nav-mobile-link">
                    <i className="fas fa-sign-in-alt nav-icon"></i>
                    Entrar
                  </a>
                </div>
                <div id="loggedInMobile" className="hidden">
                  <div className="nav-mobile-user-info">
                    <div className="nav-mobile-user-avatar" id="userInitialsMobile">U</div>
                    <span id="userNameMobile">Usuário</span>
                  </div>
                  <a href="/perfil" className="nav-mobile-link">
                    <i className="fas fa-user nav-icon"></i>
                    Meu Perfil
                  </a>
                  <a href="/repertorios" className="nav-mobile-link">
                    <i className="fas fa-list nav-icon"></i>
                    Meus Repertórios
                  </a>
                  <div id="masterLinkMobile" className="hidden">
                    <a href="master-dashboard.html" className="nav-mobile-link">
                      <i className="fas fa-crown nav-icon"></i>
                      Painel Master
                    </a>
                  </div>
                  <button className="nav-mobile-link nav-mobile-logout">
                    <i className="fas fa-sign-out-alt nav-icon"></i>
                    Sair
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content - HTML EXATO preservado */}
      <div className="flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Banner Carousel Section - HTML EXATO */}
          <div className="banner-carousel-container mb-8 md:mb-12 relative">
            <div className="banner-carousel overflow-hidden rounded-3xl">
              {/* Banner slides */}
              <div className="banner-slides flex transition-transform duration-500 ease-in-out" id="bannerSlides">
                {/* Default welcome banner */}
                <div className="banner-slide min-w-full welcome-section relative overflow-hidden p-8 md:p-12 text-center flex flex-col justify-center items-center min-h-300 md:min-h-400 rounded-3xl" style={{background: '#000000'}}>
                  <div className="relative z-10 w-full">
                    <h3 className="text-3xl md:text-5xl font-bold mb-4 leading-tight" style={{color: '#ffffff'}}>
                      <span style={{background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 25%, #AF52DE 50%, #FF2D92 75%, #FF9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>OMúsicoCatólico</span>: a serviço da Liturgia.
                    </h3>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{color: '#d1d5db'}}>
                      Encontre cifras para <span style={{background: 'linear-gradient(90deg, #007AFF 0%, #5856D6 25%, #AF52DE 50%, #FF2D92 75%, #FF9500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: '600'}}>músicas católicas</span>, 
                      crie seus repertórios e compartilhe com sua comunidade.
                    </p>
                  </div>
                </div>
                
                {/* Custom banner slots (will be populated by JavaScript) */}
                <div className="banner-slide min-w-full custom-banner hidden" id="banner-slot-1">
                  <img src="" alt="Banner 1" className="w-full h-64 md:h-80 object-cover rounded-3xl" />
                </div>
                <div className="banner-slide min-w-full custom-banner hidden" id="banner-slot-2">
                  <img src="" alt="Banner 2" className="w-full h-64 md:h-80 object-cover rounded-3xl" />
                </div>
                <div className="banner-slide min-w-full custom-banner hidden" id="banner-slot-3">
                  <img src="" alt="Banner 3" className="w-full h-64 md:h-80 object-cover rounded-3xl" />
                </div>
                <div className="banner-slide min-w-full custom-banner hidden" id="banner-slot-4">
                  <img src="" alt="Banner 4" className="w-full h-64 md:h-80 object-cover rounded-3xl" />
                </div>
              </div>
            </div>
            
            {/* Navigation dots */}
            <div className="banner-dots flex justify-center space-x-2 mt-4" id="bannerDots">
              <button className="banner-dot w-3 h-3 rounded-full bg-blue-600 opacity-100" data-slide="0"></button>
            </div>
            
            {/* Navigation arrows */}
            <button className="banner-arrow banner-arrow-left absolute left-4 top-half transform translate-y-neg-half bg-white hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0" id="bannerArrowLeft">
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="banner-arrow banner-arrow-right absolute right-4 top-half transform translate-y-neg-half bg-white hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all opacity-0" id="bannerArrowRight">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>

          {/* Ferramentas Rápidas - HTML EXATO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <i className="fas fa-tools text-blue-600 mr-2"></i>
              Ferramentas para Músicos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Transpositor */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Transpositor</h3>
                    <p className="text-sm text-gray-600">Mude o tom das cifras</p>
                  </div>
                  <i className="fas fa-music text-blue-600 text-xl"></i>
                </div>
              </div>
              
              {/* Afinador */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Afinador</h3>
                    <p className="text-sm text-gray-600">Afine seu instrumento</p>
                  </div>
                  <i className="fas fa-guitar text-green-600 text-xl"></i>
                </div>
              </div>
              
              {/* Metrônomo */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-100 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Metrônomo</h3>
                    <p className="text-sm text-gray-600">Mantenha o tempo</p>
                  </div>
                  <i className="fas fa-clock text-purple-600 text-xl"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Sugestão do Dia Litúrgico - HTML EXATO */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 mb-8" id="liturgicalSuggestion">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <i className="fas fa-calendar-alt text-amber-600 mr-2"></i>
                  Sugestão Litúrgica de Hoje
                </h2>
                <p className="text-gray-700 mb-3" id="liturgicalDate">Carregando...</p>
                <div className="space-y-2" id="liturgicalSongs">
                  {/* Será preenchido via JavaScript */}
                </div>
              </div>
              <button className="text-amber-600 hover:text-amber-700 p-2">
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          {/* Grid Principal - Carrosseis - HTML EXATO */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Mais Tocadas - Carrossel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>
                  <i className="fas fa-fire text-red-500 mr-2"></i>
                  Mais Tocadas
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todas →
                </button>
              </h3>
              <div className="relative overflow-hidden rounded-lg" id="mostPlayedCarousel">
                <div className="carousel-container flex transition-transform duration-500 ease-in-out" id="mostPlayedSlides">
                  {/* Slides serão preenchidos via JavaScript */}
                </div>
                {/* Indicadores */}
                <div className="carousel-dots flex justify-center space-x-2 mt-3" id="mostPlayedDots">
                  {/* Dots serão preenchidos via JavaScript */}
                </div>
              </div>
            </div>

            {/* Novas Cifras - Carrossel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>
                  <i className="fas fa-plus-circle text-green-500 mr-2"></i>
                  Novas Cifras
                </span>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todas →
                </button>
              </h3>
              <div className="relative overflow-hidden rounded-lg" id="newSongsCarousel">
                <div className="carousel-container flex transition-transform duration-500 ease-in-out" id="newSongsSlides">
                  {/* Slides serão preenchidos via JavaScript */}
                </div>
                {/* Indicadores */}
                <div className="carousel-dots flex justify-center space-x-2 mt-3" id="newSongsDots">
                  {/* Dots serão preenchidos via JavaScript */}
                </div>
              </div>
            </div>

            {/* Por Categoria - Carrossel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>
                  <i className="fas fa-list text-blue-500 mr-2"></i>
                  Por Categoria
                </span>
                <a href="/categorias" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Ver todas →
                </a>
              </h3>
              <div className="relative overflow-hidden rounded-lg" id="categoryCarousel">
                <div className="carousel-container flex transition-transform duration-500 ease-in-out" id="categorySlides">
                  {/* Slides serão preenchidos via JavaScript */}
                </div>
                {/* Indicadores */}
                <div className="carousel-dots flex justify-center space-x-2 mt-3" id="categoryDots">
                  {/* Dots serão preenchidos via JavaScript */}
                </div>
              </div>
            </div>
          </div>

          {/* Repertórios da Comunidade - HTML EXATO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <i className="fas fa-users text-indigo-600 mr-2"></i>
                Repertórios da Comunidade
              </h2>
              <a href="/repertorios" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver todos →
              </a>
            </div>
            <div id="communityRepertoires" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Será preenchido via JavaScript */}
            </div>
          </div>

          {/* Busca Detalhada (Hidden por padrão) - HTML EXATO */}
          <div id="searchResults" className="hidden">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Resultados da Busca</h2>
            <div id="songsGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Song Cards will be populated by JavaScript */}
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default HomePage 