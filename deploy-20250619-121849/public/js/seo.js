// SEO Manager para OMúsicoCatólico
class SEOManager {
    constructor() {
        this.baseUrl = 'https://omusicocatolico.com.br';
        this.siteName = 'OMúsicoCatólico';
        this.defaultImage = '/images/og-default.jpg';
        this.init();
    }

    init() {
        this.setupPageSEO();
        this.setupStructuredData();
        this.setupBreadcrumbs();
        this.setupCanonicalUrls();
        this.setupSocialMeta();
        this.setupAnalytics();
    }

    // Configurações SEO por página
    getPageSEOConfig() {
        const path = window.location.pathname;
        
        const configs = {
            '/': {
                title: 'OMúsicoCatólico - Cifras Católicas, Repertórios e Ferramentas para Liturgia',
                description: 'A maior plataforma de cifras católicas do Brasil. Encontre acordes, crie repertórios personalizados e compartilhe música sacra com sua comunidade.',
                keywords: 'cifras católicas, música católica, repertório missa, letras católicas, acordes, igreja, liturgia, canto católico, hinário',
                type: 'website',
                image: '/images/og-home.jpg'
            },
            '/inicio': {
                title: 'Início - OMúsicoCatólico | Cifras e Repertórios Católicos',
                description: 'Página inicial do OMúsicoCatólico. Acesse suas cifras favoritas, crie repertórios e descubra novas músicas católicas.',
                keywords: 'início, dashboard, cifras católicas, repertórios, música sacra',
                type: 'website',
                image: '/images/og-dashboard.jpg'
            },
            '/favoritas': {
                title: 'Minhas Favoritas - OMúsicoCatólico | Cifras Católicas Salvas',
                description: 'Acesse suas cifras católicas favoritas salvas. Organize e gerencie sua coleção pessoal de músicas sacras.',
                keywords: 'favoritas, cifras salvas, música católica, coleção pessoal, repertório',
                type: 'website',
                image: '/images/og-favoritas.jpg'
            },
            '/minhas-cifras': {
                title: 'Minhas Cifras - OMúsicoCatólico | Cifras Católicas Pessoais',
                description: 'Gerencie suas cifras católicas pessoais. Crie, edite e organize suas próprias transcrições musicais.',
                keywords: 'minhas cifras, cifras pessoais, criar cifra, editar cifra, música católica',
                type: 'website',
                image: '/images/og-minhas-cifras.jpg'
            },
            '/categorias': {
                title: 'Categorias - OMúsicoCatólico | Cifras por Categoria Litúrgica',
                description: 'Explore cifras católicas organizadas por categorias: Entrada, Ofertório, Comunhão, Saída e mais. Encontre a música perfeita para cada momento da liturgia.',
                keywords: 'categorias, liturgia, entrada, ofertório, comunhão, saída, música litúrgica, missa',
                type: 'website',
                image: '/images/og-categorias.jpg'
            },
            '/repertorios': {
                title: 'Meus Repertórios - OMúsicoCatólico | Organize suas Celebrações',
                description: 'Crie e gerencie repertórios personalizados para missas e celebrações. Organize suas cifras por evento e compartilhe com sua equipe.',
                keywords: 'repertórios, missa, celebração, organizar cifras, equipe musical, liturgia',
                type: 'website',
                image: '/images/og-repertorios.jpg'
            },
            '/repertorios-comunidade': {
                title: 'Repertórios da Comunidade - OMúsicoCatólico | Compartilhe e Descubra',
                description: 'Descubra repertórios criados pela comunidade católica. Compartilhe seus repertórios e inspire outros músicos.',
                keywords: 'repertórios comunidade, compartilhar, descobrir, comunidade católica, inspiração musical',
                type: 'website',
                image: '/images/og-comunidade.jpg'
            }
        };

        return configs[path] || configs['/'];
    }

    // Configurar SEO da página atual
    setupPageSEO() {
        const config = this.getPageSEOConfig();
        
        // Title
        document.title = config.title;
        
        // Meta description
        this.updateMetaTag('name', 'description', config.description);
        
        // Meta keywords
        this.updateMetaTag('name', 'keywords', config.keywords);
        
        // Robots
        this.updateMetaTag('name', 'robots', 'index, follow');
        
        // Author
        this.updateMetaTag('name', 'author', 'OMúsicoCatólico');
        
        // Theme color
        this.updateMetaTag('name', 'theme-color', '#3B82F6');
        
        // Canonical URL
        this.updateCanonicalUrl();
    }

    // Configurar meta tags sociais
    setupSocialMeta() {
        const config = this.getPageSEOConfig();
        const currentUrl = `${this.baseUrl}${window.location.pathname}`;
        
        // Open Graph
        this.updateMetaTag('property', 'og:type', config.type);
        this.updateMetaTag('property', 'og:title', config.title);
        this.updateMetaTag('property', 'og:description', config.description);
        this.updateMetaTag('property', 'og:url', currentUrl);
        this.updateMetaTag('property', 'og:site_name', this.siteName);
        this.updateMetaTag('property', 'og:image', `${this.baseUrl}${config.image}`);
        this.updateMetaTag('property', 'og:image:width', '1200');
        this.updateMetaTag('property', 'og:image:height', '630');
        this.updateMetaTag('property', 'og:locale', 'pt_BR');
        
        // Twitter Card
        this.updateMetaTag('name', 'twitter:card', 'summary_large_image');
        this.updateMetaTag('name', 'twitter:title', config.title);
        this.updateMetaTag('name', 'twitter:description', config.description);
        this.updateMetaTag('name', 'twitter:image', `${this.baseUrl}${config.image}`);
        this.updateMetaTag('name', 'twitter:site', '@omusicocatolico');
        
        // Facebook
        this.updateMetaTag('property', 'fb:app_id', '123456789'); // Substituir pelo ID real
    }

    // Configurar dados estruturados
    setupStructuredData() {
        const path = window.location.pathname;
        let structuredData = {};

        // Dados base da organização
        const organization = {
            "@type": "Organization",
            "name": "OMúsicoCatólico",
            "url": this.baseUrl,
            "logo": `${this.baseUrl}/images/logo.png`,
            "description": "Plataforma de cifras católicas, repertórios e ferramentas para músicos da igreja",
            "sameAs": [
                "https://facebook.com/omusicocatolico",
                "https://instagram.com/omusicocatolico",
                "https://youtube.com/omusicocatolico"
            ]
        };

        // Website base
        const website = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "OMúsicoCatólico",
            "url": this.baseUrl,
            "description": "Plataforma de cifras católicas, repertórios e ferramentas para músicos da igreja",
            "potentialAction": {
                "@type": "SearchAction",
                "target": `${this.baseUrl}/buscar?q={search_term_string}`,
                "query-input": "required name=search_term_string"
            },
            "publisher": organization
        };

        // Dados específicos por página
        switch (path) {
            case '/':
            case '/inicio':
                structuredData = website;
                break;
                
            case '/categorias':
                structuredData = {
                    "@context": "https://schema.org",
                    "@type": "CollectionPage",
                    "name": "Categorias de Cifras Católicas",
                    "description": "Cifras católicas organizadas por categorias litúrgicas",
                    "url": `${this.baseUrl}/categorias`,
                    "mainEntity": {
                        "@type": "ItemList",
                        "name": "Categorias Litúrgicas",
                        "itemListElement": [
                            { "@type": "ListItem", "position": 1, "name": "Entrada" },
                            { "@type": "ListItem", "position": 2, "name": "Ofertório" },
                            { "@type": "ListItem", "position": 3, "name": "Comunhão" },
                            { "@type": "ListItem", "position": 4, "name": "Saída" }
                        ]
                    }
                };
                break;
                
            case '/repertorios':
                structuredData = {
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "Criador de Repertórios",
                    "description": "Ferramenta para criar e gerenciar repertórios de música católica",
                    "url": `${this.baseUrl}/repertorios`,
                    "applicationCategory": "MusicApplication",
                    "operatingSystem": "Web Browser"
                };
                break;
        }

        this.injectStructuredData(structuredData);
    }

    // Configurar breadcrumbs
    setupBreadcrumbs() {
        const path = window.location.pathname;
        const breadcrumbs = this.generateBreadcrumbs(path);
        
        if (breadcrumbs.length > 1) {
            const breadcrumbData = {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": breadcrumbs.map((crumb, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": crumb.name,
                    "item": `${this.baseUrl}${crumb.url}`
                }))
            };
            
            this.injectStructuredData(breadcrumbData, 'breadcrumbs');
        }
    }

    generateBreadcrumbs(path) {
        const breadcrumbMap = {
            '/': [{ name: 'Início', url: '/' }],
            '/inicio': [{ name: 'Início', url: '/inicio' }],
            '/favoritas': [
                { name: 'Início', url: '/inicio' },
                { name: 'Favoritas', url: '/favoritas' }
            ],
            '/minhas-cifras': [
                { name: 'Início', url: '/inicio' },
                { name: 'Minhas Cifras', url: '/minhas-cifras' }
            ],
            '/categorias': [
                { name: 'Início', url: '/inicio' },
                { name: 'Categorias', url: '/categorias' }
            ],
            '/repertorios': [
                { name: 'Início', url: '/inicio' },
                { name: 'Repertórios', url: '/repertorios' }
            ],
            '/repertorios-comunidade': [
                { name: 'Início', url: '/inicio' },
                { name: 'Repertórios', url: '/repertorios' },
                { name: 'Comunidade', url: '/repertorios-comunidade' }
            ]
        };
        
        return breadcrumbMap[path] || [{ name: 'Início', url: '/inicio' }];
    }

    // Configurar URLs canônicas
    setupCanonicalUrls() {
        this.updateCanonicalUrl();
    }

    updateCanonicalUrl() {
        const currentUrl = `${this.baseUrl}${window.location.pathname}`;
        
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.href = currentUrl;
    }

    // Configurar analytics
    setupAnalytics() {
        // Google Analytics 4
        this.setupGA4();
        
        // Google Search Console
        this.setupSearchConsole();
        
        // Facebook Pixel (se necessário)
        // this.setupFacebookPixel();
    }

    setupGA4() {
        // Implementar Google Analytics 4
        const script1 = document.createElement('script');
        script1.async = true;
        script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'; // Substituir pelo ID real
        document.head.appendChild(script1);
        
        const script2 = document.createElement('script');
        script2.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX'); // Substituir pelo ID real
        `;
        document.head.appendChild(script2);
    }

    setupSearchConsole() {
        // Meta tag para Google Search Console
        this.updateMetaTag('name', 'google-site-verification', 'XXXXXXXXXX'); // Substituir pelo código real
    }

    // Utilitários
    updateMetaTag(attribute, name, content) {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.content = content;
    }

    injectStructuredData(data, id = 'structured-data') {
        // Remove dados estruturados existentes
        const existing = document.getElementById(id);
        if (existing) {
            existing.remove();
        }
        
        // Adiciona novos dados estruturados
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = id;
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
    }

    // Métodos para atualização dinâmica
    updatePageSEO(title, description, keywords, image) {
        document.title = title;
        this.updateMetaTag('name', 'description', description);
        this.updateMetaTag('name', 'keywords', keywords);
        
        // Atualizar Open Graph
        this.updateMetaTag('property', 'og:title', title);
        this.updateMetaTag('property', 'og:description', description);
        if (image) {
            this.updateMetaTag('property', 'og:image', `${this.baseUrl}${image}`);
        }
        
        // Atualizar Twitter Card
        this.updateMetaTag('name', 'twitter:title', title);
        this.updateMetaTag('name', 'twitter:description', description);
        if (image) {
            this.updateMetaTag('name', 'twitter:image', `${this.baseUrl}${image}`);
        }
    }

    // Tracking de eventos
    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }

    // Sitemap dinâmico (para implementação futura)
    generateSitemap() {
        const pages = [
            { url: '/', priority: 1.0, changefreq: 'daily' },
            { url: '/inicio', priority: 1.0, changefreq: 'daily' },
            { url: '/favoritas', priority: 0.8, changefreq: 'weekly' },
            { url: '/minhas-cifras', priority: 0.8, changefreq: 'weekly' },
            { url: '/categorias', priority: 0.9, changefreq: 'weekly' },
            { url: '/repertorios', priority: 0.8, changefreq: 'weekly' },
            { url: '/repertorios-comunidade', priority: 0.7, changefreq: 'weekly' }
        ];
        
        return pages;
    }
}

// Inicializar SEO Manager
const seoManager = new SEOManager();

// Exportar para uso global
window.SEOManager = SEOManager;
window.seoManager = seoManager; 