const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function criarAdminRemoto() {
    console.log('🚀 Conectando no servidor MySQL...');
    
    try {
        // Conectar diretamente no servidor
        const connection = await mysql.createConnection({
            host: '142.93.55.152',
            user: 'omusicocatolico',
            password: 'OMusicoCatolico2025p*',
            database: 'omusicocatolico',
            port: 3306
        });
        
        console.log('✅ Conectado no servidor!');
        
        // Criar tabela users se não existir
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL,
                avatar VARCHAR(255),
                role VARCHAR(50) DEFAULT 'user',
                ativo BOOLEAN DEFAULT 1,
                ultimo_acesso DATETIME,
                bio TEXT,
                localizacao VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        
        console.log('✅ Tabela users criada/verificada');
        
        // Verificar se usuário já existe
        const [usuarios] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['viniciusmagalhaes.vsm@gmail.com']
        );
        
        if (usuarios.length > 0) {
            console.log('⚠️  Usuário já existe!');
            console.log('📧 Email:', usuarios[0].email);
            console.log('👤 Nome:', usuarios[0].nome);
            return;
        }
        
        // Criar senha criptografada
        const senhaCriptografada = await bcrypt.hash('OMusicoCatolico2025p*', 10);
        
        // Criar usuário admin
        await connection.execute(
            'INSERT INTO users (nome, email, senha, role, ativo, bio) VALUES (?, ?, ?, ?, ?, ?)',
            [
                'Vinicius Magalhães',
                'viniciusmagalhaes.vsm@gmail.com',
                senhaCriptografada,
                'admin',
                1,
                'Administrador do sistema O Músico Católico'
            ]
        );
        
        console.log('🎉 Usuário admin criado com sucesso!');
        console.log('📧 Email: viniciusmagalhaes.vsm@gmail.com');
        console.log('🔑 Senha: OMusicoCatolico2025p*');
        console.log('🔑 Role: admin');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        if (error.code) {
            console.error('Código do erro:', error.code);
        }
    }
}

criarAdminRemoto(); 