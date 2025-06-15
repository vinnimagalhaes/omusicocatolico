const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { Cifra, User, Favorito } = require('../models');
const router = express.Router();

// 1. LISTAR FAVORITOS DO USUÁRIO
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 50, offset = 0 } = req.query;
        
        const { count, rows: favoritos } = await Favorito.findAndCountAll({
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
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        const cifrasFavoritas = favoritos.map(fav => ({
            ...fav.cifra.toJSON(),
            views: fav.cifra.getViewsFormatadas(),
            favoritado_em: fav.created_at
        }));
        
        res.json({
            favoritos: cifrasFavoritas,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao buscar favoritos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 2. ADICIONAR/REMOVER FAVORITO
router.post('/:cifraId', authenticateToken, async (req, res) => {
    try {
        const { cifraId } = req.params;
        const userId = req.user.id;
        
        // Verificar se a cifra existe
        const cifra = await Cifra.findByPk(cifraId);
        if (!cifra) {
            return res.status(404).json({ error: 'Cifra não encontrada' });
        }
        
        // Verificar se já é favorito
        const favoritoExistente = await Favorito.findOne({
            where: { user_id: userId, cifra_id: cifraId }
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
                cifra_id: cifraId
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

// 3. VERIFICAR SE CIFRA É FAVORITA
router.get('/check/:cifraId', authenticateToken, async (req, res) => {
    try {
        const { cifraId } = req.params;
        const userId = req.user.id;
        
        const favorito = await Favorito.findOne({
            where: { user_id: userId, cifra_id: cifraId }
        });
        
        res.json({
            favorito: !!favorito
        });
        
    } catch (error) {
        console.error('Erro ao verificar favorito:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 4. OBTER ESTATÍSTICAS DE FAVORITOS
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const totalFavoritos = await Favorito.count({
            where: { user_id: userId }
        });
        
        // Categorias mais favoritadas
        const categoriasFavoritas = await Favorito.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: Cifra,
                    as: 'cifra',
                    attributes: ['categoria']
                }
            ],
            attributes: [],
            group: ['cifra.categoria'],
            raw: true
        });
        
        res.json({
            total: totalFavoritos,
            categorias: categoriasFavoritas
        });
        
    } catch (error) {
        console.error('Erro ao buscar estatísticas de favoritos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router; 