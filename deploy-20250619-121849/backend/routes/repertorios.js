const express = require('express');
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const { Repertorio, RepertorioCifra, Cifra, User } = require('../models');
const router = express.Router();

// LISTAR REPERTÓRIOS DO USUÁRIO
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const repertorios = await Repertorio.findAll({
            where: { user_id: userId },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['ordem', 'ASC'], ['created_at', 'DESC']]
        });
        
        // Contar cifras em cada repertório
        const repertoriosComContagem = await Promise.all(
            repertorios.map(async (rep) => {
                const totalCifras = await RepertorioCifra.count({
                    where: { repertorio_id: rep.id }
                });
                
                return {
                    ...rep.toJSON(),
                    total_cifras: totalCifras
                };
            })
        );
        
        res.json({
            repertorios: repertoriosComContagem,
            total: repertorios.length
        });
        
    } catch (error) {
        console.error('Erro ao listar repertórios:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// LISTAR REPERTÓRIOS PÚBLICOS (deve vir antes da rota /:id)
router.get('/publicos', async (req, res) => {
    try {
        const repertorios = await Repertorio.findAll({
            where: { publico: true },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: 20
        });
        
        // Contar cifras em cada repertório
        const repertoriosComContagem = await Promise.all(
            repertorios.map(async (rep) => {
                const totalCifras = await RepertorioCifra.count({
                    where: { repertorio_id: rep.id }
                });
                
                return {
                    ...rep.toJSON(),
                    cifra_count: totalCifras
                };
            })
        );
        
        res.json({
            success: true,
            repertorios: repertoriosComContagem
        });
        
    } catch (error) {
        console.error('Erro ao listar repertórios públicos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor' 
        });
    }
});

// OBTER REPERTÓRIO ESPECÍFICO
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const repertorio = await Repertorio.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                },
                {
                    model: RepertorioCifra,
                    as: 'cifras_do_repertorio',
                    include: [
                        {
                            model: Cifra,
                            as: 'cifra'
                        }
                    ],
                    order: [['ordem', 'ASC']]
                }
            ]
        });
        
        if (!repertorio) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        // Verificar permissão para visualizar
        if (!repertorio.publico && repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para visualizar este repertório' });
        }
        
        const repertorioFormatado = {
            ...repertorio.toJSON(),
            total_cifras: repertorio.cifras_do_repertorio.length,
            cifras: repertorio.cifras_do_repertorio.map(rc => ({
                ...rc.cifra.toJSON(),
                ordem: rc.ordem,
                observacoes: rc.observacoes
            }))
        };
        
        res.json(repertorioFormatado);
        
    } catch (error) {
        console.error('Erro ao buscar repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// CRIAR NOVO REPERTÓRIO
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { nome, data_evento, descricao, publico = false, cor = '#3B82F6' } = req.body;
        const userId = req.user.id;
        
        if (!nome || nome.trim().length === 0) {
            return res.status(400).json({ error: 'Nome do repertório é obrigatório' });
        }
        
        const novoRepertorio = await Repertorio.create({
            nome: nome.trim(),
            data_evento: data_evento || null,
            descricao: descricao?.trim(),
            publico,
            cor,
            user_id: userId,
            ordem: 0
        });
        
        res.status(201).json({
            success: true,
            message: 'Repertório criado com sucesso!',
            repertorio: novoRepertorio
        });
        
    } catch (error) {
        console.error('Erro ao criar repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ATUALIZAR REPERTÓRIO
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao, publico, cor } = req.body;
        const userId = req.user.id;
        
        const repertorio = await Repertorio.findByPk(id);
        
        if (!repertorio) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        // Verificar permissão
        if (repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para editar este repertório' });
        }
        
        // Verificar nome duplicado se estiver mudando
        if (nome && nome.trim() !== repertorio.nome) {
            const nomeExistente = await Repertorio.findOne({
                where: { 
                    user_id: userId, 
                    nome: nome.trim(),
                    id: { [Op.ne]: id }
                }
            });
            
            if (nomeExistente) {
                return res.status(400).json({ error: 'Já existe um repertório com este nome' });
            }
        }
        
        const atualizacoes = {};
        if (nome !== undefined) atualizacoes.nome = nome.trim();
        if (descricao !== undefined) atualizacoes.descricao = descricao?.trim();
        if (publico !== undefined) atualizacoes.publico = publico;
        if (cor !== undefined) atualizacoes.cor = cor;
        
        await repertorio.update(atualizacoes);
        
        res.json({
            success: true,
            message: 'Repertório atualizado com sucesso!',
            repertorio
        });
        
    } catch (error) {
        console.error('Erro ao atualizar repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DELETAR REPERTÓRIO
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const repertorio = await Repertorio.findByPk(id);
        
        if (!repertorio) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        // Verificar permissão
        if (repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para deletar este repertório' });
        }
        
        await repertorio.destroy();
        
        res.json({
            success: true,
            message: 'Repertório deletado com sucesso!'
        });
        
    } catch (error) {
        console.error('Erro ao deletar repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// ADICIONAR CIFRA AO REPERTÓRIO
router.post('/:id/cifras', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { cifra_id } = req.body;
        const userId = req.user.id;
        
        // Verificar permissões
        const repertorio = await Repertorio.findByPk(id);
        if (!repertorio || repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão' });
        }
        
        // Verificar se cifra já está no repertório
        const cifraExistente = await RepertorioCifra.findOne({
            where: { repertorio_id: id, cifra_id }
        });
        
        if (cifraExistente) {
            return res.status(400).json({ error: 'Cifra já está neste repertório' });
        }
        
        await RepertorioCifra.create({
            repertorio_id: id,
            cifra_id,
            ordem: 0
        });
        
        res.status(201).json({
            success: true,
            message: 'Cifra adicionada ao repertório!'
        });
        
    } catch (error) {
        console.error('Erro ao adicionar cifra:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// REMOVER CIFRA DO REPERTÓRIO
router.delete('/:id/cifras/:cifraId', authenticateToken, async (req, res) => {
    try {
        const { id, cifraId } = req.params;
        const userId = req.user.id;
        
        // Verificar se repertório existe e pertence ao usuário
        const repertorio = await Repertorio.findByPk(id);
        if (!repertorio) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        if (repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para editar este repertório' });
        }
        
        // Buscar e remover relação
        const repertorioCifra = await RepertorioCifra.findOne({
            where: { repertorio_id: id, cifra_id: cifraId }
        });
        
        if (!repertorioCifra) {
            return res.status(404).json({ error: 'Cifra não encontrada no repertório' });
        }
        
        await repertorioCifra.destroy();
        
        res.json({
            success: true,
            message: 'Cifra removida do repertório!'
        });
        
    } catch (error) {
        console.error('Erro ao remover cifra do repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// REORDENAR CIFRAS NO REPERTÓRIO
router.put('/:id/reordenar', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { ordens } = req.body; // Array de { cifra_id, nova_ordem }
        const userId = req.user.id;
        
        // Verificar se repertório existe e pertence ao usuário
        const repertorio = await Repertorio.findByPk(id);
        if (!repertorio) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        if (repertorio.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para editar este repertório' });
        }
        
        if (!Array.isArray(ordens)) {
            return res.status(400).json({ error: 'Parâmetro ordens deve ser um array' });
        }
        
        // Atualizar ordens
        for (const { cifra_id, nova_ordem } of ordens) {
            await RepertorioCifra.update(
                { ordem: nova_ordem },
                { where: { repertorio_id: id, cifra_id } }
            );
        }
        
        res.json({
            success: true,
            message: 'Ordem das cifras atualizada!'
        });
        
    } catch (error) {
        console.error('Erro ao reordenar cifras:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// LISTAR REPERTÓRIOS PÚBLICOS
router.get('/publicos/listar', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const { count, rows: repertorios } = await Repertorio.findAndCountAll({
            where: { publico: true },
            include: [
                {
                    model: User,
                    as: 'usuario',
                    attributes: ['id', 'nome']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        
        // Contar cifras em cada repertório
        const repertoriosComContagem = await Promise.all(
            repertorios.map(async (rep) => {
                const totalCifras = await RepertorioCifra.count({
                    where: { repertorio_id: rep.id }
                });
                
                return {
                    ...rep.toJSON(),
                    total_cifras: totalCifras
                };
            })
        );
        
        res.json({
            repertorios: repertoriosComContagem,
            total: count,
            offset: parseInt(offset),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Erro ao listar repertórios públicos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// DUPLICAR REPERTÓRIO PÚBLICO
router.post('/:id/duplicar', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_novo } = req.body;
        const userId = req.user.id;
        
        // Buscar repertório original
        const repertorioOriginal = await Repertorio.findByPk(id, {
            include: [
                {
                    model: RepertorioCifra,
                    as: 'cifras_do_repertorio'
                }
            ]
        });
        
        if (!repertorioOriginal) {
            return res.status(404).json({ error: 'Repertório não encontrado' });
        }
        
        if (!repertorioOriginal.publico && repertorioOriginal.user_id !== userId) {
            return res.status(403).json({ error: 'Sem permissão para duplicar este repertório' });
        }
        
        const nomeRepertorio = nome_novo || `${repertorioOriginal.nome} (Cópia)`;
        
        // Verificar nome duplicado
        const nomeExistente = await Repertorio.findOne({
            where: { user_id: userId, nome: nomeRepertorio }
        });
        
        if (nomeExistente) {
            return res.status(400).json({ error: 'Já existe um repertório com este nome' });
        }
        
        // Criar novo repertório
        const novoRepertorio = await Repertorio.create({
            nome: nomeRepertorio,
            descricao: repertorioOriginal.descricao,
            publico: false, // Cópia sempre privada inicialmente
            cor: repertorioOriginal.cor,
            user_id: userId,
            ordem: 0
        });
        
        // Copiar cifras
        for (const [index, rc] of repertorioOriginal.cifras_do_repertorio.entries()) {
            await RepertorioCifra.create({
                repertorio_id: novoRepertorio.id,
                cifra_id: rc.cifra_id,
                ordem: index + 1,
                observacoes: rc.observacoes
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Repertório duplicado com sucesso!',
            repertorio: novoRepertorio
        });
        
    } catch (error) {
        console.error('Erro ao duplicar repertório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router; 