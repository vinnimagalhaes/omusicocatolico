const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { authenticateToken, authenticateMaster } = require('../middleware/auth');
const { CarrosselItem, User } = require('../models');
const router = express.Router();

// Configurar upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/carrosseis';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos'), false);
        }
    }
});

// LISTAR ITENS DOS CARROSSEIS (público)
router.get('/', async (req, res) => {
    try {
        const { tipo } = req.query;
        
        const whereClause = {
            ativo: true
        };
        
        if (tipo && ['mais_tocadas', 'novas_cifras', 'por_categoria'].includes(tipo)) {
            whereClause.tipo_carrossel = tipo;
        }
        
        // Verificar datas de exibição
        const agora = new Date();
        whereClause[Op.or] = [
            { data_inicio: { [Op.lte]: agora }, data_fim: { [Op.gte]: agora } },
            { data_inicio: null, data_fim: null }
        ];
        
        const items = await CarrosselItem.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['ordem', 'ASC'], ['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Erro ao buscar itens do carrossel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// LISTAR TODOS OS ITENS (apenas master)
router.get('/admin', authenticateMaster, async (req, res) => {
    try {
        const items = await CarrosselItem.findAll({
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['tipo_carrossel', 'ASC'], ['ordem', 'ASC'], ['created_at', 'DESC']]
        });
        
        res.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error('Erro ao buscar itens do carrossel (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// CRIAR NOVO ITEM DO CARROSSEL (apenas master)
router.post('/', authenticateMaster, upload.single('imagem'), async (req, res) => {
    try {
        const { titulo, subtitulo, link_url, tipo_carrossel, ordem, data_inicio, data_fim } = req.body;
        
        if (!titulo || !tipo_carrossel) {
            return res.status(400).json({
                success: false,
                message: 'Título e tipo do carrossel são obrigatórios'
            });
        }
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Imagem é obrigatória'
            });
        }
        
        const novoItem = await CarrosselItem.create({
            titulo,
            subtitulo,
            imagem: req.file.filename,
            link_url,
            tipo_carrossel,
            ordem: ordem || 0,
            user_id: req.user.id,
            data_inicio: data_inicio || null,
            data_fim: data_fim || null
        });
        
        const itemCompleto = await CarrosselItem.findByPk(novoItem.id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        res.status(201).json({
            success: true,
            message: 'Item do carrossel criado com sucesso',
            data: itemCompleto
        });
    } catch (error) {
        console.error('Erro ao criar item do carrossel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// ATUALIZAR ITEM DO CARROSSEL (apenas master)
router.put('/:id', authenticateMaster, upload.single('imagem'), async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, subtitulo, link_url, tipo_carrossel, ordem, ativo, data_inicio, data_fim } = req.body;
        
        const item = await CarrosselItem.findByPk(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado'
            });
        }
        
        const updateData = {
            titulo: titulo || item.titulo,
            subtitulo: subtitulo || item.subtitulo,
            link_url: link_url || item.link_url,
            tipo_carrossel: tipo_carrossel || item.tipo_carrossel,
            ordem: ordem !== undefined ? ordem : item.ordem,
            ativo: ativo !== undefined ? ativo : item.ativo,
            data_inicio: data_inicio !== undefined ? data_inicio : item.data_inicio,
            data_fim: data_fim !== undefined ? data_fim : item.data_fim
        };
        
        // Se nova imagem foi enviada
        if (req.file) {
            // Remover imagem antiga
            const imagemAntiga = path.join('uploads/carrosseis', item.imagem);
            if (fs.existsSync(imagemAntiga)) {
                fs.unlinkSync(imagemAntiga);
            }
            updateData.imagem = req.file.filename;
        }
        
        await item.update(updateData);
        
        const itemAtualizado = await CarrosselItem.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ]
        });
        
        res.json({
            success: true,
            message: 'Item atualizado com sucesso',
            data: itemAtualizado
        });
    } catch (error) {
        console.error('Erro ao atualizar item do carrossel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// DELETAR ITEM DO CARROSSEL (apenas master)
router.delete('/:id', authenticateMaster, async (req, res) => {
    try {
        const { id } = req.params;
        
        const item = await CarrosselItem.findByPk(id);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado'
            });
        }
        
        // Remover arquivo de imagem
        const imagemPath = path.join('uploads/carrosseis', item.imagem);
        if (fs.existsSync(imagemPath)) {
            fs.unlinkSync(imagemPath);
        }
        
        await item.destroy();
        
        res.json({
            success: true,
            message: 'Item removido com sucesso'
        });
    } catch (error) {
        console.error('Erro ao remover item do carrossel:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 