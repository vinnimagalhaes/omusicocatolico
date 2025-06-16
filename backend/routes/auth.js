const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');
const router = express.Router();

// Configurar Google OAuth
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login com email/senha
router.post('/login', async (req, res) => {
    try {
        const { email, password, senha } = req.body;
        const userPassword = password || senha; // Aceitar tanto 'password' quanto 'senha'

        console.log('🔍 [LOGIN] Iniciando processo de login para:', email);

        // Validar dados
        if (!email || !userPassword) {
            console.log('❌ [LOGIN] Dados incompletos - email ou senha faltando');
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário no banco
        console.log('🔍 [LOGIN] Buscando usuário no banco de dados...');
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('❌ [LOGIN] Usuário não encontrado:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        console.log('✅ [LOGIN] Usuário encontrado, verificando senha...');
        
        // Verificar senha usando o método do modelo
        const validPassword = await user.verificarSenha(userPassword);
        
        if (!validPassword) {
            console.log('❌ [LOGIN] Senha inválida para usuário:', email);
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        console.log('✅ [LOGIN] Senha válida, gerando token JWT...');

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                nome: user.nome
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('✅ [LOGIN] Login bem-sucedido para:', email);

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome
            }
        });

    } catch (error) {
        console.error('❌ [LOGIN] Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Login com Google
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                message: 'Credential do Google é obrigatório'
            });
        }

        // Verificar token do Google
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const name = payload['name'];
        const picture = payload['picture'];

        // Verificar se usuário já existe
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // Criar novo usuário
            user = await User.create({
                email,
                nome: name,
                avatar: picture,
                googleId,
                role: 'user',
                createdAt: new Date()
            });
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                nome: user.nome,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erro no login Google:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao autenticar com Google'
        });
    }
});

// Registro de novo usuário
router.post('/register', async (req, res) => {
    try {
        const { email, password, senha, nome } = req.body;
        const userPassword = password || senha; // Aceitar tanto 'password' quanto 'senha'

        // Validar dados
        if (!email || !userPassword || !nome) {
            return res.status(400).json({
                success: false,
                message: 'Email, senha e nome são obrigatórios'
            });
        }

        // Verificar se usuário já existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email já está em uso'
            });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        // Criar usuário
        const newUser = await User.create({
            email,
            senha: hashedPassword,
            nome
        });

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: newUser.id, 
                email: newUser.email, 
                nome: newUser.nome
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                nome: newUser.nome
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Verificar token
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                bio: user.bio,
                localizacao: user.localizacao,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erro na verificação:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
});

// Atualizar perfil do usuário
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const { nome, bio, localizacao } = req.body;

        // Atualizar campos do perfil
        if (nome !== undefined) user.nome = nome;
        if (bio !== undefined) user.bio = bio;
        if (localizacao !== undefined) user.localizacao = localizacao;

        await user.save();

        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            user: {
                id: user.id,
                email: user.email,
                nome: user.nome,
                bio: user.bio,
                localizacao: user.localizacao,
                avatar: user.avatar,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// Alterar senha
router.put('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token não fornecido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado'
            });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Senha atual e nova senha são obrigatórias'
            });
        }

        // Verificar senha atual
        const validPassword = await user.verificarSenha(currentPassword);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Senha atual incorreta'
            });
        }

        // Hash da nova senha
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.senha = hashedNewPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router; 