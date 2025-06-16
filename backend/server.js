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

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
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

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
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