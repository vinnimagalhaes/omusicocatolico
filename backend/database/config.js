const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuração do banco de dados
const isDevelopment = process.env.NODE_ENV !== 'production';
const dialect = 'mysql'; // Forçar MySQL

// Forçar configuração MySQL
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
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

// Testar conexão
sequelize.authenticate()
    .then(() => {
        console.log(`✅ Conexão com banco de dados (${dialect}) estabelecida!`);
    })
    .catch(err => {
        console.error(`❌ Erro ao conectar com banco (${dialect}):`, err);
    });

module.exports = sequelize; 