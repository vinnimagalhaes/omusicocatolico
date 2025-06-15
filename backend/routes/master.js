const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Cifra, Repertorio, Content } = require('../models');
const { authenticateMaster } = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../frontend/uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'content-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)'));
        }
    }
});

// Dashboard - estatísticas gerais do sistema
router.get('/dashboard', authenticateMaster, async (req, res) => {
    try {
        // Estatísticas básicas
        const totalUsers = await User.count();
        const totalCifras = await Cifra.count();
        const totalRepertorios = await Repertorio.count();
        const publicRepertorios = await Repertorio.count({ 
            where: { publico: true } 
        });

        // Usuários cadastrados hoje
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newUsersToday = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            }
        });

        // Cifras criadas hoje
        const newCifrasToday = await Cifra.count({
            where: {
                createdAt: {
                    [Op.gte]: today
                }
            }
        });

        // Atividades recentes (últimos 10 eventos)
        const recentUsers = await User.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            attributes: ['nome', 'email', 'createdAt']
        });

        const recentCifras = await Cifra.findAll({
            order: [['createdAt', 'DESC']],
            limit: 5,
            include: [{
                model: User,
                as: 'usuario',
                attributes: ['nome']
            }],
            attributes: ['titulo', 'artista', 'createdAt']
        });

        // Formatando atividades recentes
        const recentActivity = [];
        
        recentUsers.forEach(user => {
            recentActivity.push({
                icon: 'fas fa-user-plus',
                description: `Novo usuário: ${user.nome}`,
                timestamp: user.createdAt
            });
        });

        recentCifras.forEach(cifra => {
            recentActivity.push({
                icon: 'fas fa-music',
                description: `Nova cifra: ${cifra.titulo} - ${cifra.artista}`,
                timestamp: cifra.createdAt
            });
        });

        // Ordenar por data mais recente
        recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Uptime simples (pode ser melhorado)
        const uptime = process.uptime();
        const uptimeFormatted = formatUptime(uptime);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    newUsersToday,
                    totalCifras,
                    newCifrasToday,
                    totalRepertorios,
                    publicRepertorios,
                    uptime: uptimeFormatted
                },
                recentActivity: recentActivity.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Erro no dashboard master:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Listar todos os usuários
router.get('/users', authenticateMaster, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id', 'nome', 'email', 'ativo', 'role', 
                'createdAt', 'updatedAt', 'ultimo_acesso'
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Criar novo usuário
router.post('/users', authenticateMaster, async (req, res) => {
    try {
        const { nome, email, senha, role = 'user' } = req.body;

        // Validação básica
        if (!nome || !email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Nome, email e senha são obrigatórios'
            });
        }

        // Verificar se email já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Criar usuário
        const newUser = await User.create({
            nome,
            email,
            senha: hashedPassword,
            role: ['user', 'admin'].includes(role) ? role : 'user',
            ativo: true
        });

        res.json({
            success: true,
            message: 'Usuário criado com sucesso',
            user: {
                id: newUser.id,
                nome: newUser.nome,
                email: newUser.email,
                role: newUser.role,
                ativo: newUser.ativo
            }
        });

    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Promover usuário a admin
router.put('/users/:id/promote', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: 'Usuário já é administrador'
            });
        }

        await user.update({ role: 'admin' });

        res.json({
            success: true,
            message: 'Usuário promovido a administrador com sucesso'
        });

    } catch (error) {
        console.error('Erro ao promover usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Alternar status do usuário (ativar/banir)
router.put('/users/:id/toggle-status', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        const { ativo } = req.body;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Não permitir banir masters
        const masterEmails = [
            'master@omusicacatolico.com',
            'admin@omusicacatolico.com', 
            'vinicius@omusicacatolico.com'
        ];

        if (masterEmails.includes(user.email) && ativo === false) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível banir usuários master'
            });
        }

        await user.update({ ativo: Boolean(ativo) });

        res.json({
            success: true,
            message: `Usuário ${ativo ? 'reativado' : 'banido'} com sucesso`
        });

    } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Deletar usuário
router.delete('/users/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        // Não permitir deletar masters
        const masterEmails = [
            'master@omusicacatolico.com',
            'admin@omusicacatolico.com', 
            'vinicius@omusicacatolico.com'
        ];

        if (masterEmails.includes(user.email)) {
            return res.status(400).json({
                success: false,
                message: 'Não é possível deletar usuários master'
            });
        }

        // Deletar relacionamentos primeiro (cifras, repertórios, etc.)
        await Cifra.destroy({ where: { usuario_id: id } });
        await Repertorio.destroy({ where: { usuario_id: id } });
        
        // Deletar usuário
        await user.destroy();

        res.json({
            success: true,
            message: 'Usuário deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Buscar usuário específico
router.get('/users/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id, {
            attributes: [
                'id', 'nome', 'email', 'ativo', 'role', 
                'createdAt', 'updatedAt', 'ultimo_acesso'
            ],
            include: [
                {
                    model: Cifra,
                    attributes: ['id', 'titulo', 'artista', 'createdAt']
                },
                {
                    model: Repertorio,
                    attributes: ['id', 'nome', 'publico', 'createdAt']
                }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Estatísticas avançadas
router.get('/stats', authenticateMaster, async (req, res) => {
    try {
        // Estatísticas por período
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Usuários por mês
        const usersLastMonth = await User.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Cifras por mês  
        const cifrasLastMonth = await Cifra.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Usuários mais ativos (mais cifras)
        const activeUsers = await User.findAll({
            attributes: [
                'id', 'nome', 'email',
                [User.sequelize.fn('COUNT', User.sequelize.col('Cifras.id')), 'cifrascCount']
            ],
            include: [{
                model: Cifra,
                attributes: []
            }],
            group: ['User.id'],
            order: [[User.sequelize.fn('COUNT', User.sequelize.col('Cifras.id')), 'DESC']],
            limit: 10
        });

        // Top artistas/bandas mais cifradas
        const topArtists = await Cifra.findAll({
            attributes: [
                'artista',
                [Cifra.sequelize.fn('COUNT', Cifra.sequelize.col('artista')), 'count']
            ],
            group: ['artista'],
            order: [[Cifra.sequelize.fn('COUNT', Cifra.sequelize.col('artista')), 'DESC']],
            limit: 10
        });

        res.json({
            success: true,
            data: {
                monthlyStats: {
                    usersLastMonth,
                    cifrasLastMonth
                },
                activeUsers,
                topArtists
            }
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Função auxiliar para formatar uptime
function formatUptime(uptimeSeconds) {
    const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
    const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else {
        return `${minutes}m`;
    }
}

// === ADMINISTRAÇÃO DE CIFRAS ===

// Listar todas as cifras para administração
router.get('/cifras', authenticateMaster, async (req, res) => {
    try {
        const { search, categoria, ordem = 'recente', limit = 50, offset = 0 } = req.query;
        
        const where = {};
        
        // Filtro por categoria
        if (categoria && categoria !== 'todas') {
            where.categoria = categoria;
        }
        
        // Busca por texto
        if (search) {
            const searchTerm = search.toLowerCase();
            where[Op.or] = [
                { titulo: { [Op.iLike]: `%${searchTerm}%` } },
                { artista: { [Op.iLike]: `%${searchTerm}%` } },
                { letra: { [Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        
        // Ordenação
        let order = [['created_at', 'DESC']];
        if (ordem === 'titulo') order = [['titulo', 'ASC']];
        if (ordem === 'artista') order = [['artista', 'ASC']];
        if (ordem === 'views') order = [['views', 'DESC']];
        
        const { count, rows: cifras } = await Cifra.findAndCountAll({
            where,
            order,
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        const cifrasFormatadas = cifras.map(cifra => ({
            ...cifra.toJSON(),
            views_formatadas: cifra.getViewsFormatadas()
        }));
        
        res.json({
            success: true,
            cifras: cifrasFormatadas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar cifras (master):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Obter cifra específica para edição
router.get('/cifras/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const cifra = await Cifra.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        res.json({
            success: true,
            cifra: cifra
        });
        
    } catch (error) {
        console.error('Erro ao buscar cifra (master):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Editar cifra
router.put('/cifras/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, artista, compositor, tom, categoria, letra, tags, youtube_url, spotify_url, dificuldade, bpm, capo, ativo } = req.body;
        
        const cifra = await Cifra.findByPk(id);
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        // Atualizar campos
        const atualizacoes = {};
        if (titulo !== undefined) atualizacoes.titulo = titulo.trim();
        if (artista !== undefined) atualizacoes.artista = artista.trim();
        if (compositor !== undefined) atualizacoes.compositor = compositor?.trim();
        if (tom !== undefined) atualizacoes.tom = tom;
        if (categoria !== undefined) atualizacoes.categoria = categoria;
        if (letra !== undefined) atualizacoes.letra = letra.trim();
        if (tags !== undefined) atualizacoes.tags = Array.isArray(tags) ? tags : [];
        if (youtube_url !== undefined) atualizacoes.youtube_url = youtube_url?.trim();
        if (spotify_url !== undefined) atualizacoes.spotify_url = spotify_url?.trim();
        if (dificuldade !== undefined) atualizacoes.dificuldade = dificuldade;
        if (bpm !== undefined) atualizacoes.bpm = bpm;
        if (capo !== undefined) atualizacoes.capo = capo;
        if (ativo !== undefined) atualizacoes.ativo = ativo;
        
        await cifra.update(atualizacoes);
        
        res.json({
            success: true,
            message: 'Cifra atualizada com sucesso!',
            cifra: cifra
        });
        
    } catch (error) {
        console.error('Erro ao atualizar cifra (master):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Deletar cifra
router.delete('/cifras/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const cifra = await Cifra.findByPk(id);
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        await cifra.destroy();
        
        res.json({
            success: true,
            message: 'Cifra deletada com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao deletar cifra (master):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Alterar status da cifra (ativar/desativar)
router.put('/cifras/:id/toggle-status', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        const { ativo } = req.body;
        
        const cifra = await Cifra.findByPk(id);
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        await cifra.update({ ativo: Boolean(ativo) });
        
        res.json({
            success: true,
            message: `Cifra ${ativo ? 'ativada' : 'desativada'} com sucesso!`
        });
        
    } catch (error) {
        console.error('Erro ao alterar status da cifra (master):', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ROTAS PARA ANÁLISE DE CIFRAS DA COMUNIDADE

// Listar cifras pendentes de análise
router.get('/cifras-para-analise', authenticateMaster, async (req, res) => {
    try {
        const { limit = 50, offset = 0 } = req.query;
        
        const { count, rows: cifras } = await Cifra.findAndCountAll({
            where: {
                status_analise: 'pendente',
                ativo: true
            },
            order: [['data_submissao', 'ASC']], // Mais antigas primeiro
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        const cifrasFormatadas = cifras.map(cifra => ({
            ...cifra.toJSON(),
            views_formatadas: cifra.getViewsFormatadas(),
            dias_aguardando: Math.floor((new Date() - new Date(cifra.data_submissao)) / (1000 * 60 * 60 * 24))
        }));
        
        res.json({
            success: true,
            cifras: cifrasFormatadas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar cifras para análise:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Aprovar cifra para a comunidade
router.post('/cifras/:id/aprovar', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        const { observacoes } = req.body;
        
        const cifra = await Cifra.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        if (cifra.status_analise !== 'pendente') {
            return res.status(400).json({
                success: false,
                message: 'Esta cifra não está pendente de análise'
            });
        }
        
        // Aprovar cifra
        await cifra.update({
            status_analise: 'aprovada',
            observacoes_analise: observacoes || null
        });
        
        res.json({
            success: true,
            message: 'Cifra aprovada com sucesso! Agora está disponível para toda a comunidade.',
            cifra: cifra
        });
        
    } catch (error) {
        console.error('Erro ao aprovar cifra:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Rejeitar cifra
router.post('/cifras/:id/rejeitar', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        const { observacoes } = req.body;
        
        const cifra = await Cifra.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        if (!cifra) {
            return res.status(404).json({
                success: false,
                message: 'Cifra não encontrada'
            });
        }
        
        if (cifra.status_analise !== 'pendente') {
            return res.status(400).json({
                success: false,
                message: 'Esta cifra não está pendente de análise'
            });
        }
        
        // Rejeitar cifra
        await cifra.update({
            status_analise: 'rejeitada',
            observacoes_analise: observacoes || 'Cifra rejeitada pela moderação'
        });
        
        res.json({
            success: true,
            message: 'Cifra rejeitada. O usuário poderá fazer correções e reenviar.',
            cifra: cifra
        });
        
    } catch (error) {
        console.error('Erro ao rejeitar cifra:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Obter estatísticas de análise
router.get('/cifras-analise-stats', authenticateMaster, async (req, res) => {
    try {
        const pendentes = await Cifra.count({
            where: { status_analise: 'pendente', ativo: true }
        });
        
        const aprovadas = await Cifra.count({
            where: { status_analise: 'aprovada', ativo: true }
        });
        
        const rejeitadas = await Cifra.count({
            where: { status_analise: 'rejeitada', ativo: true }
        });
        
        const privadas = await Cifra.count({
            where: { status_analise: 'privada', ativo: true }
        });
        
        // Cifras pendentes há mais de 7 dias
        const seteDiasAtras = new Date();
        seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
        
        const pendentesMuitoTempo = await Cifra.count({
            where: {
                status_analise: 'pendente',
                ativo: true,
                data_submissao: {
                    [Op.lt]: seteDiasAtras
                }
            }
        });
        
        res.json({
            success: true,
            stats: {
                pendentes,
                aprovadas,
                rejeitadas,
                privadas,
                pendentesMuitoTempo,
                total: pendentes + aprovadas + rejeitadas + privadas
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter estatísticas de análise:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// ==========================================
// ROTAS PARA GESTÃO DE CONTEÚDO
// ==========================================

// Listar todos os conteúdos
router.get('/content', authenticateMaster, async (req, res) => {
    try {
        const { tipo, ativo, limit = 50, offset = 0 } = req.query;
        
        const where = {};
        if (tipo) where.tipo = tipo;
        if (ativo !== undefined) where.ativo = ativo === 'true';
        
        const { count, rows: contents } = await Content.findAndCountAll({
            where,
            order: [['ordem', 'ASC'], ['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'criador',
                    attributes: ['id', 'nome', 'email']
                },
                {
                    model: User,
                    as: 'atualizador',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        const contentsFormatted = contents.map(content => ({
            ...content.toJSON(),
            url_imagem_completa: content.getImagemCompleta(),
            is_ativo_agora: content.isAtivo()
        }));
        
        res.json({
            success: true,
            contents: contentsFormatted,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar conteúdos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Obter conteúdo específico
router.get('/content/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const content = await Content.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'criador',
                    attributes: ['id', 'nome', 'email']
                },
                {
                    model: User,
                    as: 'atualizador',
                    attributes: ['id', 'nome', 'email']
                }
            ]
        });
        
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Conteúdo não encontrado'
            });
        }
        
        res.json({
            success: true,
            content: {
                ...content.toJSON(),
                url_imagem_completa: content.getImagemCompleta(),
                is_ativo_agora: content.isAtivo()
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar conteúdo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Criar novo conteúdo
router.post('/content', authenticateMaster, upload.single('imagem'), async (req, res) => {
    try {
        const {
            tipo, chave, titulo, conteudo, url_link, ordem,
            ativo, data_inicio, data_fim, metadados
        } = req.body;
        
        // Validação básica
        if (!tipo || !chave || !titulo) {
            return res.status(400).json({
                success: false,
                message: 'Tipo, chave e título são obrigatórios'
            });
        }
        
        // Verificar se a chave já existe
        const existingContent = await Content.findOne({ where: { chave } });
        if (existingContent) {
            return res.status(400).json({
                success: false,
                message: 'Já existe um conteúdo com esta chave'
            });
        }
        
        const contentData = {
            tipo,
            chave,
            titulo,
            conteudo: conteudo || null,
            url_link: url_link || null,
            ordem: parseInt(ordem) || 0,
            ativo: ativo !== 'false',
            data_inicio: data_inicio || null,
            data_fim: data_fim || null,
            metadados: metadados ? JSON.parse(metadados) : null,
            criado_por: req.user.id
        };
        
        // Se foi enviada uma imagem
        if (req.file) {
            contentData.url_imagem = req.file.filename;
        }
        
        const newContent = await Content.create(contentData);
        
        res.json({
            success: true,
            message: 'Conteúdo criado com sucesso',
            content: {
                ...newContent.toJSON(),
                url_imagem_completa: newContent.getImagemCompleta()
            }
        });
        
    } catch (error) {
        console.error('Erro ao criar conteúdo:', error);
        
        // Se houve erro e foi enviado arquivo, deletar o arquivo
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Erro ao deletar arquivo:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Atualizar conteúdo
router.put('/content/:id', authenticateMaster, upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const {
            tipo, chave, titulo, conteudo, url_link, ordem,
            ativo, data_inicio, data_fim, metadados, remover_imagem
        } = req.body;
        
        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Conteúdo não encontrado'
            });
        }
        
        // Verificar se a chave já existe (exceto para o próprio conteúdo)
        if (chave && chave !== content.chave) {
            const existingContent = await Content.findOne({ 
                where: { 
                    chave,
                    id: { [Op.ne]: id }
                } 
            });
            if (existingContent) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe um conteúdo com esta chave'
                });
            }
        }
        
        const updateData = {
            atualizado_por: req.user.id
        };
        
        // Atualizar campos se fornecidos
        if (tipo) updateData.tipo = tipo;
        if (chave) updateData.chave = chave;
        if (titulo) updateData.titulo = titulo;
        if (conteudo !== undefined) updateData.conteudo = conteudo;
        if (url_link !== undefined) updateData.url_link = url_link;
        if (ordem !== undefined) updateData.ordem = parseInt(ordem);
        if (ativo !== undefined) updateData.ativo = ativo !== 'false';
        if (data_inicio !== undefined) updateData.data_inicio = data_inicio || null;
        if (data_fim !== undefined) updateData.data_fim = data_fim || null;
        if (metadados !== undefined) updateData.metadados = metadados ? JSON.parse(metadados) : null;
        
        // Gerenciar imagem
        let oldImagePath = null;
        
        if (remover_imagem === 'true') {
            // Remover imagem atual
            if (content.url_imagem) {
                oldImagePath = path.join(__dirname, '../../frontend/uploads', content.url_imagem);
            }
            updateData.url_imagem = null;
        } else if (req.file) {
            // Nova imagem enviada
            if (content.url_imagem) {
                oldImagePath = path.join(__dirname, '../../frontend/uploads', content.url_imagem);
            }
            updateData.url_imagem = req.file.filename;
        }
        
        await content.update(updateData);
        
        // Deletar imagem antiga se necessário
        if (oldImagePath && fs.existsSync(oldImagePath)) {
            try {
                fs.unlinkSync(oldImagePath);
            } catch (unlinkError) {
                console.error('Erro ao deletar imagem antiga:', unlinkError);
            }
        }
        
        res.json({
            success: true,
            message: 'Conteúdo atualizado com sucesso',
            content: {
                ...content.toJSON(),
                url_imagem_completa: content.getImagemCompleta()
            }
        });
        
    } catch (error) {
        console.error('Erro ao atualizar conteúdo:', error);
        
        // Se houve erro e foi enviado arquivo, deletar o arquivo
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error('Erro ao deletar arquivo:', unlinkError);
            }
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Deletar conteúdo
router.delete('/content/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Conteúdo não encontrado'
            });
        }
        
        // Deletar imagem associada se existir
        if (content.url_imagem) {
            const imagePath = path.join(__dirname, '../../frontend/uploads', content.url_imagem);
            if (fs.existsSync(imagePath)) {
                try {
                    fs.unlinkSync(imagePath);
                } catch (unlinkError) {
                    console.error('Erro ao deletar imagem:', unlinkError);
                }
            }
        }
        
        await content.destroy();
        
        res.json({
            success: true,
            message: 'Conteúdo deletado com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao deletar conteúdo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Alternar status ativo/inativo
router.put('/content/:id/toggle-status', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const content = await Content.findByPk(id);
        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Conteúdo não encontrado'
            });
        }
        
        await content.update({
            ativo: !content.ativo,
            atualizado_por: req.user.id
        });
        
        res.json({
            success: true,
            message: `Conteúdo ${content.ativo ? 'ativado' : 'desativado'} com sucesso`,
            content: content
        });
        
    } catch (error) {
        console.error('Erro ao alterar status do conteúdo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Reordenar conteúdos
router.put('/content/reorder', authenticateMaster, async (req, res) => {
    try {
        const { items } = req.body; // Array de { id, ordem }
        
        if (!Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: 'Items deve ser um array'
            });
        }
        
        // Atualizar ordem de cada item
        for (const item of items) {
            await Content.update(
                { 
                    ordem: item.ordem,
                    atualizado_por: req.user.id
                },
                { where: { id: item.id } }
            );
        }
        
        res.json({
            success: true,
            message: 'Ordem dos conteúdos atualizada com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao reordenar conteúdos:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Obter estatísticas de conteúdo
router.get('/content-stats', authenticateMaster, async (req, res) => {
    try {
        const totalContent = await Content.count();
        const activeContent = await Content.count({ where: { ativo: true } });
        const inactiveContent = totalContent - activeContent;
        
        // Conteúdos por tipo
        const contentByType = await Content.findAll({
            attributes: [
                'tipo',
                [Content.sequelize.fn('COUNT', Content.sequelize.col('id')), 'count']
            ],
            group: ['tipo']
        });
        
        // Conteúdos criados nos últimos 30 dias
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentContent = await Content.count({
            where: {
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });
        
        res.json({
            success: true,
            stats: {
                total: totalContent,
                active: activeContent,
                inactive: inactiveContent,
                recent: recentContent,
                byType: contentByType
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter estatísticas de conteúdo:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

module.exports = router; 