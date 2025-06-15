const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

// Serviço de OCR para extrair texto de imagens e PDFs
class OCRService {
    constructor() {
        this.worker = null;
        this.initialized = false;
    }

    // Inicializar Tesseract
    async initialize() {
        if (!this.initialized) {
            const trainedDataPath = path.join(__dirname, '../../shared/ocr/por.traineddata');
            this.worker = await createWorker('por', {
                langPath: path.dirname(trainedDataPath)
            });
            this.initialized = true;
            console.log('🔍 OCR Tesseract inicializado com arquivo:', trainedDataPath);
        }
    }

    // Processar arquivo (imagem ou PDF)
    async processFile(filePath, fileType) {
        try {
            await this.initialize();

            if (fileType === 'application/pdf') {
                return await this.processPDF(filePath);
            } else if (fileType.startsWith('image/')) {
                return await this.processImageWithLayout(filePath);
            } else {
                throw new Error('Tipo de arquivo não suportado');
            }
        } catch (error) {
            console.error('Erro no OCR:', error);
            throw new Error('Erro ao processar arquivo: ' + error.message);
        }
    }

    // Processar imagem preservando layout
    async processImageWithLayout(imagePath) {
        try {
            // Otimizar imagem para OCR
            const optimizedPath = await this.optimizeImage(imagePath);
            
            // Extrair texto com coordenadas
            const { data } = await this.worker.recognize(optimizedPath);
            
            // Limpar arquivo temporário
            if (optimizedPath !== imagePath) {
                fs.unlinkSync(optimizedPath);
            }

            // Processar dados para preservar layout
            const structuredText = this.preserveLayout(data);

            return {
                success: true,
                text: structuredText,
                originalText: data.text,
                processedBy: 'Tesseract OCR com Layout',
                words: data.words // Manter palavras com coordenadas para debug
            };
        } catch (error) {
            throw new Error('Erro ao processar imagem: ' + error.message);
        }
    }

    // Processar imagem (método original mantido para compatibilidade)
    async processImage(imagePath) {
        try {
            // Otimizar imagem para OCR
            const optimizedPath = await this.optimizeImage(imagePath);
            
            // Extrair texto
            const { data: { text } } = await this.worker.recognize(optimizedPath);
            
            // Limpar arquivo temporário
            if (optimizedPath !== imagePath) {
                fs.unlinkSync(optimizedPath);
            }

            return {
                success: true,
                text: this.cleanExtractedText(text),
                processedBy: 'Tesseract OCR'
            };
        } catch (error) {
            throw new Error('Erro ao processar imagem: ' + error.message);
        }
    }

    // Preservar layout espacial dos acordes
    preserveLayout(ocrData) {
        const words = ocrData.data.words.filter(word => 
            word.text.trim().length > 0 && 
            word.confidence > 25 // Reduzir threshold para capturar mais texto
        );

        console.log(`📊 OCR Debug: ${words.length} palavras válidas encontradas`);

        // Organizar palavras em linhas baseado na posição Y
        const lines = this.organizeWordsByLines(words);
        console.log(`📊 OCR Debug: ${lines.length} linhas organizadas`);

        // Processar cada linha e armazenar para análise espacial
        const processedLines = lines.map((lineWords, index) => {
            const processedLine = this.processLine(lineWords);
            console.log(`Linha ${index + 1}: "${processedLine.text}" (${processedLine.chordCount} acordes: ${processedLine.detectedChords.join(', ')})`);
            return processedLine;
        });

        // Armazenar para análise espacial
        this.allProcessedLines = processedLines;

        // Determinar quais linhas são acordes vs letras
        processedLines.forEach((line, index) => {
            line.isChordLine = this.isLikelyChordLine(line.words);
            console.log(`${line.isChordLine ? '🎵' : '📝'} Linha de ${line.isChordLine ? 'ACORDES' : 'LETRA'} detectada: "${line.text}"`);
        });

        // Construir texto estruturado preservando posições
        return this.buildStructuredText(processedLines);
    }

    // Organizar palavras em linhas com tolerância adaptável
    organizeWordsByLines(words) {
        if (words.length === 0) return [];

        // Ordenar palavras por posição Y (top para bottom)
        words.sort((a, b) => a.bbox.y0 - b.bbox.y0);

        const lines = [];
        let currentLine = [words[0]];
        
        // Calcular tolerância Y baseada na qualidade geral do OCR
        const avgConfidence = words.reduce((sum, w) => sum + w.confidence, 0) / words.length;
        
        // Tolerância adaptável baseada na qualidade do OCR
        let yTolerance;
        if (avgConfidence > 80) {
            yTolerance = 10; // OCR de alta qualidade - tolerância baixa
        } else if (avgConfidence > 60) {
            yTolerance = 15; // OCR médio
        } else {
            yTolerance = 25; // OCR de baixa qualidade - tolerância alta
        }
        
        console.log(`📊 Confiança média OCR: ${avgConfidence.toFixed(1)}% | Tolerância Y: ±${yTolerance}px`);

        for (let i = 1; i < words.length; i++) {
            const currentWord = words[i];
            const lastWordInLine = currentLine[currentLine.length - 1];

            // Se a diferença Y está dentro da tolerância, adicionar à linha atual
            if (Math.abs(currentWord.bbox.y0 - lastWordInLine.bbox.y0) <= yTolerance) {
                currentLine.push(currentWord);
            } else {
                // Ordenar linha atual por posição X (left para right)
                currentLine.sort((a, b) => a.bbox.x0 - b.bbox.x0);
                lines.push(currentLine);
                currentLine = [currentWord];
            }
        }

        // Adicionar última linha
        if (currentLine.length > 0) {
            currentLine.sort((a, b) => a.bbox.x0 - b.bbox.x0);
            lines.push(currentLine);
        }

        return lines;
    }

    // Processar uma linha específica
    processLine(lineWords) {
        const text = lineWords.map(word => word.text).join(' ');
        const chords = this.detectChordsStrict(text);
        
        return {
            words: lineWords,
            text: text,
            chordCount: chords.length,
            detectedChords: chords,
            bbox: {
                x0: Math.min(...lineWords.map(w => w.bbox.x0)),
                x1: Math.max(...lineWords.map(w => w.bbox.x1)),
                y0: Math.min(...lineWords.map(w => w.bbox.y0)),
                y1: Math.max(...lineWords.map(w => w.bbox.y1))
            }
        };
    }

    // Verificar se uma linha é provavelmente de acordes (versão melhorada)
    isLikelyChordLine(lineWords) {
        if (lineWords.length === 0) return false;
        
        const lineText = lineWords.map(word => word.text).join(' ');
        
        console.log(`🔍 Analisando linha: "${lineText}"`);
        
        // 1. ANÁLISE ESPACIAL - Verificar se linha está ACIMA de uma linha de letra
        const hasLineBelow = this.hasLyricLineBelow(lineWords);
        
        // 2. ANÁLISE LINGUÍSTICA mais rigorosa
        const chords = this.detectChordsStrict(lineText);
        const totalWords = lineWords.length;
        const chordRatio = chords.length / totalWords;
        
        // 3. CRITÉRIOS MAIS ESPECÍFICOS
        const hasCommonLyricWords = this.hasCommonLyricWords(lineText);
        const hasLongWords = lineWords.some(word => word.text.length > 10);
        const hasNumbers = /\d/.test(lineText);
        const hasArticles = /\b(o|a|os|as|um|uma|de|da|do|das|dos|em|na|no|nas|nos)\b/i.test(lineText);
        const hasVerbs = /\b(é|és|são|foi|vem|vai|veio|tem|tenho|tens|temos|sou|somos)\b/i.test(lineText);
        const hasPronouns = /\b(eu|tu|ele|ela|nós|vocês|eles|elas|meu|minha|seu|sua|nosso|nossa)\b/i.test(lineText);
        
        // PONTUAÇÃO para determinar se é linha de acordes
        let score = 0;
        
        // FORTE INDICADOR: Linha está acima de linha de letra
        if (hasLineBelow) score += 3;
        
        // FORTE INDICADOR: Alta proporção de acordes válidos
        if (chordRatio >= 0.7) score += 4;
        else if (chordRatio >= 0.5) score += 2;
        else if (chordRatio >= 0.3) score += 1;
        
        // INDICADOR: Linha curta (acordes costumam ser esparsos)
        if (totalWords <= 6) score += 2;
        else if (totalWords <= 10) score += 1;
        
        // FORTE PENALIZAÇÃO: Palavras claramente de letra de música
        if (hasCommonLyricWords) score -= 4;
        if (hasArticles) score -= 3;
        if (hasVerbs) score -= 3;
        if (hasPronouns) score -= 2;
        if (hasLongWords) score -= 2;
        
        // LEVE BÔNUS: Números (extensões de accordes) se já tem acordes
        if (hasNumbers && chordRatio > 0.3) score += 1;
        
        const isChordLine = score >= 3; // Threshold mais alto para maior precisão
        
        console.log(`📊 Score: ${score} | Acordes: ${chords.length}/${totalWords} (${(chordRatio*100).toFixed(0)}%) | Resultado: ${isChordLine ? 'ACORDE' : 'LETRA'}`);
        
        return isChordLine;
    }

    // Nova função: Verificar se há linha de letra abaixo (análise espacial)
    hasLyricLineBelow(currentLineWords) {
        if (!this.allProcessedLines) return false;
        
        const currentY = currentLineWords[0]?.bbox.y0;
        if (!currentY) return false;
        
        // Procurar linhas que estão abaixo desta (Y maior, tolerância de ±30px)
        for (const line of this.allProcessedLines) {
            if (line.words && line.words.length > 0) {
                const lineY = line.words[0].bbox.y0;
                
                // Se está abaixo (Y maior) e próximo (diferença entre 10-50px)
                if (lineY > currentY && (lineY - currentY) >= 10 && (lineY - currentY) <= 50) {
                    const lineText = line.words.map(w => w.text).join(' ');
                    
                    // Verificar se linha de baixo parece ser letra (não acordes)
                    if (this.looksLikeLyric(lineText)) {
                        console.log(`📍 Linha abaixo detectada: "${lineText}"`);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    // Nova função: Verificar se texto parece ser letra de música
    looksLikeLyric(text) {
        const hasCommonWords = this.hasCommonLyricWords(text);
        const hasArticles = /\b(o|a|os|as|um|uma|de|da|do|das|dos|em|na|no|nas|nos)\b/i.test(text);
        const hasVerbs = /\b(é|és|são|foi|vem|vai|veio|tem|tenho|tens|temos|sou|somos)\b/i.test(text);
        const hasLongWords = text.split(' ').some(word => word.length > 8);
        const hasMultipleWords = text.split(' ').length >= 4;
        const chordRatio = this.detectChordsStrict(text).length / text.split(' ').length;
        
        return (hasCommonWords || hasArticles || hasVerbs || hasLongWords || hasMultipleWords) && chordRatio < 0.3;
    }

    // Nova função: Detecção de acordes mais rigorosa
    detectChordsStrict(text) {
        const words = text.split(/\s+/);
        const validChords = [];
        
        for (const word of words) {
            if (this.isValidChordStrict(word)) {
                validChords.push(word);
            }
        }
        
        return validChords;
    }
    
    // Nova função: Validação de acorde mais rigorosa e universal
    isValidChordStrict(word) {
        // Limpar pontuação
        const cleanWord = word.replace(/[^\w#b]/g, '');
        
        // Não aceitar palavras muito longas ou muito curtas
        if (cleanWord.length > 6 || cleanWord.length < 1) return false;
        
        // LISTA NEGRA UNIVERSAL - diferentes gêneros musicais
        const blacklist = [
            // Artigos, preposições, conjunções
            'EM', 'DO', 'DA', 'NA', 'NO', 'AS', 'OS', 'SE', 'DE', 'LA', 'SI', 'ME', 'TE',
            'COM', 'SEM', 'POR', 'PARA', 'ATÉ', 'SOB', 'SOBRE', 'ENTRE', 'ANTE',
            
            // Pronomes e verbos comuns
            'AVE', 'DEUS', 'TU', 'ELE', 'ELA', 'EU', 'VEM', 'FOI', 'VOU', 'SOU', 'FAZ',
            'VER', 'SER', 'TER', 'DIR', 'VIR', 'QUE', 'MAS', 'NEM', 'SIM', 'NÃO',
            
            // Palavras religiosas
            'JESUS', 'CRISTO', 'SANTO', 'SANTA', 'SAGRADO', 'SAGRADA', 'MARIA',
            'JOSÉ', 'JOÃO', 'CRUZ', 'SENHOR', 'SENHORA', 'PAI', 'FILHO', 'ESPÍRITO',
            
            // Palavras seculares comuns
            'AMOR', 'VIDA', 'TEMPO', 'CASA', 'NOME', 'LUGAR', 'CORAÇÃO', 'ALMA',
            'LUZ', 'PAZ', 'ESPERANÇA', 'SONHO', 'MUNDO', 'TERRA', 'CÉU', 'MAR',
            'SOL', 'LUA', 'ESTRELA', 'NOITE', 'DIA', 'MANHÃ', 'TARDE',
            
            // Pop/Rock brasileiro
            'BABY', 'GIRL', 'BOY', 'YEAH', 'LOVE', 'HEART', 'SOUL', 'FIRE',
            'ROCK', 'ROLL', 'DANCE', 'PARTY', 'NIGHT', 'DAY', 'TIME', 'LIFE',
            
            // Sertanejo/Country
            'SERTÃO', 'CAMPO', 'VIOLA', 'BERRANTE', 'BEIRA', 'ESTRADA', 'CIDADE',
            'INTERIOR', 'FAZENDA', 'COWBOY', 'PEÃO', 'RODEIO', 'FESTA',
            
            // MPB/Bossa Nova
            'GAROTA', 'MENINA', 'MOÇA', 'MULHER', 'HOMEM', 'GENTE', 'POVO',
            'BRASIL', 'BRASILEIRO', 'CARIOCA', 'PAULISTA', 'MINEIRO',
            
            // Falsos positivos específicos que começam com notas
            'ELA', 'ELE', 'ERA', 'ESSE', 'ESTA', 'ESTÁ', 'ENTÃO', 'ENFIM'
        ];
        
        if (blacklist.includes(cleanWord.toUpperCase())) return false;
        
        // Deve começar com nota musical
        const firstChar = cleanWord.charAt(0).toUpperCase();
        if (!'ABCDEFG'.includes(firstChar)) return false;
        
        // Padrão mais específico para acordes universais
        // Formato: [Nota][acidentes][tipo][extensão][/baixo]
        const strictChordPattern = /^[A-G]([#b])?((m|maj|min|dim|aug|sus|add)?\d*)?((\/[A-G]([#b])?)?)?$/i;
        
        if (!strictChordPattern.test(cleanWord)) return false;
        
        // Verificação adicional: se tem mais de 2 vogais consecutivas, provavelmente não é acorde
        if (/[aeiouAEIOU]{3,}/.test(cleanWord)) return false;
        
        // Se passou todos os testes, é provavelmente um acorde válido
        return true;
    }

    // Verificar se contém palavras comuns de letras de música
    hasCommonLyricWords(text) {
        const commonWords = [
            'eu', 'tu', 'ele', 'ela', 'nós', 'vocês', 'eles', 'elas',
            'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'da', 'do', 'das', 'dos',
            'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem',
            'que', 'quando', 'onde', 'como', 'porque', 'se',
            'jesus', 'cristo', 'deus', 'senhor', 'pai', 'filho', 'espírito',
            'santo', 'maria', 'ave', 'nossa', 'senhora', 'amor', 'vida',
            'coração', 'alma', 'céu', 'terra', 'luz', 'paz', 'esperança'
        ];
        
        const words = text.toLowerCase().split(/\s+/);
        const commonWordsFound = words.filter(word => 
            commonWords.includes(word.replace(/[^a-záàâãéêíóôõúç]/g, ''))
        );
        
        return commonWordsFound.length > words.length * 0.3;
    }

    // Construir texto estruturado preservando layout
    buildStructuredText(processedLines) {
        const result = [];
        
        // Primeiro, tentar recuperar acordes perdidos
        const recoveredLines = this.recoverMissingChords(processedLines);
        
        for (let i = 0; i < recoveredLines.length; i++) {
            const currentLine = recoveredLines[i];
            const nextLine = recoveredLines[i + 1];
            
            if (currentLine.isChordLine && nextLine && !nextLine.isChordLine) {
                // Linha de acordes seguida de letra - tentar alinhar
                const alignedText = this.alignChordsWithLyrics(currentLine, nextLine);
                result.push(alignedText);
                i++; // Pular próxima linha pois já foi processada
            } else if (currentLine.isChordLine) {
                // Linha de acordes sozinha
                result.push(currentLine.text);
            } else {
                // Linha normal
                result.push(currentLine.text);
            }
        }
        
        return result.join('\n');
    }
    
    // Recuperar acordes que podem ter sido perdidos na detecção
    recoverMissingChords(processedLines) {
        const recovered = [...processedLines];
        
        for (let i = 0; i < recovered.length; i++) {
            const line = recovered[i];
            
            // Se não foi detectada como linha de acordes, mas contém padrões suspeitos
            if (!line.isChordLine && this.mightContainChords(line.text)) {
                const words = line.text.split(/\s+/);
                const suspiciousWords = words.filter(word => this.couldBeChord(word));
                
                // Se mais de 30% das palavras são suspeitas de serem acordes
                if (suspiciousWords.length / words.length >= 0.3) {
                    console.log(`🔍 Recuperando acordes perdidos na linha: "${line.text}"`);
                    recovered[i] = { ...line, isChordLine: true };
                }
            }
        }
        
        return recovered;
    }
    
    // Verificar se uma linha pode conter acordes não detectados
    mightContainChords(text) {
        // Padrões que sugerem presença de acordes
        const patterns = [
            /\b[A-G][#b]?\w{0,4}\b/g,      // Padrões que começam com notas
            /\b\w*[47-9]\b/g,              // Palavras com números de extensão
            /\bmaj|min|dim|aug|sus\b/gi,   // Extensões de acordes
            /\b[A-G]\/[A-G]\b/g,           // Baixos alternativos
        ];
        
        return patterns.some(pattern => pattern.test(text));
    }
    
    // Verificar se uma palavra individual pode ser um acorde
    couldBeChord(word) {
        if (word.length > 8 || word.length < 1) return false;
        
        // Deve começar com nota musical
        const firstChar = word.charAt(0).toUpperCase();
        if (!'ABCDEFG'.includes(firstChar)) return false;
        
        // Não pode ser palavra comum
        const commonWords = ['EM', 'DO', 'DA', 'NA', 'NO', 'AS', 'OS', 'SE', 'DE', 'LA', 'SI', 'ME', 'TE'];
        if (commonWords.includes(word.toUpperCase())) return false;
        
        // Verificar padrões típicos de acordes
        const chordPattern = /^[A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G][#b]?)?$/i;
        return chordPattern.test(word);
    }

    // Alinhar acordes com caracteres específicos das palavras (não palavras inteiras)
    alignChordsWithLyrics(chordLine, lyricLine) {
        const chordWords = chordLine.words;
        const lyricWords = lyricLine.words;
        
        if (chordWords.length === 0 || lyricWords.length === 0) {
            return chordLine.text + '\n' + lyricLine.text;
        }

        console.log('🎯 Alinhando acordes com caracteres específicos:');
        console.log('📝 Letra:', lyricLine.text);
        console.log('🎵 Acordes:', chordLine.text);

        // Construir mapa de posições de caracteres com robustez para diferentes fontes
        const lyricText = lyricLine.text;
        const charPositionMap = this.buildCharacterPositionMap(lyricWords, lyricText);
        
        // Criar linha de acordes com base no comprimento do texto da letra
        const chordLineArray = new Array(Math.max(lyricText.length + 10, 80)).fill(' ');
        
        // Para cada acorde, encontrar o caractere mais próximo na letra
        chordWords.forEach(chordWord => {
            const chordCenter = (chordWord.bbox.x0 + chordWord.bbox.x1) / 2;
            
            // Encontrar qual caractere da letra está mais próximo do acorde horizontalmente
            let bestCharIndex = 0;
            let minDistance = Infinity;
            
            charPositionMap.forEach((charInfo, charIndex) => {
                if (charInfo && charInfo.x !== undefined) {
                    const distance = Math.abs(chordCenter - charInfo.x);
                    if (distance < minDistance) {
                        minDistance = distance;
                        bestCharIndex = charIndex;
                    }
                }
            });
            
            const targetChar = lyricText[bestCharIndex];
            console.log(`🎼 Acorde "${chordWord.text}" -> caractere "${targetChar}" na posição ${bestCharIndex} (distância: ${minDistance.toFixed(1)}px)`);
            
            // Posicionar acorde começando no caractere encontrado
            const startPos = Math.max(0, bestCharIndex);
            
            // Inserir acorde sem sobrescrever caracteres importantes já inseridos
            for (let i = 0; i < chordWord.text.length; i++) {
                const insertPos = startPos + i;
                if (insertPos < chordLineArray.length) {
                    // Só inserir se a posição estiver vazia ou for espaço
                    if (chordLineArray[insertPos] === ' ') {
                        chordLineArray[insertPos] = chordWord.text[i];
                    }
                }
            }
        });
        
        // Construir resultado final
        let chordLineFormatted = chordLineArray.join('').trimEnd();
        
        // Melhorar espaçamento entre acordes
        chordLineFormatted = this.optimizeChordSpacing(chordLineFormatted, lyricText);
        
        console.log('✅ Resultado com alinhamento por caractere:');
        console.log(`"${chordLineFormatted}"`);
        console.log(`"${lyricLine.text}"`);
        
        return chordLineFormatted + '\n' + lyricLine.text;
    }
    
    // Construir mapa de posições de caracteres com robustez para diferentes fontes
    buildCharacterPositionMap(lyricWords, lyricText) {
        const charMap = new Map();
        let globalCharIndex = 0;
        
        // Calcular estatísticas para melhor adaptação
        const avgWordWidth = lyricWords.reduce((sum, w) => sum + (w.bbox.x1 - w.bbox.x0), 0) / lyricWords.length;
        const avgConfidence = lyricWords.reduce((sum, w) => sum + w.confidence, 0) / lyricWords.length;
        
        console.log(`📐 Estatísticas: Largura média palavra: ${avgWordWidth.toFixed(1)}px, Confiança: ${avgConfidence.toFixed(1)}%`);
        
        lyricWords.forEach((wordObj, wordIndex) => {
            const wordText = wordObj.text;
            const wordStartX = wordObj.bbox.x0;
            const wordEndX = wordObj.bbox.x1;
            const wordWidth = wordEndX - wordStartX;
            
            // Calcular largura por caractere com ajuste para diferentes fontes
            let charWidth = wordWidth / wordText.length;
            
            // Ajustar para fontes não-monoespaçadas (heurística)
            if (avgConfidence < 70) {
                // Para OCR de baixa qualidade, usar margem de erro maior
                charWidth *= 0.9; // Reduzir um pouco para compensar imprecisões
            }
            
            // Para cada caractere da palavra, calcular sua posição X
            for (let i = 0; i < wordText.length; i++) {
                // Diferentes estratégias de posicionamento baseadas na qualidade
                let charX;
                if (avgConfidence > 80) {
                    // Alta qualidade: posicionamento preciso
                    charX = wordStartX + (i * charWidth) + (charWidth / 2);
                } else {
                    // Baixa qualidade: posicionamento mais conservador
                    charX = wordStartX + (i * charWidth) + (charWidth * 0.3);
                }
                
                // Encontrar este caractere no texto global com tolerância
                while (globalCharIndex < lyricText.length) {
                    const currentGlobalChar = lyricText[globalCharIndex];
                    const currentWordChar = wordText[i];
                    
                    // Comparação flexível de caracteres (ignora acentos menores)
                    if (this.charactersMatch(currentGlobalChar, currentWordChar)) {
                        charMap.set(globalCharIndex, { 
                            x: charX, 
                            char: currentGlobalChar,
                            word: wordText,
                            charInWord: i,
                            confidence: wordObj.confidence,
                            wordIndex: wordIndex
                        });
                        
                        if (globalCharIndex % 5 === 0) { // Log apenas alguns para não poluir
                            console.log(`📍 Char[${globalCharIndex}] = "${currentGlobalChar}" at X:${charX.toFixed(1)} (conf:${wordObj.confidence}%)`);
                        }
                        
                        globalCharIndex++;
                        break;
                    } else {
                        // Caractere não corresponde - pode ser erro de OCR ou espaço
                        charMap.set(globalCharIndex, { 
                            x: undefined, 
                            char: currentGlobalChar,
                            error: true 
                        });
                        globalCharIndex++;
                    }
                }
            }
            
            // Processar espaços após a palavra
            while (globalCharIndex < lyricText.length && lyricText[globalCharIndex] === ' ') {
                // Espaços ficam após a palavra atual
                const spaceX = wordEndX + ((globalCharIndex - (globalCharIndex - 1)) * 5);
                charMap.set(globalCharIndex, { 
                    x: spaceX, 
                    char: ' ',
                    isSpace: true 
                });
                globalCharIndex++;
            }
        });
        
        return charMap;
    }
    
    // Comparar caracteres com tolerância para erros de OCR
    charactersMatch(char1, char2) {
        if (char1 === char2) return true;
        
        // Normalizar caracteres para comparação (remover acentos menores)
        const normalize = (c) => c.toLowerCase()
            .replace(/[áàâã]/g, 'a')
            .replace(/[éèê]/g, 'e')
            .replace(/[íì]/g, 'i')
            .replace(/[óòôõ]/g, 'o')
            .replace(/[úù]/g, 'u')
            .replace(/ç/g, 'c');
            
        return normalize(char1) === normalize(char2);
    }

    // Otimizar espaçamento entre acordes baseado no texto da letra
    optimizeChordSpacing(chordLine, lyricText) {
        // Se a linha de acordes é muito curta comparada à letra, expandir proporcionalmente
        if (chordLine.trim().length < lyricText.length * 0.3) {
            return this.expandChordLine(chordLine, lyricText.length);
        }
        
        return chordLine;
    }
    
    // Expandir linha de acordes para melhor distribuição
    expandChordLine(chordLine, targetLength) {
        const chords = [];
        let currentChord = '';
        
        // Extrair acordes individuais
        for (let i = 0; i < chordLine.length; i++) {
            const char = chordLine[i];
            if (char !== ' ') {
                currentChord += char;
            } else if (currentChord) {
                chords.push(currentChord);
                currentChord = '';
            }
        }
        if (currentChord) chords.push(currentChord);
        
        if (chords.length === 0) return chordLine;
        
        // Distribuir acordes mais uniformemente
        const expandedLine = new Array(targetLength).fill(' ');
        const spacing = Math.floor(targetLength / chords.length);
        
        chords.forEach((chord, index) => {
            const startPos = index * spacing;
            for (let i = 0; i < chord.length && (startPos + i) < expandedLine.length; i++) {
                expandedLine[startPos + i] = chord[i];
            }
        });
        
        return expandedLine.join('').trimEnd();
    }

    // Processar PDF
    async processPDF(pdfPath) {
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdf(dataBuffer);

            return {
                success: true,
                text: this.cleanExtractedText(data.text),
                pages: data.numpages,
                processedBy: 'PDF Parser'
            };
        } catch (error) {
            throw new Error('Erro ao processar PDF: ' + error.message);
        }
    }

    // Otimizar imagem para melhor OCR
    async optimizeImage(imagePath) {
        try {
            const outputPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '_optimized.png');
            
            await sharp(imagePath)
                .greyscale() // Converter para escala de cinza
                .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
                .sharpen() // Aumentar nitidez
                .normalize() // Normalizar contraste
                .png({ quality: 100 })
                .toFile(outputPath);

            return outputPath;
        } catch (error) {
            console.error('Erro ao otimizar imagem:', error);
            return imagePath; // Retorna original se der erro
        }
    }

    // Limpar e formatar texto extraído
    cleanExtractedText(text) {
        return text
            // Remover caracteres especiais desnecessários
            .replace(/[^\w\s\[\]\-\(\)]/g, ' ')
            // Normalizar espaços
            .replace(/\s+/g, ' ')
            // Remover linhas muito curtas (provavelmente lixo)
            .split('\n')
            .filter(line => line.trim().length > 3)
            .join('\n')
            // Remover quebras de linha excessivas
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    // Detectar acordes em uma linha de texto
    detectChords(text) {
        // Padrões de acordes mais abrangentes
        const chordPatterns = [
            // Acordes básicos com variações
            /\b[A-G](?:b|#)?m?\b/g,                    // C, Cm, C#, Db, etc.
            /\b[A-G](?:b|#)?(?:maj|min|m)?\d?\b/g,     // Cmaj7, Dm7, etc.
            /\b[A-G](?:b|#)?(?:sus|add|aug|dim)\d?\b/g, // Csus4, Cadd9, etc.
            /\b[A-G](?:b|#)?\/[A-G](?:b|#)?\b/g,       // C/G, Am/F, etc.
            /\b[A-G](?:b|#)?\([^)]+\)\b/g,             // C(add9), etc.
            
            // Acordes com números e extensões
            /\b[A-G](?:b|#)?(?:maj|min|m)?[0-9]+\b/g,  // C7, Dm9, Gmaj13, etc.
            /\b[A-G](?:b|#)?[0-9]+\b/g,                // C7, F9, etc.
            
            // Acordes especiais
            /\b(?:Am|Bm|Cm|Dm|Em|Fm|Gm)\b/g,          // Menores explícitos
            /\b(?:A|B|C|D|E|F|G)(?:°|º|dim)\b/g,       // Diminutos
            /\b(?:A|B|C|D|E|F|G)\+\b/g,                // Aumentados
            
            // Notações específicas brasileiras
            /\b[A-G](?:b|#)?m?\d*(?:\/\d+)?\b/g,       // C/4, Am/7, etc.
        ];
        
        const chords = new Set();
        
        chordPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    // Filtrar falsos positivos
                    const cleanMatch = match.trim();
                    if (this.isValidChord(cleanMatch)) {
                        chords.add(cleanMatch);
                    }
                });
            }
        });
        
        return Array.from(chords);
    }
    
    // Validar se uma string é realmente um acorde
    isValidChord(chord) {
        // Não aceitar palavras muito longas
        if (chord.length > 8) return false;
        
        // Não aceitar se for uma palavra comum
        const commonWords = ['EM', 'DO', 'DA', 'NA', 'NO', 'AS', 'OS', 'SE', 'DE', 'LA', 'SI', 'ME', 'TE'];
        if (commonWords.includes(chord.toUpperCase())) return false;
        
        // Deve começar com nota musical
        const firstChar = chord.charAt(0).toUpperCase();
        if (!'ABCDEFG'.includes(firstChar)) return false;
        
        return true;
    }

    // Formatar texto como cifra
    formatAsCifra(text) {
        const lines = text.split('\n');
        const formattedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.length === 0) {
                formattedLines.push('');
                continue;
            }

            // Detectar linha de acordes
            const chords = this.detectChords(line);
            if (chords.length > 0 && line.split(' ').length <= 8) {
                // Provavelmente uma linha de acordes
                const formattedChords = chords.map(chord => `[${chord}]`).join(' ');
                formattedLines.push(formattedChords);
            } else {
                // Linha de letra
                formattedLines.push(line);
            }
        }

        return formattedLines.join('\n');
    }

    // Extrair informações da cifra
    extractCifraInfo(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        let titulo = '';
        let artista = '';
        let tom = 'C';

        console.log('🔍 Extraindo informações da cifra...');
        console.log('📄 Primeiras 5 linhas:', lines.slice(0, 5));

        // Estratégia 1: Procurar padrões específicos primeiro
        for (const line of lines) {
            // Padrão: "Título - Artista"
            const titleArtistMatch = line.match(/^(.+)\s*-\s*(.+)$/);
            if (titleArtistMatch && !this.detectChords(line).length) {
                titulo = titleArtistMatch[1].trim();
                artista = titleArtistMatch[2].trim();
                console.log('✅ Encontrado padrão "Título - Artista":', { titulo, artista });
                break;
            }

            // Padrão: "Por: Artista", "Intérprete: Artista", etc.
            const artistPattern = /(?:por|intérprete|artista|de):\s*(.+)/i;
            const artistMatch = line.match(artistPattern);
            if (artistMatch) {
                artista = artistMatch[1].trim();
                console.log('✅ Encontrado artista:', artista);
            }

            // Padrão: "Tom: X", "Tom de X", etc.
            const tomPattern = /tom[:\s]*([A-G][#b]?m?)/i;
            const tomMatch = line.match(tomPattern);
            if (tomMatch) {
                tom = tomMatch[1];
                console.log('✅ Encontrado tom:', tom);
            }
        }

        // Estratégia 2: Se não encontrou título, pegar a primeira linha que não seja acorde
        if (!titulo) {
            for (const line of lines.slice(0, 3)) { // Verificar apenas primeiras 3 linhas
                const chords = this.detectChords(line);
                const hasLongWords = line.split(' ').some(word => word.length > 10);
                
                // Se a linha não tem acordes OU tem palavras longas, pode ser título
                if (chords.length === 0 || hasLongWords) {
                    titulo = line;
                    console.log('✅ Título detectado (primeira linha sem acordes):', titulo);
                    break;
                }
            }
        }

        // Estratégia 3: Se não encontrou tom, pegar primeiro acorde detectado
        if (tom === 'C') {
            const allChords = this.detectChords(text);
            if (allChords.length > 0) {
                // Extrair apenas a nota base do primeiro acorde
                tom = allChords[0].replace(/[^A-G#b]/g, '').substring(0, 2);
                console.log('✅ Tom detectado do primeiro acorde:', tom);
            }
        }

        // Limpar e validar dados extraídos
        titulo = this.cleanMetadata(titulo || 'Cifra Extraída');
        artista = this.cleanMetadata(artista || 'Artista Desconhecido');
        tom = tom.length > 10 ? 'C' : tom; // Fallback se tom for muito longo

        // Validar tamanhos conforme banco de dados
        if (titulo.length > 200) {
            titulo = titulo.substring(0, 197) + '...';
        }
        if (artista.length > 100) {
            artista = artista.substring(0, 97) + '...';
        }

        console.log('📋 Metadados finais:', { titulo, artista, tom });

        return {
            titulo,
            artista,
            tom,
            letra: text // Manter o texto completo estruturado como letra
        };
    }

    // Limpar metadados extraídos
    cleanMetadata(text) {
        return text
            .replace(/[^\w\s\-\.\,\(\)]/g, ' ') // Manter apenas caracteres básicos
            .replace(/\s+/g, ' ') // Normalizar espaços
            .trim();
    }

    // Finalizar worker
    async terminate() {
        if (this.worker && this.initialized) {
            await this.worker.terminate();
            this.initialized = false;
            console.log('🔍 OCR Tesseract finalizado');
        }
    }
}

module.exports = new OCRService(); 