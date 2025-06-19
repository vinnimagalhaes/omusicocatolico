const axios = require('axios');
// const cheerio = require('cheerio'); // Descomentarar quando instalar
// const puppeteer = require('puppeteer-core'); // Para sites com JS dinâmico

class CifraImporterService {
    constructor() {
        // Configurações para diferentes sites
        this.siteConfigs = {
            'cifraclub.com.br': {
                name: 'Cifra Club',
                selectors: {
                    cifra: '.cifra_cnt pre, .cifra-mono pre',
                    titulo: 'h1.t1, .song-title h1',
                    artista: '.artist-title a, .artist-name',
                    tom: '#cifra_tom, .key'
                },
                requiresJS: false
            },
            'musicasparamissa.com.br': {
                name: 'Músicas para Missa',
                selectors: {
                    cifra: 'pre, .cifra-content, .letra-cifra',
                    titulo: 'h1',
                    artista: '.interprete, .artist-name',
                    tom: '.tom, .key'
                },
                requiresJS: false
            },
            'vagalume.com.br': {
                name: 'Vagalume',
                selectors: {
                    cifra: '.lyricArea pre, .chord-section',
                    titulo: 'h1.songTitle',
                    artista: '.artistTitle a',
                    tom: '.songKey'
                },
                requiresJS: false
            },
            'letras.mus.br': {
                name: 'Letras.mus.br',
                selectors: {
                    cifra: '.cnt-letra pre, .letra-acordes',
                    titulo: 'h1.song-title',
                    artista: '.artist-name',
                    tom: '.tom-original'
                },
                requiresJS: false
            },
            'superpartituras.com.br': {
                name: 'Super Partituras',
                selectors: {
                    cifra: '.partitura-content pre, .cifra-content',
                    titulo: 'h1.titulo-musica',
                    artista: '.nome-artista',
                    tom: '.tonalidade'
                },
                requiresJS: false
            }
        };
    }

    // Importar cifra de uma URL
    async importFromUrl(url, userId = null) {
        try {
            console.log(`🔗 Importando cifra de: ${url}`);
            
            // Identificar site
            const siteConfig = this.identifySite(url);
            if (!siteConfig) {
                throw new Error('Site não suportado para importação');
            }

            console.log(`📱 Site identificado: ${siteConfig.name}`);

            // Fazer scraping da página
            const pageData = await this.scrapePage(url, siteConfig);
            
            // Processar e limpar dados
            const cifraData = this.processCifraData(pageData, url);
            
            // Validar dados essenciais
            if (!cifraData.letra || cifraData.letra.trim().length < 50) {
                throw new Error('Não foi possível extrair o conteúdo da cifra');
            }

            console.log(`✅ Cifra importada: "${cifraData.titulo}" - ${cifraData.artista}`);
            
            return {
                success: true,
                data: cifraData,
                source: siteConfig.name,
                originalUrl: url
            };

        } catch (error) {
            console.error('❌ Erro ao importar cifra:', error);
            return {
                success: false,
                error: error.message,
                originalUrl: url
            };
        }
    }

    // Identificar qual site está sendo acessado
    identifySite(url) {
        const hostname = new URL(url).hostname.toLowerCase();
        
        for (const [domain, config] of Object.entries(this.siteConfigs)) {
            if (hostname.includes(domain)) {
                return { domain, ...config };
            }
        }
        
        return null;
    }

    // Fazer scraping da página
    async scrapePage(url, siteConfig) {
        try {
            // Por enquanto usar axios simples (para sites sem JS)
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.8,en;q=0.6',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000
            });

            const html = response.data;
            console.log(`📄 HTML obtido (${html.length} caracteres)`);

            // Parsear com regex por enquanto (depois usar cheerio)
            return this.parseHtmlWithRegex(html, siteConfig);

        } catch (error) {
            console.error('❌ Erro no scraping:', error.message);
            throw new Error(`Erro ao acessar a página: ${error.message}`);
        }
    }

    // Parser HTML básico com regex (versão melhorada para CifraClub)
    parseHtmlWithRegex(html, siteConfig) {
        const result = {};

        try {
            // === TITULO ESPECÍFICO POR SITE ===
            // Detectar qual site estamos processando
            const hostname = siteConfig.domain || '';
            
            if (hostname.includes('musicasparamissa.com.br')) {
                // Padrões específicos para Músicas para Missa
                const musicasParaMissaTitlePatterns = [
                    /<h1[^>]*>([^<]+)<\/h1>/i,
                    /<title>([^|<-]+)/i
                ];
                
                for (const pattern of musicasParaMissaTitlePatterns) {
                    const match = html.match(pattern);
                    if (match) {
                        result.titulo = this.cleanText(match[1]);
                        console.log(`🎵 Título encontrado (Músicas para Missa): "${result.titulo}"`);
                        break;
                    }
                }
            } else {
                // Padrões para CifraClub e outros sites
                const cifraClubTitlePatterns = [
                    /<h1[^>]*class[^>]*t1[^>]*>([^<]+)<\/h1>/i,
                    /<h1[^>]*>([^<]+)<\/h1>/i,
                    /<title>([^|<]+)/i  // Fallback para title tag
                ];
                
                for (const pattern of cifraClubTitlePatterns) {
                    const match = html.match(pattern);
                    if (match) {
                        result.titulo = this.cleanText(match[1]);
                        console.log(`🎵 Título encontrado: "${result.titulo}"`);
                        break;
                    }
                }
            }

            // === ARTISTA ESPECÍFICO POR SITE ===
            if (hostname.includes('musicasparamissa.com.br')) {
                // Padrões específicos para Músicas para Missa
                const musicasParaMissaArtistPatterns = [
                    /INTÉRPRETE:\s*([^<\n]+)/i,
                    /Intérprete:\s*([^<\n]+)/i,
                    /<strong>INTÉRPRETE:<\/strong>\s*([^<\n]+)/i,
                    /<b>INTÉRPRETE:<\/b>\s*([^<\n]+)/i
                ];
                
                for (const pattern of musicasParaMissaArtistPatterns) {
                    const match = html.match(pattern);
                    if (match) {
                        result.artista = this.cleanText(match[1]);
                        console.log(`🎤 Artista encontrado (Músicas para Missa): "${result.artista}"`);
                        break;
                    }
                }
            } else {
                // Padrões para CifraClub e outros sites
                const cifraClubArtistPatterns = [
                    /<h2[^>]*class[^>]*t3[^>]*><a[^>]*>([^<]+)<\/a><\/h2>/i,
                    /<h2[^>]*><a[^>]*>([^<]+)<\/a><\/h2>/i,
                    /<span[^>]*class[^>]*artist[^>]*>([^<]+)<\/span>/i,
                    /<p[^>]*class[^>]*artist[^>]*>([^<]+)<\/p>/i
                ];
                
                for (const pattern of cifraClubArtistPatterns) {
                    const match = html.match(pattern);
                    if (match) {
                        result.artista = this.cleanText(match[1]);
                        console.log(`🎤 Artista encontrado: "${result.artista}"`);
                        break;
                    }
                }
            }

            // === FALLBACK PARA OUTROS SITES ===
            // Extrair título genérico se não encontrou específico do CifraClub
            if (!result.titulo) {
                const titleRegex = /<h1[^>]*>([^<]+)<\/h1>/i;
                const titleMatch = html.match(titleRegex);
                if (titleMatch) {
                    result.titulo = this.cleanText(titleMatch[1]);
                }
            }

            // Extrair artista genérico se não encontrou específico do CifraClub
            if (!result.artista) {
                const artistRegex = /<h2[^>]*>([^<]+)<\/h2>/i;
                const artistMatch = html.match(artistRegex);
                if (artistMatch) {
                    result.artista = this.cleanText(artistMatch[1]);
                }
            }

            // === EXTRAIR CIFRA ===
            if (hostname.includes('musicasparamissa.com.br')) {
                // Extração específica para Músicas para Missa
                const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
                const preMatches = html.match(preRegex);
                
                if (preMatches && preMatches.length > 0) {
                    // Para o Músicas para Missa, pegar o <pre> mais longo
                    let longestPre = '';
                    preMatches.forEach(match => {
                        // Extrair conteúdo preservando espaçamento
                        let content = match.replace(/<pre[^>]*>/, '').replace(/<\/pre>/, '');
                        // Converter <br> para quebras de linha
                        content = content.replace(/<br\s*\/?>/gi, '\n');
                        // Converter &nbsp; para espaços
                        content = content.replace(/&nbsp;/g, ' ');
                        // Remover outras tags HTML
                        content = content.replace(/<[^>]*>/g, '');
                        // Decodificar entidades HTML
                        content = content.replace(/&amp;/g, '&')
                                        .replace(/&lt;/g, '<')
                                        .replace(/&gt;/g, '>')
                                        .replace(/&quot;/g, '"')
                                        .replace(/&#39;/g, "'");
                        
                        if (content.length > longestPre.length) {
                            longestPre = content;
                        }
                    });
                    result.cifra = longestPre;
                    console.log(`🎼 Cifra encontrada (Músicas para Missa - ${longestPre.length} caracteres)`);
                }
            } else {
                // Extração para outros sites (CifraClub, etc.)
                const preRegex = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
                const preMatches = html.match(preRegex);
                
                if (preMatches && preMatches.length > 0) {
                    // Pegar o <pre> mais longo (provavelmente a cifra)
                    let longestPre = '';
                    preMatches.forEach(match => {
                        const content = match.replace(/<[^>]*>/g, '').trim();
                        if (content.length > longestPre.length) {
                            longestPre = content;
                        }
                    });
                    result.cifra = longestPre;
                    console.log(`🎼 Cifra encontrada (${longestPre.length} caracteres)`);
                }
            }

            // === EXTRAIR TOM ===
            const tomRegex = /Tom:\s*<[^>]*>([A-G][#b]?m?)/i;
            const tomMatch = html.match(tomRegex);
            if (tomMatch) {
                result.tom = tomMatch[1];
                console.log(`🎵 Tom encontrado: ${result.tom}`);
            }

            // Procurar por outras indicações de cifra se não encontrou em <pre>
            if (!result.cifra) {
                console.log('⚠️  Cifra não encontrada em <pre>, tentando método alternativo...');
                
                // Procurar por texto com acordes (letras maiúsculas em negrito)
                const chordTextRegex = /<b[^>]*>([A-G][#b]?[^<]*)<\/b>/gi;
                const chordMatches = html.match(chordTextRegex);
                
                if (chordMatches && chordMatches.length > 5) {
                    // Se tem muitos acordes, tentar extrair seção completa
                    const sectionStart = html.indexOf(chordMatches[0]);
                    const sectionEnd = html.indexOf('</div>', sectionStart);
                    
                    if (sectionEnd > sectionStart) {
                        const section = html.substring(sectionStart, sectionEnd);
                        result.cifra = this.cleanHtmlTags(section);
                        console.log(`🎼 Cifra extraída por método alternativo (${result.cifra.length} caracteres)`);
                    }
                }
            }

            // Debug: verificar se encontrou dados essenciais
            if (!result.titulo) {
                console.log('⚠️  Título não encontrado! Verificando patterns disponíveis...');
                const h1Tags = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
                if (h1Tags) {
                    console.log('H1 tags encontradas:', h1Tags.slice(0, 3));
                }
            }
            
            if (!result.artista) {
                console.log('⚠️  Artista não encontrado! Verificando patterns disponíveis...');
                const h2Tags = html.match(/<h2[^>]*>.*?<\/h2>/gi);
                if (h2Tags) {
                    console.log('H2 tags encontradas:', h2Tags.slice(0, 3));
                }
            }

            console.log(`📋 Resultado final: Título="${result.titulo}", Artista="${result.artista}", Tom="${result.tom}"`);
            return result;

        } catch (error) {
            console.error('❌ Erro no parsing:', error);
            return { cifra: null, titulo: null, artista: null, tom: null };
        }
    }

    // Processar dados extraídos
    processCifraData(pageData, originalUrl) {
        // Limpar e formatar cifra
        let letra = pageData.cifra || '';
        letra = this.cleanAndFormatCifra(letra);

        // Extrair metadados adicionais da própria cifra se não foi encontrado no HTML
        const extractedInfo = this.extractInfoFromCifra(letra);

        return {
            titulo: pageData.titulo || extractedInfo.titulo || 'Música Importada',
            artista: pageData.artista || extractedInfo.artista || 'Artista Desconhecido',
            tom: pageData.tom || extractedInfo.tom || 'C',
            letra: letra,
            categoria: this.detectCategory(letra),
            fonte: 'link_importado',
            url_original: originalUrl,
            tags: this.generateTags(letra, pageData.titulo, pageData.artista)
        };
    }

    // Limpar e formatar cifra
    cleanAndFormatCifra(text) {
        if (!text) return '';

        return text
            // Remover HTML residual
            .replace(/<[^>]*>/g, '')
            // Decodificar entidades HTML
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            // Normalizar quebras de linha
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            // Remover linhas vazias excessivas
            .replace(/\n{3,}/g, '\n\n');
    }

    // Extrair informações da própria cifra
    extractInfoFromCifra(text) {
        const lines = text.split('\n').slice(0, 5); // Primeiras 5 linhas
        let titulo = '';
        let artista = '';
        let tom = 'C';

        for (const line of lines) {
            // Procurar padrão "Título - Artista"
            const titleArtistMatch = line.match(/^(.+)\s*-\s*(.+)$/);
            if (titleArtistMatch && !this.hasChords(line)) {
                titulo = titleArtistMatch[1].trim();
                artista = titleArtistMatch[2].trim();
            }

            // Procurar tom
            const tomMatch = line.match(/Tom[:\s]*([A-G][#b]?m?)/i);
            if (tomMatch) {
                tom = tomMatch[1];
            }
        }

        // Detectar tom do primeiro acorde se não encontrou
        if (tom === 'C') {
            const chordMatch = text.match(/\b([A-G][#b]?m?)\b/);
            if (chordMatch) {
                tom = chordMatch[1];
            }
        }

        return { titulo, artista, tom };
    }

    // Verificar se linha contém acordes
    hasChords(line) {
        const chordPattern = /\b[A-G][#b]?m?\b/g;
        const matches = line.match(chordPattern);
        return matches && matches.length >= 2;
    }

    // Detectar categoria da música
    detectCategory(text) {
        const religiousWords = ['jesus', 'cristo', 'deus', 'senhor', 'santo', 'sagrado', 'aleluia', 'amém'];
        const lowerText = text.toLowerCase();
        
        const religiousCount = religiousWords.filter(word => lowerText.includes(word)).length;
        
        if (religiousCount >= 2) {
            return 'religiosa';
        }
        
        return 'geral';
    }

    // Gerar tags automáticas
    generateTags(letra, titulo, artista) {
        const tags = ['importada'];
        
        if (titulo) tags.push('cifra');
        if (this.detectCategory(letra) === 'religiosa') tags.push('religiosa');
        
        return tags.join(',');
    }

    // Limpar texto (preservando acentos e caracteres especiais)
    cleanText(text) {
        return text
            .replace(/[<>]/g, '')  // Remover apenas < > perigosos
    }

    // Limpar tags HTML
    cleanHtmlTags(html) {
        return html
            .replace(/<br\s*\/?/gi, '\n')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\n\s+/g, '\n');
    }
}

module.exports = new CifraImporterService(); 