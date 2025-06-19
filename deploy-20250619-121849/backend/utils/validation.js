const { 
    CATEGORIAS_CIFRAS, 
    TONS_MUSICAIS, 
    TIPOS_ARQUIVO_OCR, 
    LIMITES_UPLOAD,
    MENSAGENS_ERRO 
} = require('./constants');

class ValidationUtils {
    // Validar dados de cifra
    static validarCifra(dados) {
        const erros = [];
        
        if (!dados.titulo || typeof dados.titulo !== 'string' || dados.titulo.trim().length === 0) {
            erros.push('Título é obrigatório');
        }
        
        if (!dados.artista || typeof dados.artista !== 'string' || dados.artista.trim().length === 0) {
            erros.push('Artista é obrigatório');
        }
        
        if (!dados.conteudo || typeof dados.conteudo !== 'string' || dados.conteudo.trim().length === 0) {
            erros.push('Conteúdo da cifra é obrigatório');
        }
        
        if (dados.categoria && !Object.values(CATEGORIAS_CIFRAS).includes(dados.categoria)) {
            erros.push('Categoria inválida');
        }
        
        if (dados.tom && !TONS_MUSICAIS.includes(dados.tom)) {
            erros.push('Tom musical inválido');
        }
        
        if (dados.titulo && dados.titulo.length > 200) {
            erros.push('Título muito longo (máximo 200 caracteres)');
        }
        
        if (dados.artista && dados.artista.length > 100) {
            erros.push('Nome do artista muito longo (máximo 100 caracteres)');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Validar dados de usuário
    static validarUsuario(dados) {
        const erros = [];
        
        if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim().length === 0) {
            erros.push('Nome é obrigatório');
        }
        
        if (!dados.email || !this.validarEmail(dados.email)) {
            erros.push('Email válido é obrigatório');
        }
        
        if (!dados.senha || dados.senha.length < 6) {
            erros.push('Senha deve ter pelo menos 6 caracteres');
        }
        
        if (dados.nome && dados.nome.length > 100) {
            erros.push('Nome muito longo (máximo 100 caracteres)');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Validar email
    static validarEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Validar URL
    static validarUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    // Validar arquivo para OCR
    static validarArquivoOCR(arquivo) {
        const erros = [];
        
        if (!arquivo) {
            erros.push('Arquivo é obrigatório');
            return { valido: false, erros };
        }
        
        // Verificar tipo de arquivo
        if (!TIPOS_ARQUIVO_OCR.TODOS.includes(arquivo.mimetype)) {
            erros.push(`Tipo de arquivo não suportado. Tipos aceitos: ${TIPOS_ARQUIVO_OCR.TODOS.join(', ')}`);
        }
        
        // Verificar tamanho
        if (arquivo.size > LIMITES_UPLOAD.TAMANHO_MAX_ARQUIVO) {
            const tamanhoMB = (LIMITES_UPLOAD.TAMANHO_MAX_ARQUIVO / 1024 / 1024).toFixed(1);
            erros.push(`Arquivo muito grande. Tamanho máximo: ${tamanhoMB}MB`);
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Validar múltiplos arquivos
    static validarMultiplosArquivos(arquivos) {
        const erros = [];
        
        if (!Array.isArray(arquivos) || arquivos.length === 0) {
            erros.push('Pelo menos um arquivo é obrigatório');
            return { valido: false, erros };
        }
        
        if (arquivos.length > LIMITES_UPLOAD.NUMERO_MAX_ARQUIVOS) {
            erros.push(`Muitos arquivos. Máximo permitido: ${LIMITES_UPLOAD.NUMERO_MAX_ARQUIVOS}`);
        }
        
        // Validar cada arquivo individualmente
        arquivos.forEach((arquivo, index) => {
            const validacao = this.validarArquivoOCR(arquivo);
            if (!validacao.valido) {
                validacao.erros.forEach(erro => {
                    erros.push(`Arquivo ${index + 1}: ${erro}`);
                });
            }
        });
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Validar dados de repertório
    static validarRepertorio(dados) {
        const erros = [];
        
        if (!dados.nome || typeof dados.nome !== 'string' || dados.nome.trim().length === 0) {
            erros.push('Nome do repertório é obrigatório');
        }
        
        if (dados.nome && dados.nome.length > 100) {
            erros.push('Nome do repertório muito longo (máximo 100 caracteres)');
        }
        
        if (dados.descricao && dados.descricao.length > 500) {
            erros.push('Descrição muito longa (máximo 500 caracteres)');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros
        };
    }
    
    // Sanitizar string
    static sanitizarString(str) {
        if (typeof str !== 'string') return '';
        return str;
    }
    
    // Validar ID numérico
    static validarId(id) {
        const numId = parseInt(id);
        return !isNaN(numId) && numId > 0;
    }
    
    // Validar parâmetros de paginação
    static validarPaginacao(page, limit) {
        const erros = [];
        
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        
        if (page && (isNaN(pageNum) || pageNum < 1)) {
            erros.push('Página deve ser um número maior que 0');
        }
        
        if (limit && (isNaN(limitNum) || limitNum < 1 || limitNum > 100)) {
            erros.push('Limite deve ser um número entre 1 e 100');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros,
            page: pageNum || 1,
            limit: limitNum || 20
        };
    }
    
    // Criar resposta de erro padronizada
    static criarRespostaErro(erros, status = 400) {
        return {
            success: false,
            error: Array.isArray(erros) ? erros.join(', ') : erros,
            errors: Array.isArray(erros) ? erros : [erros],
            status: status
        };
    }
    
    // Criar resposta de sucesso padronizada
    static criarRespostaSucesso(dados, mensagem = null) {
        const resposta = {
            success: true,
            ...dados
        };
        
        if (mensagem) {
            resposta.message = mensagem;
        }
        
        return resposta;
    }
}

module.exports = ValidationUtils; 