const { Cifra, User } = require('../models');
const OCRService = require('../services/ocr');
const CifraImporter = require('../services/cifraImporter');

class CifrasController {
    // Listar todas as cifras
    static async listarCifras(req, res) {
        try {
            const { categoria, search, userId } = req.query;
            
            let whereClause = {};
            
            if (categoria && categoria !== 'todas') {
                whereClause.categoria = categoria;
            }
            
            if (search) {
                const { Op } = require('sequelize');
                whereClause[Op.or] = [
                    { titulo: { [Op.like]: `%${search}%` } },
                    { artista: { [Op.like]: `%${search}%` } },
                    { conteudo: { [Op.like]: `%${search}%` } }
                ];
            }
            
            const cifras = await Cifra.findAll({
                where: whereClause,
                include: userId ? [{
                    model: User,
                    as: 'autor',
                    attributes: ['id', 'nome', 'email']
                }] : [],
                order: [['updatedAt', 'DESC']]
            });
            
            res.json({
                success: true,
                cifras: cifras,
                total: cifras.length
            });
        } catch (error) {
            console.error('Erro ao listar cifras:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Obter cifra por ID
    static async obterCifra(req, res) {
        try {
            const { id } = req.params;
            
            const cifra = await Cifra.findByPk(id, {
                include: [{
                    model: User,
                    as: 'autor',
                    attributes: ['id', 'nome', 'email']
                }]
            });
            
            if (!cifra) {
                return res.status(404).json({
                    success: false,
                    error: 'Cifra não encontrada'
                });
            }
            
            res.json({
                success: true,
                cifra: cifra
            });
        } catch (error) {
            console.error('Erro ao obter cifra:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Criar nova cifra
    static async criarCifra(req, res) {
        try {
            const { titulo, artista, categoria, tom, conteudo } = req.body;
            const userId = req.user?.id;
            
            // Validações básicas
            if (!titulo || !artista || !conteudo) {
                return res.status(400).json({
                    success: false,
                    error: 'Título, artista e conteúdo são obrigatórios'
                });
            }
            
            const novaCifra = await Cifra.create({
                titulo: titulo.trim(),
                artista: artista.trim(),
                categoria: categoria || 'outras',
                tom: tom || 'C',
                conteudo: conteudo.trim(),
                userId: userId,
                fonte: 'usuario'
            });
            
            res.status(201).json({
                success: true,
                message: 'Cifra criada com sucesso!',
                cifra: novaCifra
            });
        } catch (error) {
            console.error('Erro ao criar cifra:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar cifra
    static async atualizarCifra(req, res) {
        try {
            const { id } = req.params;
            const { titulo, artista, categoria, tom, conteudo } = req.body;
            const userId = req.user?.id;
            
            const cifra = await Cifra.findByPk(id);
            
            if (!cifra) {
                return res.status(404).json({
                    success: false,
                    error: 'Cifra não encontrada'
                });
            }
            
            // Verificar se o usuário é o autor ou é master
            if (cifra.userId !== userId && !req.user?.isMaster) {
                return res.status(403).json({
                    success: false,
                    error: 'Permissão negada'
                });
            }
            
            await cifra.update({
                titulo: titulo?.trim() || cifra.titulo,
                artista: artista?.trim() || cifra.artista,
                categoria: categoria || cifra.categoria,
                tom: tom || cifra.tom,
                conteudo: conteudo?.trim() || cifra.conteudo
            });
            
            res.json({
                success: true,
                message: 'Cifra atualizada com sucesso!',
                cifra: cifra
            });
        } catch (error) {
            console.error('Erro ao atualizar cifra:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Deletar cifra
    static async deletarCifra(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            
            const cifra = await Cifra.findByPk(id);
            
            if (!cifra) {
                return res.status(404).json({
                    success: false,
                    error: 'Cifra não encontrada'
                });
            }
            
            // Verificar se o usuário é o autor ou é master
            if (cifra.userId !== userId && !req.user?.isMaster) {
                return res.status(403).json({
                    success: false,
                    error: 'Permissão negada'
                });
            }
            
            await cifra.destroy();
            
            res.json({
                success: true,
                message: 'Cifra deletada com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao deletar cifra:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Processar arquivo OCR
    static async processarOCR(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Nenhum arquivo enviado'
                });
            }
            
            const resultados = [];
            const ocrService = new OCRService();
            
            for (const arquivo of req.files) {
                try {
                    const resultado = await ocrService.processFile(arquivo.path, arquivo.mimetype);
                    resultados.push({
                        arquivo: arquivo.originalname,
                        success: true,
                        texto: resultado.text,
                        processedBy: resultado.processedBy
                    });
                } catch (error) {
                    resultados.push({
                        arquivo: arquivo.originalname,
                        success: false,
                        error: error.message
                    });
                }
            }
            
            res.json({
                success: true,
                resultados: resultados
            });
        } catch (error) {
            console.error('Erro no processamento OCR:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }

    // Importar cifra de URL
    static async importarDeUrl(req, res) {
        try {
            const { url } = req.body;
            
            if (!url) {
                return res.status(400).json({
                    success: false,
                    error: 'URL é obrigatória'
                });
            }
            
            const importer = new CifraImporter();
            const resultado = await importer.importFromUrl(url);
            
            if (resultado.success && resultado.cifra) {
                // Salvar cifra importada
                const novaCifra = await Cifra.create({
                    titulo: resultado.cifra.titulo,
                    artista: resultado.cifra.artista,
                    categoria: resultado.cifra.categoria || 'outras',
                    tom: resultado.cifra.tom || 'C',
                    conteudo: resultado.cifra.conteudo,
                    userId: req.user?.id,
                    fonte: resultado.fonte || 'importacao'
                });
                
                res.json({
                    success: true,
                    message: 'Cifra importada com sucesso!',
                    cifra: novaCifra
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: resultado.error || 'Erro ao importar cifra'
                });
            }
        } catch (error) {
            console.error('Erro ao importar cifra:', error);
            res.status(500).json({
                success: false,
                error: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = CifrasController; 