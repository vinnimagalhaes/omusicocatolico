// Performance Optimization Script para OMúsicoCatólico
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOptimizations());
        } else {
            this.setupOptimizations();
        }
    }

    setupOptimizations() {
        this.setupLazyLoading();
        this.setupPreloading();
        this.setupCriticalResourceHints();
        this.setupIntersectionObserver();
        this.setupPerformanceMonitoring();
        this.optimizeImages();
        this.setupServiceWorker();
    }

    // Lazy Loading de imagens e conteúdo
    setupLazyLoading() {
        // Lazy loading nativo para imagens
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        // Fallback para navegadores sem suporte
        if ('loading' in HTMLImageElement.prototype) {
            images.forEach(img => {
                if (!img.src && img.dataset.src) {
                    img.src = img.dataset.src;
                }
            });
        } else {
            // Polyfill com Intersection Observer
            this.lazyLoadImages();
        }

        // Lazy loading de componentes pesados
        this.lazyLoadComponents();
    }

    lazyLoadImages() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        img.removeAttribute('data-src');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    lazyLoadComponents() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    const componentType = component.dataset.component;
                    
                    switch (componentType) {
                        case 'cifra-player':
                            this.loadCifraPlayer(component);
                            break;
                        case 'repertorio-grid':
                            this.loadRepertorioGrid(component);
                            break;
                        case 'comments-section':
                            this.loadCommentsSection(component);
                            break;
                    }
                    
                    componentObserver.unobserve(component);
                }
            });
        }, { rootMargin: '100px' });

        document.querySelectorAll('[data-component]').forEach(component => {
            componentObserver.observe(component);
        });
    }

    // Preloading inteligente
    setupPreloading() {
        // Preload de páginas prováveis
        this.preloadLikelyPages();
        
        // Preload de recursos críticos
        this.preloadCriticalResources();
        
        // Preload on hover
        this.setupHoverPreload();
    }

    preloadLikelyPages() {
        const currentPage = window.location.pathname;
        const likelyPages = this.getLikelyNextPages(currentPage);
        
        likelyPages.forEach(page => {
            this.preloadPage(page);
        });
    }

    getLikelyNextPages(currentPage) {
        const pageMap = {
            '/inicio': ['/favoritas', '/minhas-cifras', '/categorias'],
            '/favoritas': ['/inicio', '/minhas-cifras'],
            '/minhas-cifras': ['/inicio', '/favoritas'],
            '/categorias': ['/inicio', '/favoritas'],
            '/repertorios': ['/repertorios-comunidade', '/minhas-cifras'],
            '/repertorios-comunidade': ['/repertorios', '/favoritas']
        };
        
        return pageMap[currentPage] || ['/inicio'];
    }

    preloadPage(url) {
        // Preload apenas se não estiver em conexão lenta
        if (this.isSlowConnection()) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    preloadCriticalResources() {
        const criticalResources = [
            '/css/components.css',
            '/js/navigation.js',
            '/js/app.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }

    setupHoverPreload() {
        let hoverTimer;
        
        document.addEventListener('mouseover', (e) => {
            const link = e.target.closest('a[href]');
            if (!link || link.dataset.preloaded) return;
            
            hoverTimer = setTimeout(() => {
                this.preloadPage(link.href);
                link.dataset.preloaded = 'true';
            }, 100);
        });
        
        document.addEventListener('mouseout', () => {
            clearTimeout(hoverTimer);
        });
    }

    // Resource hints
    setupCriticalResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'dns-prefetch', href: '//cdn.jsdelivr.net' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.assign(link, hint);
            document.head.appendChild(link);
        });
    }

    // Intersection Observer para animações
    setupIntersectionObserver() {
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => {
            animationObserver.observe(el);
        });
    }

    // Monitoramento de performance
    setupPerformanceMonitoring() {
        // Web Vitals
        this.measureWebVitals();
        
        // Performance Observer
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
        
        // Monitoramento de recursos
        this.monitorResourceLoading();
    }

    measureWebVitals() {
        // Largest Contentful Paint
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            console.log('FID:', firstInput.processingStart - firstInput.startTime);
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }

    setupPerformanceObserver() {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === 'navigation') {
                    console.log('Navigation timing:', {
                        domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                        loadComplete: entry.loadEventEnd - entry.loadEventStart
                    });
                }
            });
        });
        
        observer.observe({ entryTypes: ['navigation', 'resource'] });
    }

    monitorResourceLoading() {
        window.addEventListener('load', () => {
            const resources = performance.getEntriesByType('resource');
            const slowResources = resources.filter(resource => resource.duration > 1000);
            
            if (slowResources.length > 0) {
                console.warn('Recursos lentos detectados:', slowResources);
            }
        });
    }

    // Otimização de imagens
    optimizeImages() {
        // Converte imagens para WebP quando suportado
        if (this.supportsWebP()) {
            this.convertToWebP();
        }
        
        // Redimensiona imagens baseado no viewport
        this.setupResponsiveImages();
    }

    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }

    convertToWebP() {
        document.querySelectorAll('img[data-webp]').forEach(img => {
            if (img.dataset.webp) {
                img.src = img.dataset.webp;
            }
        });
    }

    setupResponsiveImages() {
        const images = document.querySelectorAll('img[data-sizes]');
        
        images.forEach(img => {
            const sizes = JSON.parse(img.dataset.sizes);
            const currentWidth = img.offsetWidth;
            
            // Encontra o tamanho mais apropriado
            const appropriateSize = sizes.find(size => size.width >= currentWidth) || sizes[sizes.length - 1];
            
            if (appropriateSize && img.src !== appropriateSize.src) {
                img.src = appropriateSize.src;
            }
        });
    }

    // Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registrado:', registration.scope);
                        
                        // Verifica atualizações
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.log('Erro no SW:', error);
                    });
            });
        }
    }

    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <span>Nova versão disponível!</span>
                <button onclick="window.location.reload()">Atualizar</button>
            </div>
        `;
        document.body.appendChild(notification);
    }

    // Utilitários
    isSlowConnection() {
        return navigator.connection && 
               (navigator.connection.effectiveType === 'slow-2g' || 
                navigator.connection.effectiveType === '2g');
    }

    // Carregamento de componentes específicos
    loadCifraPlayer(element) {
        // Carrega player de cifra sob demanda
        import('./cifra-player.js').then(module => {
            new module.CifraPlayer(element);
        });
    }

    loadRepertorioGrid(element) {
        // Carrega grid de repertórios sob demanda
        import('./repertorio-grid.js').then(module => {
            new module.RepertorioGrid(element);
        });
    }

    loadCommentsSection(element) {
        // Carrega seção de comentários sob demanda
        import('./comments.js').then(module => {
            new module.CommentsSection(element);
        });
    }
}

// Inicializa otimizador
new PerformanceOptimizer();

// Exporta para uso global
window.PerformanceOptimizer = PerformanceOptimizer; 