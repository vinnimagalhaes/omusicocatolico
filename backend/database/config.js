const { Sequelize } = require('sequelize');
const path = require('path');

// Configuração do banco de dados
const isDevelopment = process.env.NODE_ENV !== 'production';

let sequelize;

if (isDevelopment) {
    // SQLite para desenvolvimento
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../database.sqlite'),
        logging: console.log, // Remova em produção
        define: {
            timestamps: true,
            underscored: true,
        }
    });
} else {
    // PostgreSQL para produção
    sequelize = new Sequelize(process.env.DATABASE_URL || process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
        host: process.env.DB_HOST || 'localhost',
        dialect: 'postgres',
        port: process.env.DB_PORT || 5432,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
        },
        dialectOptions: process.env.NODE_ENV === 'production' && process.env.DATABASE_URL ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}
    });
}

// Testar conexão
sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexão com banco de dados estabelecida!');
    })
    .catch(err => {
        console.error('❌ Erro ao conectar com banco:', err);
    });

module.exports = sequelize; 