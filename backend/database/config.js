const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuração do banco de dados
const isDevelopment = process.env.NODE_ENV !== 'production';
const dialect = process.env.DB_DIALECT || 'mysql';

let sequelize;

if (dialect === 'sqlite') {
    // Configuração para SQLite (desenvolvimento)
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: process.env.DB_PATH || './backend/database.sqlite',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
        }
    });
} else {
    // Configuração para MySQL (produção)
    sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USER || 'omusicocatolico',
        password: process.env.DB_PASS || 'OMusicoCatolico2025p*',
        database: process.env.DB_NAME || 'omusicocatolico',
        logging: false,
        define: {
            timestamps: true,
            underscored: true,
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}

// Testar conexão
sequelize.authenticate()
    .then(() => {
        console.log(`✅ Conexão com banco de dados (${dialect}) estabelecida!`);
    })
    .catch(err => {
        console.error(`❌ Erro ao conectar com banco (${dialect}):`, err);
    });

module.exports = sequelize; 