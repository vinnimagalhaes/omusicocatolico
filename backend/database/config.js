const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco de dados
const isDevelopment = process.env.NODE_ENV !== 'production';

// Usar SQLite para todos os ambientes para simplificar o deploy.
// A base de dados estará em /backend/database.sqlite
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '..', 'database.sqlite'),
    logging: false, // Desabilitar logging em produção
    define: {
        timestamps: true,
        underscored: true,
    }
});

// Testar conexão
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com banco de dados estabelecida!');
    })
    .catch(err => {
        console.error('❌ Erro ao conectar com banco:', err);
    });

module.exports = sequelize; 