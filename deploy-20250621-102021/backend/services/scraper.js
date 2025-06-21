const axios = require('axios');
const cheerio = require('cheerio');

// Serviço de Web Scraping para cifras
class CifraScraper {
    constructor() {
        this.timeout = 10000; // 10 segundos
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }

    // Detectar origem da URL
    detectSource(url) {
        if (url.includes('cifraclub.com.br')) return 'cifraclub';
        if (url.includes('musicasparamissa.com.br')) return 'musicasparamissa';
        if (url.includes('ultimate-guitar.com')) return 'ultimate-guitar';
        if (url.includes('songsterr.com')) return 'songsterr';
        if (url.includes('vagalume.com.br')) return 'vagalume';
        return 'unknown';
    }

    // Scraper principal
    async scrapeCifra(url) {
        try {
            console.log(`🔍 Detectando fonte para URL: ${url}`);
            const source = this.detectSource(url);
            console.log(`📱 Fonte detectada: ${source}`);
            
            switch (source) {
                case 'cifraclub':
                    console.log('🎵 Redirecionando para CifraClub scraper');
                    return await this.scrapeCifraClub(url);
                case 'musicasparamissa':
                    console.log('🎵 Redirecionando para Músicas para Missa scraper');
                    return await this.scrapeMusicasParaMissa(url);
                case 'ultimate-guitar':
                    console.log('🎵 Redirecionando para Ultimate Guitar scraper');
                    return await this.scrapeUltimateGuitar(url);
                case 'vagalume':
                    console.log('🎵 Redirecionando para Vagalume scraper');
                    return await this.scrapeVagalume(url);
                default:
                    console.log('🎵 Redirecionando para scraper genérico');
                    return await this.scrapeGeneric(url);
            }
        } catch (error) {
            console.error('❌ Erro no scraping:', error);
            console.error('❌ Stack trace:', error.stack);
            throw new Error('Não foi possível extrair dados da URL fornecida');
        }
    }

    // Scraper específico para Cifra Club (VERSÃO DIRETA)
    async scrapeCifraClub(url) {
        try {
            console.log(`🎵 Iniciando scraper CifraClub para: ${url}`);
            
            // Fazer requisição direta (sem proxy, pois estamos no backend)
            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: { 
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            const $ = cheerio.load(response.data);
            
            console.log('✅ HTML carregado com sucesso');
            
            // Extrair dados básicos
            const titulo = $('h1').first().text().trim() || 
                          $('title').text().split('-')[0].trim() ||
                          'Título não encontrado';
            
            const artista = $('h2').first().text().trim() || 
                           $('h2 a').first().text().trim() ||
                           'Artista não encontrado';

            console.log(`📝 Título: ${titulo}`);
            console.log(`🎤 Artista: ${artista}`);

            // Extrair tom
            let tom = 'C';
            const tomElement = $('[data-cifra]').first();
            if (tomElement.length > 0) {
                tom = tomElement.attr('data-cifra') || 'C';
            }

            // ESTRATÉGIA MELHORADA: Extrair cifra com acordes e letras preservando espaçamento
            let letra = '';
            
            // 1. Procurar pelo container principal da cifra no CifraClub
            const cifraSelectors = [
                '.cifra_cnt pre',           // SELETOR CORRETO: bloco principal da cifra
                'pre',                    // Fallbacks
                '.cifra-texto',
                '.letra-cifra',
                '[data-cifra-content]',
                '.js-lyric'
            ];
            
            for (const selector of cifraSelectors) {
                const element = $(selector).first();
                if (element.length > 0) {
                    // Extrair HTML bruto do <pre>
                    let html = element.html() || '';
                    // Preservar quebras de linha e espaços
                    html = html.replace(/<br\s*\/?>(?!\n)/gi, '\n');
                    html = html.replace(/&nbsp;/g, ' ');
                    // Remover tags HTML, mas NÃO mexer nos espaços
                    let cifra = html.replace(/<[^>]+>/g, '');
                    // NÃO usar .trim() nem .replace(/\s+$/gm, '')
                    letra = cifra;
                    break;
                }
            }
            
            // 2. Se não encontrou, tentar extrair do texto da página
            if (!letra || letra.length < 50) {
                console.log('⚠️ Tentando extrair do texto da página...');
                
                // Procurar por seções que contenham acordes
                const bodyText = $('body').text();
                const lines = bodyText.split('\n');
                
                let cifraLines = [];
                let foundChords = false;
                let inCifraSection = false;
                
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    
                    // Detectar início de seção de cifra
                    if (line.includes('tom:') || line.includes('[Intro]') || line.includes('[Primeira Parte]')) {
                        inCifraSection = true;
                        continue;
                    }
                    
                    // Se estamos na seção de cifra
                    if (inCifraSection) {
                        // Detectar linhas com acordes
                        if (/\b[A-G](#|b)?(m|maj|min|dim|aug|sus|add|°)?([0-9]+[Mm]?|[0-9]*)?(\([^)]*\))?([/][A-G](#|b)?)?\b/.test(line)) {
                            foundChords = true;
                            cifraLines.push(line);
                        } else if (foundChords && line.length > 0 && !line.includes('Cifra Club') && !line.includes('©')) {
                            // Linha de letra
                            cifraLines.push(line);
                        } else if (line.length === 0) {
                            // Linha vazia - manter estrutura
                            cifraLines.push('');
                        }
                        
                        // Parar se chegou ao fim da cifra
                        if (line.includes('Composição') || line.includes('exibições') || cifraLines.length > 100) {
                            break;
                        }
                    }
                }
                
                if (cifraLines.length > 0) {
                    letra = cifraLines.join('\n');
                    console.log('✅ Cifra extraída do texto da página');
                }
            }

            // 3. Limpeza final preservando espaçamento essencial
            if (letra && letra.length > 10) {
                letra = letra
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    // Remover apenas quebras excessivas (mais de 3 seguidas)
                    .replace(/\n{4,}/g, '\n\n\n')
                    .trim();
                    
                console.log(`📏 Tamanho da letra: ${letra.length} caracteres`);
                console.log(`📝 Primeiras linhas:\n${letra.substring(0, 200)}...`);
            } else {
                letra = 'Cifra não encontrada ou URL inválida.';
                console.log('❌ Não foi possível extrair a cifra');
            }

            const resultado = {
                titulo: this.cleanText(titulo),
                artista: this.cleanText(artista),
                tom: tom,
                letra: letra, // PRESERVAR espaçamento original!
                fonte: 'Cifra Club',
                url: url
            };
            
            console.log(`🎉 Scraper concluído com sucesso!`);
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro no scraper CifraClub:', error.message);
            throw new Error(`Erro ao extrair cifra do CifraClub: ${error.message}`);
        }
    }

    // Scraper específico para Músicas para Missa
    async scrapeMusicasParaMissa(url) {
        try {
            console.log(`🎵 Iniciando scraper Músicas para Missa para: ${url}`);
            
            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: { 
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                }
            });

            const $ = cheerio.load(response.data);
            
            console.log('✅ HTML carregado com sucesso');
            
            // Extrair título da página - estratégia específica para musicasparamissa
            let titulo = '';
            
            // Primeiro, tentar extrair do h1 (que deve conter o título da música)
            const h1Elements = $('h1');
            h1Elements.each((i, element) => {
                const text = $(element).text().trim();
                console.log(`🔍 H1 ${i}: "${text}"`);
                
                // Pular títulos genéricos do site
                if (text && 
                    !text.includes('Músicas para Missa') && 
                    !text.includes('Toggle navigation') &&
                    text.length > 1) {
                    titulo = text;
                    return false; // break
                }
            });
            
            // Se não encontrou no h1, tentar extrair da URL
            if (!titulo || titulo.length < 2) {
                const urlParts = url.split('/');
                const lastPart = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1];
                if (lastPart && lastPart !== 'musica' && lastPart !== '') {
                    titulo = lastPart.replace(/-/g, ' ')
                                   .split(' ')
                                   .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                   .join(' ')
                                   .trim();
                    console.log(`🔗 Título extraído da URL: "${titulo}"`);
                }
            }
            
            // Se ainda não encontrou, tentar no title da página
            if (!titulo || titulo.length < 2) {
                const titleText = $('title').text();
                titulo = titleText.replace(/Músicas para Missa/gi, '')
                                 .replace(/\|/g, '')
                                 .replace(/-/g, '')
                                 .trim();
                console.log(`📄 Título extraído do title: "${titulo}"`);
            }
            
            // Fallback final
            if (!titulo || titulo.length < 2) {
                titulo = 'Título não encontrado';
            }
            
            console.log(`✅ Título final: "${titulo}"`);
            
            // Artista é sempre "Músicas para Missa" para este site
            let artista = 'Músicas para Missa';
            
            console.log(`📝 Título: ${titulo}`);
            console.log(`🎤 Artista: ${artista}`);

            // Extrair tom (se disponível)
            let tom = 'C';
            const bodyText = $('body').text();
            const tomMatch = bodyText.match(/Tom:\s*([A-G][#b]?m?)/i);
            if (tomMatch) {
                tom = tomMatch[1];
            }

            // Extrair cifra do <pre> preservando espaçamento
            let letra = '';
            
            const preElements = $('pre');
            if (preElements.length > 0) {
                // Pegar o <pre> mais longo (provavelmente a cifra)
                let longestPre = '';
                
                preElements.each((i, element) => {
                    // Extrair HTML preservando estrutura
                    let html = $(element).html() || '';
                    
                    // Converter <br> para quebras de linha
                    html = html.replace(/<br\s*\/?>/gi, '\n');
                    
                    // Converter &nbsp; para espaços
                    html = html.replace(/&nbsp;/g, ' ');
                    
                    // Remover outras tags HTML mas preservar espaçamento
                    let content = html.replace(/<[^>]*>/g, '');
                    
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
                
                letra = longestPre;
                console.log(`🎼 Cifra encontrada (${letra.length} caracteres)`);
            }

            // Limpeza final preservando espaçamento essencial
            if (letra && letra.length > 10) {
                letra = letra
                    .replace(/\r\n/g, '\n')
                    .replace(/\r/g, '\n')
                    // Remover apenas quebras excessivas (mais de 3 seguidas)
                    .replace(/\n{4,}/g, '\n\n\n');
                    // NÃO usar .trim() para preservar espaçamento inicial
                    
                console.log(`📏 Tamanho da letra: ${letra.length} caracteres`);
                console.log(`📝 Primeiras linhas:\n${letra.substring(0, 200)}...`);
            } else {
                letra = 'Cifra não encontrada ou URL inválida.';
                console.log('❌ Não foi possível extrair a cifra');
            }

            const resultado = {
                titulo: titulo, // NÃO limpar o título
                artista: artista, // NÃO limpar o artista
                tom: tom,
                letra: letra, // PRESERVAR espaçamento original!
                fonte: 'Músicas para Missa',
                url: url
            };
            
            console.log(`🎉 Scraper Músicas para Missa concluído com sucesso!`);
            return resultado;
            
        } catch (error) {
            console.error('❌ Erro no scraper Músicas para Missa:', error.message);
            throw new Error(`Erro ao extrair cifra do Músicas para Missa: ${error.message}`);
        }
    }

    // Scraper para Ultimate Guitar
    async scrapeUltimateGuitar(url) {
        const response = await axios.get(url, {
            timeout: this.timeout,
            headers: { 'User-Agent': this.userAgent }
        });

        const $ = cheerio.load(response.data);
        
        const titulo = $('h1._3k6XM').text().trim() || 
                      $('h1').first().text().trim();
        
        const artista = $('a._3BhHj').text().trim() || 
                       $('h2 a').first().text().trim();

        // Extrair conteúdo da tab
        let letra = '';
        if ($('pre').length > 0) {
            letra = $('pre').text().trim();
        }

        return {
            titulo: this.cleanText(titulo),
            artista: this.cleanText(artista),
            tom: 'C', // Ultimate Guitar nem sempre mostra o tom claramente
            letra: this.cleanLyrics(letra),
            fonte: 'Ultimate Guitar',
            url: url
        };
    }

    // Scraper para Vagalume
    async scrapeVagalume(url) {
        const response = await axios.get(url, {
            timeout: this.timeout,
            headers: { 'User-Agent': this.userAgent }
        });

        const $ = cheerio.load(response.data);
        
        const titulo = $('h1').first().text().trim();
        const artista = $('h2 a').first().text().trim();
        
        let letra = $('.lyrics').text().trim() || 
                   $('#lyrics').text().trim() ||
                   $('.poetryLetters').text().trim();

        return {
            titulo: this.cleanText(titulo),
            artista: this.cleanText(artista),
            tom: 'C',
            letra: this.cleanLyrics(letra),
            fonte: 'Vagalume',
            url: url
        };
    }

    // Scraper genérico
    async scrapeGeneric(url) {
        const response = await axios.get(url, {
            timeout: this.timeout,
            headers: { 'User-Agent': this.userAgent }
        });

        const $ = cheerio.load(response.data);
        
        // Tentar extrair título
        const titulo = $('h1').first().text().trim() || 
                      $('title').text().trim() ||
                      'Título não encontrado';
        
        // Tentar extrair artista
        const artista = $('h2').first().text().trim() ||
                       $('[class*="artist"]').first().text().trim() ||
                       'Artista não encontrado';

        // Tentar extrair letra
        let letra = $('pre').text().trim() ||
                   $('[class*="lyric"], [class*="letra"], [class*="chord"]').text().trim() ||
                   $('body').text().trim();

        return {
            titulo: this.cleanText(titulo),
            artista: this.cleanText(artista),
            tom: 'C',
            letra: this.cleanLyrics(letra),
            fonte: 'Website',
            url: url
        };
    }

    // Limpar texto
    cleanText(text) {
        if (!text) return '';
        
        return text
            .replace(/\s+/g, ' ')  // Normalizar espaços
            .trim()
            .substring(0, 100); // Limitar tamanho
    }

    // Limpar e formatar letra
    cleanLyrics(text) {
        return text
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .substring(0, 5000); // Limitar tamanho
    }

    // Validar URL
    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Detectar categoria da música (básico)
    detectCategory(titulo, letra) {
        const keywords = {
            entrada: ['entrada', 'procissão', 'abertura'],
            ofertorio: ['ofertório', 'oferenda', 'oferta'],
            comunhao: ['comunhão', 'eucaristia', 'pão'],
            final: ['final', 'envio', 'despedida'],
            adoracao: ['adoração', 'santíssimo', 'jesus'],
            mariana: ['maria', 'nossa senhora', 'ave maria']
        };

        const textoCompleto = (titulo + ' ' + letra).toLowerCase();
        
        for (const [categoria, palavras] of Object.entries(keywords)) {
            if (palavras.some(palavra => textoCompleto.includes(palavra))) {
                return categoria;
            }
        }
        
        return 'adoracao'; // padrão
    }
}

module.exports = CifraScraper; 