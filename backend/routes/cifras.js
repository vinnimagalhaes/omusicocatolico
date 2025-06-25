const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { Cifra, User, Favorito, Repertorio, RepertorioCifra } = require('../models');
const scraper = require('../services/scraper');
const ocrService = require('../services/ocr');
const router = express.Router();
const cifraImporter = require('../services/cifraImporter');
const CifraScraper = require('../services/scraper');

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/jpg',
            'application/pdf'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo não suportado. Use PNG, JPG ou PDF.'));
        }
    }
});

// 1. LISTAR CIFRAS COM FILTROS E BUSCA
router.get('/', async (req, res) => {
    try {
        const { categoria, search, limit = 50, offset = 0, ordem = 'views' } = req.query;
        
        // Construir filtros - apenas cifras aprovadas são públicas
        const where = { 
            ativo: true,
            status_analise: 'aprovada'
        };
        
        if (categoria && categoria !== 'todas') {
            where.categoria = categoria;
        }
        
        if (search) {
            const searchTerm = search.toLowerCase();
            where[Op.or] = [
                { titulo: { [Op.like]: `%${searchTerm}%` } },
                { artista: { [Op.like]: `%${searchTerm}%` } }
            ];
        }
        
        // Ordenação
        let order = [['views', 'DESC']];
        if (ordem === 'titulo') order = [['titulo', 'ASC']];
        if (ordem === 'artista') order = [['artista', 'ASC']];
        if (ordem === 'recente') order = [['created_at', 'DESC']];
        
        // Buscar cifras
        const { count, rows: cifras } = await Cifra.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        // Formatar resultado
        const cifrasFormatadas = cifras.map(cifra => cifra.toJSON());
        
        res.json({
            cifras: cifrasFormatadas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar cifras:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 2. LISTAR CIFRAS PARA REPERTÓRIOS (públicas + do usuário)
router.get('/para-repertorios', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { categoria, search, limit = 50, offset = 0, ordem = 'views' } = req.query;
        
        // Construir filtros - cifras públicas OU do próprio usuário
        const where = { 
            ativo: true,
            [Op.or]: [
                { status_analise: 'aprovada' }, // Cifras públicas
                { user_id: userId } // Cifras do próprio usuário (qualquer status)
            ]
        };
        
        if (categoria && categoria !== 'todas') {
            where.categoria = categoria;
        }
        
        if (search) {
            const searchTerm = search.toLowerCase();
            where[Op.and] = [
                ...(where[Op.and] || []),
                {
                    [Op.or]: [
                        { titulo: { [Op.like]: `%${searchTerm}%` } },
                        { artista: { [Op.like]: `%${searchTerm}%` } }
                    ]
                }
            ];
        }
        
        // Ordenação
        let order = [['views', 'DESC']];
        if (ordem === 'titulo') order = [['titulo', 'ASC']];
        if (ordem === 'artista') order = [['artista', 'ASC']];
        if (ordem === 'recente') order = [['created_at', 'DESC']];
        
        // Buscar cifras
        const { count, rows: cifras } = await Cifra.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        // Formatar resultado e marcar cifras do próprio usuário
        const cifrasFormatadas = cifras.map(cifra => ({
            ...cifra.toJSON(),
            views: cifra.getViewsFormatadas(),
            minha_cifra: cifra.user_id === userId
        }));
        
        res.json({
            cifras: cifrasFormatadas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar cifras para repertórios:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 3. LISTAR CIFRAS DO USUÁRIO (deve vir antes de /:id)
router.get('/minhas', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;
        
        console.log(`[MINHAS CIFRAS] Usuário ID: ${userId} solicitando cifras`); // Debug
        console.log(`[MINHAS CIFRAS] Limit: ${limit}, Offset: ${offset}`); // Debug
        
        const { count, rows: cifras } = await Cifra.findAndCountAll({
            where: { 
                user_id: userId,
                ativo: true 
                // Não filtrar por status_analise - mostrar todas as cifras do usuário
            },
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        console.log(`[MINHAS CIFRAS] Encontradas ${count} cifras para o usuário ${userId}`); // Debug
        
        const cifrasFormatadas = cifras.map(cifra => ({
            ...cifra.toJSON(),
            views: cifra.getViewsFormatadas()
        }));

        console.log(`[MINHAS CIFRAS] Retornando ${cifrasFormatadas.length} cifras formatadas`); // Debug
        
        res.json({
            cifras: cifrasFormatadas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('[MINHAS CIFRAS] Erro ao buscar cifras do usuário:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 4. LISTAR FAVORITOS DO USUÁRIO
router.get('/user/favoritos', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const favoritos = await Favorito.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Cifra,
                    as: 'cifra',
                    include: [
                        {
                            model: User,
                            as: 'usuario',
                            attributes: ['id', 'nome']
                        }
                    ]
                }
            ],
            order: [['created_at', 'DESC']]
        });
        
        const cifrasFavoritas = favoritos.map(fav => ({
            ...fav.cifra.toJSON(),
            views: fav.cifra.getViewsFormatadas(),
            favoritado_em: fav.created_at
        }));
        
        res.json({
            favoritos: cifrasFavoritas,
            total: favoritos.length
        });
        
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 4. OBTER CATEGORIAS DISPONÍVEIS
router.get('/categorias', async (req, res) => {
    try {
        const categorias = [
            'entrada', 'gloria', 'salmo', 'aleluia', 'ofertorio', 
            'santo', 'comunhao', 'final', 'adoracao', 'maria', 
            'natal', 'pascoa', 'outras'
        ];
        
        res.json(categorias);
        
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 5. BUSCAR CIFRAS (endpoint específico para busca)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Parâmetro de busca "q" é obrigatório' });
        }
        
        const searchTerm = q.toLowerCase();
        
        const cifras = await Cifra.findAll({
            where: {
                ativo: true,
                [Op.or]: [
                    { titulo: { [Op.like]: `%${searchTerm}%` } },
                    { artista: { [Op.like]: `%${searchTerm}%` } },
                    { letra: { [Op.like]: `%${searchTerm}%` } }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['views', 'DESC']],
            limit: 50
        });
        
        const resultados = cifras.map(cifra => ({
            ...cifra.toJSON(),
            views: cifra.getViewsFormatadas()
        }));
        
        res.json({
            query: q,
            resultados,
            total: resultados.length
        });
        
    } catch (error) {
        console.error('Erro ao buscar cifras:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 6. OBTER CIFRA POR ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const cifra = await Cifra.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        if (!cifra) {
            return res.status(404).json({ error: 'Cifra não encontrada' });
        }
        
        // Incrementar views
        await cifra.incrementarViews();
        
        res.json({
            ...cifra.toJSON(),
            views: cifra.getViewsFormatadas()
        });
        
    } catch (error) {
        console.error('Erro ao buscar cifra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 3. CRIAR CIFRA MANUAL
router.post('/manual', authenticateToken, async (req, res) => {
    try {
        const { titulo, artista, tom, categoria, letra, compositor, tags, duracao, youtube_url, spotify_url, dificuldade, bpm, capo } = req.body;
        
        // Validação
        if (!titulo || !artista || !letra || !tom || !categoria) {
            return res.status(400).json({
                success: false,
                message: 'Título, artista, tom, categoria e letra são obrigatórios'
            });
        }

        // Criar nova cifra
        const novaCifra = await Cifra.create({
            titulo: titulo.trim(),
            artista: artista.trim(),
            compositor: compositor || artista.trim(),
            tom: tom.trim(),
            categoria,
            letra: letra.trim(),
            tags: Array.isArray(tags) ? tags : [],
            duracao,
            youtube_url,
            spotify_url,
            dificuldade: dificuldade || 'medio',
            bpm,
            capo,
            user_id: req.user.id,
            status_analise: 'privada'  // Definir explicitamente como privada
        });

        res.status(201).json({
            success: true,
            message: 'Cifra criada com sucesso!',
            cifra: novaCifra
        });

    } catch (error) {
        console.error('Erro ao criar cifra manual:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// 4. IMPORTAR CIFRA VIA URL
router.post('/import-url', authenticateToken, async (req, res) => {
    try {
        const { url } = req.body;
        const userId = req.user.id;

        console.log(`🔗 Usuário ${userId} importando cifra de: ${url}`);

        // Validar URL
        if (!url || !url.trim()) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }

        // Validar formato da URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'URL inválida'
            });
        }

        // Verificar se já existe cifra com esta URL
        // const existingCifra = await Cifra.findOne({
        //     where: {
        //         url_original: url,
        //         ativo: true
        //     }
        // });

        // Verificação alternativa por título e artista (temporária)
        let existingCifra = null;
        
        // Importar cifra
        const importResult = await cifraImporter.importFromUrl(url, userId);

        if (!importResult.success) {
            return res.status(400).json({
                success: false,
                message: importResult.error
            });
        }

        // Salvar no banco de dados
        const cifraData = importResult.data;
        
        // Corrigir categoria para enum válido
        let categoria = cifraData.categoria;
        if (categoria === 'geral') {
            categoria = 'outras'; // Mapeamento para enum válido
        }
        
        // Corrigir tags para array se for string
        let tags = cifraData.tags;
        if (typeof tags === 'string') {
            tags = tags.split(',').map(tag => tag.trim());
        }
        
        const novaCifra = await Cifra.create({
            titulo: cifraData.titulo,
            artista: cifraData.artista,
            tom: cifraData.tom,
            categoria: categoria,
            letra: cifraData.letra,
            tags: tags,
            dificuldade: 'medio', // Default
            ativo: true,
            user_id: userId,
            status_analise: 'privada'  // Definir explicitamente como privada
            // url_original: url,  // Temporariamente comentado até coluna ser criada
            // fonte: 'link_importado'  // Esta coluna também não existe
        });

        console.log(`✅ Cifra importada e salva com ID: ${novaCifra.id}`);

        res.json({
            success: true,
            message: `Cifra importada com sucesso do ${importResult.source}`,
            cifra: {
                id: novaCifra.id,
                titulo: novaCifra.titulo,
                artista: novaCifra.artista,
                tom: novaCifra.tom,
                categoria: novaCifra.categoria,
                letra: novaCifra.letra,
                fonte: importResult.source
                // url_original: url  // Temporariamente removido
            }
        });

    } catch (error) {
        console.error('❌ Erro ao importar cifra:', error);
        
        // Log detalhado do erro
        if (error.name === 'SequelizeValidationError') {
            console.error('🔍 Erros de validação:', error.errors);
        }
        console.error('📍 Stack trace:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor ao importar cifra',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// 5. UPLOAD DE ARQUIVO (OCR)
router.post('/upload', authenticateToken, upload.single('arquivo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }

        const filePath = req.file.path;
        const fileType = req.file.mimetype;

        // Processar arquivo com OCR
        const ocrResult = await ocrService.processFile(filePath, fileType);
        
        if (!ocrResult.success) {
            throw new Error('Falha no processamento OCR');
        }

        // Extrair informações da cifra do texto estruturado
        const cifraInfo = ocrService.extractCifraInfo(ocrResult.text);
        
        // Detectar categoria
        const categoria = scraper.detectCategory(cifraInfo.titulo, cifraInfo.letra);

        // Criar nova cifra
        const novaCifra = await Cifra.create({
            titulo: cifraInfo.titulo,
            artista: cifraInfo.artista,
            tom: cifraInfo.tom,
            categoria: categoria,
            letra: cifraInfo.letra,
            tags: ['OCR', req.file.originalname],
            user_id: req.user.id,
            status_analise: 'privada'  // Definir explicitamente como privada
        });

        // Limpar arquivo temporário
        fs.unlink(filePath, (err) => {
            if (err) console.error('Erro ao deletar arquivo:', err);
        });

        res.status(201).json({
            success: true,
            message: 'Cifra criada via OCR com sucesso!',
            cifra: novaCifra,
            ocrText: ocrResult.text, // Texto estruturado com layout preservado
            originalText: ocrResult.originalText, // Texto original corrido
            processedBy: ocrResult.processedBy || 'Tesseract OCR com Layout',
            words: ocrResult.words // Para debug se necessário
        });

    } catch (error) {
        console.error('Erro no upload OCR:', error);
        
        // Limpar arquivo em caso de erro
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Erro ao deletar arquivo:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Erro no processamento do arquivo'
        });
    }
});

// 6. ATUALIZAR CIFRA
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const cifra = await Cifra.findByPk(id);
        
        if (!cifra) {
            return res.status(404).json({ error: 'Cifra não encontrada' });
        }
        
        // Verificar permissão (apenas dono, admin, ou cifras sem dono - importadas)
        const isOwner = cifra.user_id === req.user.id;
        const isAdmin = req.user.role === 'admin';
        const isImportedCifra = cifra.user_id === null; // Cifras importadas sem dono
        
        if (!isOwner && !isAdmin && !isImportedCifra) {
            return res.status(403).json({ error: 'Sem permissão para editar esta cifra' });
        }
        
        // Se é uma cifra importada sendo editada, atribuir ao usuário atual
        if (isImportedCifra) {
            console.log(`🔄 Atribuindo cifra importada ${id} ao usuário ${req.user.id}`);
        }
        
        const camposPermitidos = ['titulo', 'artista', 'compositor', 'tom', 'categoria', 'letra', 'tags', 'duracao', 'youtube_url', 'spotify_url', 'dificuldade', 'bpm', 'capo'];
        const atualizacoes = {};
        
        camposPermitidos.forEach(campo => {
            if (req.body[campo] !== undefined) {
                atualizacoes[campo] = req.body[campo];
            }
        });
        
        // Se é uma cifra importada sendo editada, atribuir ao usuário atual
        if (isImportedCifra) {
            atualizacoes.user_id = req.user.id;
        }
        
        await cifra.update(atualizacoes);
        
        res.json({
            success: true,
            message: 'Cifra atualizada com sucesso!',
            cifra
        });
        
    } catch (error) {
        console.error('Erro ao atualizar cifra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 7. DELETAR CIFRA
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const cifra = await Cifra.findByPk(id);
        
        if (!cifra) {
            return res.status(404).json({ error: 'Cifra não encontrada' });
        }
        
        // Verificar permissão (apenas dono ou admin)
        if (cifra.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Sem permissão para deletar esta cifra' });
        }
        
        await cifra.destroy();
        
        res.json({
            success: true,
            message: 'Cifra deletada com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao deletar cifra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 8. FAVORITAR/DESFAVORITAR CIFRA
router.post('/:id/favorito', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const cifra = await Cifra.findByPk(id);
        if (!cifra) {
            return res.status(404).json({ error: 'Cifra não encontrada' });
        }
        
        // Verificar se já é favorito
        const favoritoExistente = await Favorito.findOne({
            where: { user_id: userId, cifra_id: id }
        });
        
        if (favoritoExistente) {
            // Remover dos favoritos
            await favoritoExistente.destroy();
            res.json({
                success: true,
                message: 'Cifra removida dos favoritos',
                favorito: false
            });
        } else {
            // Adicionar aos favoritos
            await Favorito.create({
                user_id: userId,
                cifra_id: id
            });
            res.json({
                success: true,
                message: 'Cifra adicionada aos favoritos',
                favorito: true
            });
        }
        
    } catch (error) {
        console.error('Erro ao favoritar cifra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 9. OBTER ESTATÍSTICAS
router.get('/stats', async (req, res) => {
    try {
        const totalCifras = await Cifra.count({ where: { ativo: true } });
        const totalViews = await Cifra.sum('views', { where: { ativo: true } });
        
        // Estatísticas por categoria
        const categoriaStats = await Cifra.findAll({
            attributes: ['categoria', [Cifra.sequelize.fn('COUNT', 'categoria'), 'count']],
            where: { ativo: true },
            group: 'categoria',
            raw: true
        });
        
        // Artistas mais populares
        const artistasPopulares = await Cifra.findAll({
            attributes: ['artista', [Cifra.sequelize.fn('COUNT', 'artista'), 'cifras'], [Cifra.sequelize.fn('SUM', Cifra.sequelize.col('views')), 'total_views']],
            where: { ativo: true },
            group: 'artista',
            order: [[Cifra.sequelize.fn('SUM', Cifra.sequelize.col('views')), 'DESC']],
            limit: 5,
            raw: true
        });
        
        // Cifras mais populares
        const cifrasPopulares = await Cifra.findAll({
            attributes: ['id', 'titulo', 'artista', 'views'],
            where: { ativo: true },
            order: [['views', 'DESC']],
            limit: 5
        });
        
        const stats = {
            totalCifras,
            totalViews: totalViews || 0,
            categorias: categoriaStats.reduce((acc, cat) => {
                acc[cat.categoria] = cat.count;
                return acc;
            }, {}),
            artistasPopulares: artistasPopulares.map(a => ({
                artista: a.artista,
                cifras: a.cifras,
                views: a.total_views
            })),
            cifrasPopulares: cifrasPopulares.map(c => ({
                id: c.id,
                titulo: c.titulo,
                artista: c.artista,
                views: c.getViewsFormatadas()
            }))
        };
        
        res.json(stats);
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// TESTE: Rota para verificar se URL é suportada (sem autenticação)
router.post('/verify-url', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }
        
        // Verificar se site é suportado
        let siteConfig = null;
        try {
            siteConfig = cifraImporter.identifySite(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Site não suportado'
            });
        }
        
        res.json({
            success: true,
            supported: !!siteConfig,
            site: siteConfig?.name || null
        });
        
    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// TESTE: Rota simples para debug (sem autenticação)
router.post('/test-check-url', async (req, res) => {
    try {
        console.log('🧪 TESTE: Rota de verificação de URL simples');
        res.json({
            success: true,
            message: 'Rota funcionando',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ TESTE: Erro na rota simples:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na rota de teste'
        });
    }
});

// TESTE: Rota para testar scraper diretamente (sem autenticação)
router.post('/test-scraper', async (req, res) => {
    try {
        console.log('🧪 TESTE: Testando scraper diretamente');
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }
        
        console.log('🔗 URL para teste:', url);
        
        // Importar o scraper
        const CifraScraper = require('../services/scraper');
        const scraper = new CifraScraper();
        
        // Testar extração
        const resultado = await scraper.scrapeCifra(url);
        
        console.log('✅ Resultado do scraper:', {
            titulo: resultado.titulo,
            artista: resultado.artista,
            tom: resultado.tom,
            tamanhoLetra: resultado.letra?.length || 0
        });
        
        res.json({
            success: true,
            message: 'Scraper funcionando',
            resultado: resultado,
            preview: resultado.letra?.substring(0, 500) + '...'
        });
        
    } catch (error) {
        console.error('❌ TESTE: Erro no scraper:', error);
        res.status(500).json({
            success: false,
            message: 'Erro no scraper: ' + error.message,
            stack: error.stack
        });
    }
});

// NOVO: Verificar se URL é suportada (sem autenticação para verificação básica)
router.post('/check-url', async (req, res) => {
    try {
        console.log('🔍 Iniciando verificação de URL...');
        const { url } = req.body;
        console.log('📝 URL recebida:', url);

        if (!url || !url.trim()) {
            console.log('❌ URL vazia');
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }

        // Validar formato da URL
        try {
            new URL(url);
            console.log('✅ URL válida');
        } catch (error) {
            console.log('❌ URL inválida:', error.message);
            return res.status(400).json({
                success: false,
                message: 'URL inválida'
            });
        }

        // Verificar se site é suportado
        console.log('🔍 Verificando suporte do site...');
        let siteConfig = null;
        
        try {
            siteConfig = cifraImporter.identifySite(url);
            console.log('📱 Site config:', siteConfig);
        } catch (error) {
            console.error('❌ Erro ao identificar site:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao identificar site'
            });
        }
        
        if (!siteConfig) {
            console.log('❌ Site não suportado');
            return res.json({
                success: false,
                supported: false,
                message: 'Site não suportado para importação',
                supportedSites: [
                    'cifraclub.com.br',
                    'musicasparamissa.com.br',
                    'vagalume.com.br', 
                    'letras.mus.br',
                    'superpartituras.com.br'
                ]
            });
        }

        console.log('✅ Site suportado:', siteConfig.name);

        // Resposta simples (sem verificação de duplicata por enquanto)
        let existingCifra = null;
        
        console.log('✅ Enviando resposta de sucesso');
        res.json({
            success: true,
            supported: true,
            site: siteConfig.name,
            alreadyExists: !!existingCifra,
            existingCifraId: existingCifra?.id || null
        });

    } catch (error) {
        console.error('❌ Erro geral ao verificar URL:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

// PÚBLICO: Verificar se URL é suportada (sem autenticação)
router.post('/check-url-public', async (req, res) => {
    try {
        console.log('🔍 Verificação pública de URL...');
        const { url } = req.body;

        if (!url || !url.trim()) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }

        // Validar formato da URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'URL inválida'
            });
        }

        // Verificar se site é suportado
        let siteConfig = null;
        
        try {
            siteConfig = cifraImporter.identifySite(url);
        } catch (error) {
            console.error('❌ Erro ao identificar site:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao identificar site'
            });
        }
        
        if (!siteConfig) {
            return res.json({
                success: false,
                supported: false,
                message: 'Site não suportado para importação',
                supportedSites: [
                    'cifraclub.com.br',
                    'musicasparamissa.com.br',
                    'vagalume.com.br', 
                    'letras.mus.br',
                    'superpartituras.com.br'
                ]
            });
        }

        res.json({
            success: true,
            supported: true,
            site: siteConfig.name,
            message: 'Site suportado para importação'
        });

    } catch (error) {
        console.error('❌ Erro ao verificar URL:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// PÚBLICO: Teste simples de criação de cifra
router.post('/test-create-cifra', async (req, res) => {
    try {
        const novaCifra = await Cifra.create({
            titulo: 'A ESCOLHIDA',
            artista: 'Músicas para Missa',
            compositor: 'Músicas para Missa',
            tom: 'D',
            categoria: 'mariana',
            letra: 'D                     F#m\nUMA ENTRE TODAS FOI A ESCOLHIDA\nBm                     F#m\nFOSTE TU MARIA A SERVA PREFERIDA',
            letra_original: 'D                     F#m\nUMA ENTRE TODAS FOI A ESCOLHIDA\nBm                     F#m\nFOSTE TU MARIA A SERVA PREFERIDA',
            tags: ['maria', 'mariana'],
            youtube_url: null,
            spotify_url: null,
            dificuldade: 'medio',
            bpm: null,
            capo: null,
            user_id: null
        });

        res.json({
            success: true,
            message: 'Cifra criada com sucesso!',
            cifra: {
                id: novaCifra.id,
                titulo: novaCifra.titulo,
                artista: novaCifra.artista,
                tom: novaCifra.tom,
                categoria: novaCifra.categoria
            }
        });

    } catch (error) {
        console.error('❌ Erro ao criar cifra:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

// PÚBLICO: Importar cifra via URL (sem autenticação para teste)
router.post('/import-url-public', async (req, res) => {
    try {
        const { url } = req.body;
        console.log(`🔗 Importação pública de cifra de: ${url}`);

        // Validar URL
        if (!url || !url.trim()) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }

        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'URL inválida'
            });
        }

        // Verificar se site é suportado
        let siteConfig;
        try {
            siteConfig = cifraImporter.identifySite(url);
        } catch (error) {
            console.error('❌ Erro ao identificar site:', error);
            return res.status(400).json({
                success: false,
                message: 'Site não suportado para importação'
            });
        }

        if (!siteConfig) {
            return res.status(400).json({
                success: false,
                message: 'Site não suportado para importação'
            });
        }

        console.log(`✅ Site ${siteConfig.name} suportado`);

        // Extrair dados da cifra usando o scraper diretamente
        let dadosCifra;
        try {
            const scraperInstance = new CifraScraper();
            dadosCifra = await scraperInstance.scrapeCifra(url);
            console.log(`✅ Dados extraídos do scraper:`, dadosCifra);
            console.log(`✅ Dados extraídos - detalhes:`, {
                titulo: dadosCifra?.titulo,
                artista: dadosCifra?.artista,
                tom: dadosCifra?.tom,
                letra: dadosCifra?.letra ? `${dadosCifra.letra.length} chars` : 'undefined'
            });
        } catch (error) {
            console.error('❌ Erro ao extrair dados:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao extrair dados da cifra: ' + error.message
            });
        }

        // Validar dados extraídos
        if (!dadosCifra || !dadosCifra.titulo || !dadosCifra.artista || !dadosCifra.letra) {
            console.error('❌ Dados incompletos:', {
                dadosCifra: dadosCifra,
                titulo: dadosCifra?.titulo,
                artista: dadosCifra?.artista,
                letra: dadosCifra?.letra ? `${dadosCifra.letra.length} chars` : 'undefined'
            });
            return res.status(400).json({
                success: false,
                message: 'Dados da cifra incompletos. Título, artista e letra são obrigatórios.'
            });
        }

        // Verificar se cifra já existe (temporariamente desabilitado para debug)
        // let cifraExistente = null;
        // if (dadosCifra.titulo && dadosCifra.artista) {
        //     cifraExistente = await Cifra.findOne({
        //         where: {
        //             titulo: dadosCifra.titulo,
        //             artista: dadosCifra.artista,
        //             ativo: true
        //         }
        //     });
        // }

        // if (cifraExistente) {
        //     return res.json({
        //         success: false,
        //         message: 'Esta cifra já foi importada',
        //         existingCifra: {
        //             id: cifraExistente.id,
        //             titulo: cifraExistente.titulo,
        //             artista: cifraExistente.artista
        //         }
        //     });
        // }

        // Criar nova cifra (sem user_id para teste)
        const novaCifra = await Cifra.create({
            titulo: dadosCifra.titulo || 'Título Teste',
            artista: dadosCifra.artista || 'Artista Teste',
            compositor: dadosCifra.compositor || dadosCifra.artista || 'Compositor Teste',
            tom: dadosCifra.tom || 'C',
            categoria: dadosCifra.categoria || 'outras',
            letra: dadosCifra.letra || 'Letra teste',
            letra_original: dadosCifra.letra_original || dadosCifra.letra || 'Letra teste',
            tags: Array.isArray(dadosCifra.tags) ? dadosCifra.tags : [],
            youtube_url: dadosCifra.youtube_url || null,
            spotify_url: dadosCifra.spotify_url || null,
            dificuldade: dadosCifra.dificuldade || 'medio',
            bpm: dadosCifra.bpm || null,
            capo: dadosCifra.capo || null,
            user_id: null // Sem usuário para teste
        });

        console.log(`✅ Cifra criada com ID: ${novaCifra.id}`);

        res.json({
            success: true,
            message: 'Cifra importada com sucesso!',
            cifra: {
                id: novaCifra.id,
                titulo: novaCifra.titulo,
                artista: novaCifra.artista,
                compositor: novaCifra.compositor,
                tom: novaCifra.tom,
                categoria: novaCifra.categoria,
                letra: novaCifra.letra,
                tags: novaCifra.tags,
                dificuldade: novaCifra.dificuldade,
                bpm: novaCifra.bpm,
                capo: novaCifra.capo
            }
        });

    } catch (error) {
        console.error('❌ Erro geral na importação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor: ' + error.message
        });
    }
});

// TESTE: Rota para debug direto do scraper
router.post('/debug-scraper', async (req, res) => {
    try {
        console.log('🔧 DEBUG: Iniciando teste do scraper');
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL é obrigatória'
            });
        }
        
        console.log(`🔧 DEBUG: URL recebida: ${url}`);
        
        // Testar scraper diretamente
        const scraper = new CifraScraper();
        console.log('🔧 DEBUG: Scraper criado');
        
        const resultado = await scraper.scrapeCifraClub(url);
        console.log('🔧 DEBUG: Scraper executado com sucesso');
        
        res.json({
            success: true,
            data: resultado,
            message: 'Scraper executado com sucesso'
        });
        
    } catch (error) {
        console.error('🔧 DEBUG: Erro no scraper:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: error.stack
        });
    }
});

// ROTA: Enviar cifra para análise da comunidade
router.post('/:id/enviar-para-analise', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Buscar a cifra
        const cifra = await Cifra.findOne({
            where: {
                id: id,
                user_id: userId,
                ativo: true
            }
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada ou você não tem permissão para editá-la'
            });
        }
        
        // Verificar se já não está pendente ou aprovada
        if (cifra.status_analise === 'pendente') {
            return res.status(400).json({
                success: false,
                message: 'Esta cifra já foi enviada para análise'
            });
        }
        
        if (cifra.status_analise === 'aprovada') {
            return res.status(400).json({
                success: false,
                message: 'Esta cifra já está aprovada e pública'
            });
        }
        
        // Atualizar status para pendente
        await cifra.update({
            status_analise: 'pendente',
            data_submissao: new Date(),
            observacoes_analise: null // Limpar observações anteriores
        });
        
        res.json({
            success: true,
            message: 'Cifra enviada para análise com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao enviar cifra para análise:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ROTA: Editar cifra do usuário
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { titulo, artista, compositor, tom, categoria, letra, tags, duracao, youtube_url, spotify_url, dificuldade, bpm, capo } = req.body;
        
        // Buscar a cifra
        const cifra = await Cifra.findOne({
            where: {
                id: id,
                user_id: userId,
                ativo: true
            }
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada ou você não tem permissão para editá-la'
            });
        }
        
        // Validação
        if (!titulo || !artista || !letra || !tom || !categoria) {
            return res.status(400).json({
                success: false,
                message: 'Título, artista, tom, categoria e letra são obrigatórios'
            });
        }
        
        // Atualizar cifra
        await cifra.update({
            titulo: titulo.trim(),
            artista: artista.trim(),
            compositor: compositor || artista.trim(),
            tom: tom.trim(),
            categoria,
            letra: letra.trim(),
            tags: Array.isArray(tags) ? tags : [],
            duracao,
            youtube_url,
            spotify_url,
            dificuldade: dificuldade || 'medio',
            bpm,
            capo,
            // Se estava rejeitada e foi editada, volta para privada
            status_analise: cifra.status_analise === 'rejeitada' ? 'privada' : cifra.status_analise,
            observacoes_analise: cifra.status_analise === 'rejeitada' ? null : cifra.observacoes_analise
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
            message: 'Erro interno do servidor'
        });
    }
});

// ROTA: Excluir cifra do usuário
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        // Buscar a cifra
        const cifra = await Cifra.findOne({
            where: {
                id: id,
                user_id: userId,
                ativo: true
            }
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada ou você não tem permissão para excluí-la'
            });
        }
        
        // Marcar como inativa (soft delete)
        await cifra.update({
            ativo: false
        });
        
        res.json({
            success: true,
            message: 'Cifra excluída com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao excluir cifra:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 