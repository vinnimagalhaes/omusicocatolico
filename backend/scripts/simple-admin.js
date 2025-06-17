// Script simples para criar usuário admin
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function criarAdmin() {
    console.log('🚀 Iniciando...');
    
    try {
        // Conectar ao banco
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'omusicocatolico',
            password: 'OMusicoCatolico2025p*',
            database: 'omusicocatolico'
        });
        
        console.log('✅ Conectado ao banco!');
        
        // Criar senha criptografada
        const senhaCriptografada = await bcrypt.hash('OMusicoCatolico2025p*', 10);
        
        // Verificar se usuário já existe
        const [usuarios] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['viniciusmagalhaes.vsm@gmail.com']
        );
        
        if (usuarios.length > 0) {
            console.log('⚠️  Usuário já existe!');
            return;
        }
        
        // Criar usuário
        await connection.execute(
            'INSERT INTO users (nome, email, senha, role, ativo, bio, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
            [
                'Vinicius Magalhães',
                'viniciusmagalhaes.vsm@gmail.com',
                senhaCriptografada,
                'admin',
                1,
                'Administrador do sistema'
            ]
        );
        
        console.log('🎉 Usuário admin criado com sucesso!');
        console.log('📧 Email: viniciusmagalhaes.vsm@gmail.com');
        console.log('🔑 Senha: OMusicoCatolico2025p*');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

criarAdmin(); 