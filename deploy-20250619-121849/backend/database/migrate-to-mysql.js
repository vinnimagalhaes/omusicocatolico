const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

// Configuração do MySQL
const mysqlConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'omusicocatolico',
    password: process.env.DB_PASS || 'OMusicoCatolico2025p*',
    database: process.env.DB_NAME || 'omusicocatolico'
};

// Caminho do banco SQLite
const sqlitePath = path.join(__dirname, '..', 'database.sqlite');

async function migrateSQLiteToMySQL() {
    console.log('🚀 Iniciando migração do SQLite para MySQL...');

    // Conectar ao SQLite
    const sqliteDb = new sqlite3.Database(sqlitePath);

    // Conectar ao MySQL
    const mysqlConnection = await mysql.createConnection(mysqlConfig);

    try {
        // Obter todas as tabelas do SQLite
        const tables = await new Promise((resolve, reject) => {
            sqliteDb.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
                if (err) reject(err);
                resolve(tables);
            });
        });

        // Para cada tabela
        for (const table of tables) {
            const tableName = table.name;
            console.log(`\n📋 Migrando tabela: ${tableName}`);

            // Obter dados da tabela SQLite
            const rows = await new Promise((resolve, reject) => {
                sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            if (rows.length > 0) {
                // Inserir dados no MySQL
                const columns = Object.keys(rows[0]).join(', ');
                const values = rows.map(row => {
                    return Object.values(row).map(value => {
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        return value;
                    }).join(', ');
                });

                for (const value of values) {
                    try {
                        await mysqlConnection.query(`INSERT INTO ${tableName} (${columns}) VALUES (${value})`);
                    } catch (error) {
                        console.error(`❌ Erro ao inserir em ${tableName}:`, error.message);
                    }
                }

                console.log(`✅ Migrados ${rows.length} registros para ${tableName}`);
            } else {
                console.log(`ℹ️ Nenhum dado para migrar em ${tableName}`);
            }
        }

        console.log('\n🎉 Migração concluída com sucesso!');
    } catch (error) {
        console.error('❌ Erro durante a migração:', error);
    } finally {
        // Fechar conexões
        sqliteDb.close();
        await mysqlConnection.end();
    }
}

// Executar migração
migrateSQLiteToMySQL(); 