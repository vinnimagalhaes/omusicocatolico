/* =================================
   NAVEGAÇÃO - OMúsicoCatólico
   Sistema de Navegação Responsiva
   ================================= */

class NavigationManager {
    constructor() {
        this.mobileMenuOpen = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveNavigation();
        this.handleResize();
    }

    bindEvents() {
        // Toggle do menu mobile
        const navToggle = document.querySelector('.nav-toggle');
        const navMobileMenu = document.querySelector('.nav-mobile-menu');
        const navMobileClose = document.querySelector('.nav-mobile-close');

        if (navToggle) {
            navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        if (navMobileClose) {
            navMobileClose.addEventListener('click', () => this.closeMobileMenu());
        }

        if (navMobileMenu) {
            navMobileMenu.addEventListener('click', (e) => {
                if (e.target === navMobileMenu) {
                    this.closeMobileMenu();
                }
            });
        }

        // Dropdown mobile
        const mobileDropdowns = document.querySelectorAll('.nav-mobile-dropdown-toggle');
        mobileDropdowns.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleMobileDropdown(toggle));
        });

        // Fechar menu mobile ao clicar em links
        const mobileLinks = document.querySelectorAll('.nav-mobile-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => this.closeMobileMenu());
        });

        // Fechar menu mobile ao redimensionar tela
        window.addEventListener('resize', () => this.handleResize());

        // Fechar menu mobile com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileMenuOpen) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        const navMobileMenu = document.querySelector('.nav-mobile-menu');
        if (navMobileMenu) {
            navMobileMenu.classList.add('show');
            document.body.style.overflow = 'hidden';
            this.mobileMenuOpen = true;
        }
    }

    closeMobileMenu() {
        const navMobileMenu = document.querySelector('.nav-mobile-menu');
        if (navMobileMenu) {
            navMobileMenu.classList.remove('show');
            document.body.style.overflow = '';
            this.mobileMenuOpen = false;
        }
    }

    toggleMobileDropdown(toggle) {
        const dropdown = toggle.closest('.nav-mobile-dropdown');
        const isOpen = dropdown.classList.contains('open');
        
        // Fechar todos os outros dropdowns
        document.querySelectorAll('.nav-mobile-dropdown.open').forEach(d => {
            if (d !== dropdown) {
                d.classList.remove('open');
            }
        });

        // Toggle do dropdown atual
        dropdown.classList.toggle('open', !isOpen);
    }

    handleResize() {
        if (window.innerWidth > 1024 && this.mobileMenuOpen) {
            this.closeMobileMenu();
        }
    }

    setActiveNavigation() {
        const currentPath = window.location.pathname;
        const currentPage = this.getCurrentPage(currentPath);
        
        // Limpar todos os estados ativos
        document.querySelectorAll('.nav-link, .nav-mobile-link').forEach(link => {
            link.classList.remove('active');
        });

        // Definir navegação ativa baseada na página atual
        this.setActiveByPage(currentPage);
    }

    getCurrentPage(path) {
        if (path === '/' || path.includes('index')) return 'inicio';
        if (path.includes('favoritas')) return 'favoritas';
        if (path.includes('minhas-cifras')) return 'minhas-cifras';
        if (path.includes('categorias')) return 'categorias';
        if (path.includes('repertorios-comunidade')) return 'repertorios-comunidade';
        if (path.includes('repertorios')) return 'repertorios';
        return 'inicio';
    }

    setActiveByPage(page) {
        // Desktop navigation
        const desktopLinks = {
            'inicio': 'a[href*="inicio"], a[href="/"], a[href*="index"]',
            'repertorios': '.nav-dropdown',
            'repertorios-comunidade': '.nav-dropdown',
            'favoritas': 'a[href*="favoritas"]',
            'minhas-cifras': 'a[href*="minhas-cifras"]',
            'categorias': 'a[href*="categorias"]'
        };

        // Mobile navigation
        const mobileLinks = {
            'inicio': '.nav-mobile-link[href*="inicio"], .nav-mobile-link[href="/"], .nav-mobile-link[href*="index"]',
            'repertorios': '.nav-mobile-dropdown-toggle:has([href*="repertorios"])',
            'repertorios-comunidade': '.nav-mobile-dropdown-toggle:has([href*="repertorios"])',
            'favoritas': '.nav-mobile-link[href*="favoritas"]',
            'minhas-cifras': '.nav-mobile-link[href*="minhas-cifras"]',
            'categorias': '.nav-mobile-link[href*="categorias"]'
        };

        // Ativar link desktop
        if (desktopLinks[page]) {
            const desktopElement = document.querySelector(desktopLinks[page]);
            if (desktopElement) {
                if (page.includes('repertorios')) {
                    const navLink = desktopElement.querySelector('.nav-link');
                    if (navLink) navLink.classList.add('active');
                } else {
                    desktopElement.classList.add('active');
                }
            }
        }

        // Ativar link mobile
        if (mobileLinks[page]) {
            const mobileElement = document.querySelector(mobileLinks[page]);
            if (mobileElement) {
                mobileElement.classList.add('active');
            }
        }

        // Ativar dropdown items específicos
        if (page === 'repertorios') {
            document.querySelectorAll('a[href*="repertorios"]:not([href*="comunidade"])').forEach(link => {
                link.classList.add('active');
            });
        } else if (page === 'repertorios-comunidade') {
            document.querySelectorAll('a[href*="repertorios-comunidade"]').forEach(link => {
                link.classList.add('active');
            });
        }
    }

    // Método público para atualizar navegação ativa
    updateActiveNavigation(page) {
        this.setActiveByPage(page);
    }
}

// Utilitários de navegação
const NavigationUtils = {
    // Smooth scroll para elementos internos
    smoothScrollTo(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    // Navegação programática com feedback visual
    navigateTo(url, showLoader = true) {
        if (showLoader) {
            this.showNavigationLoader();
        }
        
        window.location.href = url;
    },

    // Mostrar loader de navegação
    showNavigationLoader() {
        const loader = document.createElement('div');
        loader.className = 'navigation-loader';
        loader.innerHTML = `
            <div class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                <div class="flex items-center gap-3">
                    <div class="loading w-6 h-6"></div>
                    <span class="text-gray-600">Carregando...</span>
                </div>
            </div>
        `;
        document.body.appendChild(loader);
    },

    // Construir breadcrumb dinâmico
    buildBreadcrumb(items) {
        const breadcrumbHtml = items.map((item, index) => {
            const isLast = index === items.length - 1;
            return `
                <li class="inline-flex items-center">
                    ${index > 0 ? '<i class="fas fa-chevron-right text-gray-400 mr-2"></i>' : ''}
                    ${!isLast && item.url ? 
                        `<a href="${item.url}" class="text-sm font-medium text-gray-700 hover:text-blue-600">${item.label}</a>` :
                        `<span class="text-sm font-medium text-gray-500">${item.label}</span>`
                    }
                </li>
            `;
        }).join('');

        return `
            <nav class="flex mb-8" aria-label="Breadcrumb">
                <ol class="inline-flex items-center space-x-1 md:space-x-3">
                    ${breadcrumbHtml}
                </ol>
            </nav>
        `;
    }
};

// Inicializar navegação quando DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Exportar para uso global
window.NavigationUtils = NavigationUtils; 