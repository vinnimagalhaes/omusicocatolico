const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'omusicacatolico_secret_key_2024_dev';

// Middleware de autenticação master simples
function authenticateMaster(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acesso requerido' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }
        
        // Verificar se o usuário é master
        const masterEmails = [
                'master@omusicacatolico.com',
    'admin@omusicacatolico.com',
    'vinicius@omusicacatolico.com'
        ];
        
        if (!masterEmails.includes(user.email)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso restrito - privilégios de master necessários'
            });
        }
        
        req.user = user;
        next();
    });
}

// Dashboard - estatísticas gerais do sistema
router.get('/dashboard', authenticateMaster, async (req, res) => {
    try {
        // Dados mock para teste inicial
        const mockData = {
            stats: {
                totalUsers: 25,
                newUsersToday: 3,
                totalCifras: 150,
                newCifrasToday: 5,
                totalRepertorios: 30,
                publicRepertorios: 12,
                uptime: '2h 15m'
            },
            recentActivity: [
                {
                    icon: 'fas fa-user-plus',
                    description: 'Novo usuário: João Silva',
                    timestamp: new Date()
                },
                {
                    icon: 'fas fa-music',
                    description: 'Nova cifra: Ave Maria - Schubert',
                    timestamp: new Date()
                }
            ]
        };

        res.json({
            success: true,
            data: mockData
        });

    } catch (error) {
        console.error('Erro no dashboard master:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Listar todos os usuários (mock)
router.get('/users', authenticateMaster, async (req, res) => {
    try {
        // Mock users
        const mockUsers = [
            {
                id: 1,
                nome: 'João Silva',
                email: 'joao@email.com',
                role: 'user',
                ativo: true,
                createdAt: new Date(),
                ultimo_acesso: new Date()
            },
            {
                id: 2,
                nome: 'Maria Santos',
                email: 'maria@email.com',
                role: 'admin',
                ativo: true,
                createdAt: new Date(),
                ultimo_acesso: new Date()
            }
        ];

        res.json({
            success: true,
            users: mockUsers
        });

    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Criar novo usuário (placeholder)
router.post('/users', authenticateMaster, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Funcionalidade em desenvolvimento',
            user: { id: Date.now(), ...req.body }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Promover usuário (placeholder)
router.put('/users/:id/promote', authenticateMaster, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Usuário promovido com sucesso (mock)'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Alternar status do usuário (placeholder)
router.put('/users/:id/toggle-status', authenticateMaster, async (req, res) => {
    try {
        const { ativo } = req.body;
        res.json({
            success: true,
            message: `Usuário ${ativo ? 'reativado' : 'banido'} com sucesso (mock)`
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

// Deletar usuário (placeholder)
router.delete('/users/:id', authenticateMaster, async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Usuário deletado com sucesso (mock)'
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Erro interno do servidor' 
        });
    }
});

module.exports = router; 