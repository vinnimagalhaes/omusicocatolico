const { sincronizarBanco } = require('../backend/models');

async function initDatabase() {
    try {
        console.log('🚀 Inicializando banco de dados...');
        
        // Sincronizar banco (true = recriar tabelas)
        await sincronizarBanco(true);
        
        console.log('✅ Banco de dados inicializado com sucesso!');
        console.log('📝 Dados iniciais inseridos.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        process.exit(1);
    }
}

initDatabase(); 