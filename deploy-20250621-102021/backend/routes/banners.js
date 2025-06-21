const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Banner, User } = require('../models');
const { authenticateToken: auth } = require('../middleware/auth');

const router = express.Router();

// Configurar multer para upload de banners
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../../uploads/banners');
        
        // Criar diretório se não existir
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, 'banner-' + uniqueSuffix + extension);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Verificar se é imagem
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos de imagem são permitidos!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// GET - Listar todos os banners ativos
router.get('/', async (req, res) => {
    try {
        const banners = await Banner.findAll({
            where: { ativo: true },
            order: [['ordem', 'ASC'], ['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'usuario',
                attributes: ['id', 'nome']
            }]
        });

        const bannersFormatted = banners.map(banner => ({
            id: banner.id,
            title: banner.titulo,
            url: `/uploads/banners/${banner.arquivo}`,
            uploadDate: banner.created_at,
            order: banner.ordem,
            user: banner.usuario ? banner.usuario.nome : 'Sistema'
        }));

        res.json({
            success: true,
            banners: bannersFormatted
        });

    } catch (error) {
        console.error('Erro ao buscar banners:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// POST - Upload de novo banner
router.post('/upload', auth, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo foi enviado'
            });
        }

        // Verificar quantos banners o usuário já tem
        const userBannerCount = await Banner.count({
            where: { 
                user_id: req.user.id,
                ativo: true 
            }
        });

        if (userBannerCount >= 4) {
            // Remover arquivo uploadado se exceder limite
            fs.unlinkSync(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Você já atingiu o limite de 4 banners'
            });
        }

        // Determinar próxima ordem
        const maxOrder = await Banner.max('ordem', {
            where: { ativo: true }
        });
        const nextOrder = (maxOrder || 0) + 1;

        // Criar registro no banco
        const banner = await Banner.create({
            titulo: req.body.title || `Banner ${Date.now()}`,
            arquivo: req.file.filename,
            user_id: req.user.id,
            ordem: nextOrder,
            ativo: true
        });

        res.json({
            success: true,
            message: 'Banner enviado com sucesso!',
            banner: {
                id: banner.id,
                title: banner.titulo,
                url: `/uploads/banners/${banner.arquivo}`,
                uploadDate: banner.created_at,
                order: banner.ordem
            }
        });

    } catch (error) {
        console.error('Erro ao fazer upload do banner:', error);
        
        // Remover arquivo se houve erro
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// DELETE - Excluir banner
router.delete('/:id', auth, async (req, res) => {
    try {
        const bannerId = req.params.id;

        const banner = await Banner.findOne({
            where: { 
                id: bannerId,
                user_id: req.user.id,
                ativo: true 
            }
        });

        if (!banner) {
            return res.status(404).json({
                success: false,
                message: 'Banner não encontrado'
            });
        }

        // Marcar como inativo ao invés de deletar
        await banner.update({ ativo: false });

        // Tentar remover arquivo físico
        const filePath = path.join(__dirname, '../../uploads/banners', banner.arquivo);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({
            success: true,
            message: 'Banner excluído com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao excluir banner:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// PUT - Atualizar ordem dos banners
router.put('/reorder', auth, async (req, res) => {
    try {
        const { bannerIds } = req.body;

        if (!Array.isArray(bannerIds)) {
            return res.status(400).json({
                success: false,
                message: 'Dados inválidos'
            });
        }

        // Atualizar ordem de cada banner
        for (let i = 0; i < bannerIds.length; i++) {
            const bannerId = bannerIds[i];
            await Banner.update(
                { ordem: i + 1 },
                { 
                    where: { 
                        id: bannerId,
                        user_id: req.user.id,
                        ativo: true 
                    }
                }
            );
        }

        res.json({
            success: true,
            message: 'Ordem dos banners atualizada!'
        });

    } catch (error) {
        console.error('Erro ao reordenar banners:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 