const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar banco de dados e modelos
const { sincronizarBanco } = require('./models');

// Importar rotas
const authRoutes = require('./routes/auth');
const cifrasRoutes = require('./routes/cifras');
const favoritosRoutes = require('./routes/favoritos');
const repertoriosRoutes = require('./routes/repertorios');

// PRIMEIRO_EDIT: add security/rate-limit/cookie imports
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// SEGUNDO_EDIT: apply helmet, cookie-parser and configure CORS with credentials
// CSP unificado para compatibilidade com NGINX
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:"],
            scriptSrcAttr: ["'unsafe-inline'"], // PERMITIR event handlers inline
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
            fontSrc: ["'self'", "https:", "data:"],
            imgSrc: ["'self'", "https:", "data:"],
            connectSrc: ["'self'", "https:"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false // Desabilitar para compatibilidade
}));
app.use(cookieParser());

// Rate limit básico: 500 requisições por 15 min por IP (NGINX já protege)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// CORS: permitir front configurado e credenciais de cookie
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true,
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Criar diretório de uploads se não existir
const fs = require('fs');
const uploadsDir = path.join(__dirname, '../shared/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Unificar rotas da API sob um único prefixo /api
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/cifras', cifrasRoutes);
apiRouter.use('/favoritos', favoritosRoutes);
apiRouter.use('/repertorios', repertoriosRoutes);
apiRouter.use('/banners', require('./routes/banners'));
apiRouter.use('/carrosseis', require('./routes/carrosseis'));
apiRouter.use('/master', require('./routes/master'));

app.use('/api', apiRouter);

// Rotas para páginas com URLs limpas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/inicio', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/minhas-cifras', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/minhas-cifras.html'));
});

app.get('/favoritas', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/favoritas.html'));
});

app.get('/categorias', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/categorias.html'));
});

app.get('/repertorios', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/repertorios.html'));
});

app.get('/repertorios-comunidade', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/repertorios-comunidade.html'));
});

app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/perfil.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/register.html'));
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(`❌ ERRO [${new Date().toISOString()}]:`, err.stack);
    console.error(`📍 URL: ${req.method} ${req.originalUrl}`);
    console.error(`🔍 Headers: ${JSON.stringify(req.headers, null, 2)}`);
    res.status(500).json({ error: 'Algo deu errado!' });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

// Função para inicializar servidor
const inicializarServidor = async () => {
    try {
        // Sincronizar banco (criar tabelas se não existirem)
        // Use true para recriar tabelas em primeira execução
        await sincronizarBanco(false);
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🎵 Servidor OMúsicoCatólico rodando na porta ${PORT}`);
            console.log(`📱 Acesse: http://localhost:${PORT}`);
            console.log(`🔧 API: http://localhost:${PORT}/api/cifras`);
            console.log('✅ Banco de dados conectado!');
        });
        
    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
};

// Inicializar servidor
inicializarServidor();

module.exports = app; 