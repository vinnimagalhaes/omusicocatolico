const jwt = require('jsonwebtoken');

// JWT Secret (use variável de ambiente em produção)
const JWT_SECRET = process.env.JWT_SECRET || 'omusicacatolico_secret_key_2024_dev';

// Middleware de autenticação
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log(`[AUTH] Requisição para: ${req.method} ${req.originalUrl}`); // Debug
    console.log(`[AUTH] Authorization header presente: ${!!authHeader}`); // Debug
    console.log(`[AUTH] Token extraído: ${!!token}`); // Debug

    if (!token) {
        console.log('[AUTH] Token não fornecido'); // Debug
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acesso requerido' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('[AUTH] Erro na verificação do token:', err.message);
            return res.status(403).json({ 
                success: false, 
                message: 'Token inválido' 
            });
        }
        console.log(`[AUTH] Token válido para usuário ID: ${user.id}`); // Debug
        req.user = user;
        next();
    });
}

// Middleware opcional de autenticação (não bloqueia se não houver token)
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (!err) {
                req.user = user;
            }
        });
    }
    next();
}

// Middleware para verificar se o usuário é master/admin
function authenticateMaster(req, res, next) {
    authenticateToken(req, res, () => {
        // Verificar se o usuário tem privilégios de master
        // Aqui você pode definir sua lógica específica (por exemplo, verificar se o email é um email master específico)
        const masterEmails = [
                'master@omusicacatolico.com',
    'admin@omusicacatolico.com',
    'vinicius@omusicacatolico.com'
        ];
        
        if (!masterEmails.includes(req.user.email)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso restrito - privilégios de master necessários'
            });
        }
        
        next();
    });
}

module.exports = {
    authenticateToken,
    optionalAuth,
    authenticateMaster,
    JWT_SECRET
}; 