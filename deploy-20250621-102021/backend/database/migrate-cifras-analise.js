const sequelize = require('./config');

async function migrateCifrasAnalise() {
    try {
        console.log('🔄 Iniciando migração para adicionar campos de análise de cifras...');
        
        // Adicionar coluna status_analise
        await sequelize.query(`
            ALTER TABLE cifras 
            ADD COLUMN status_analise TEXT DEFAULT 'privada' 
            CHECK (status_analise IN ('privada', 'pendente', 'aprovada', 'rejeitada'))
        `);
        console.log('✅ Coluna status_analise adicionada');
        
        // Adicionar coluna data_submissao
        await sequelize.query(`
            ALTER TABLE cifras 
            ADD COLUMN data_submissao DATETIME NULL
        `);
        console.log('✅ Coluna data_submissao adicionada');
        
        // Adicionar coluna observacoes_analise
        await sequelize.query(`
            ALTER TABLE cifras 
            ADD COLUMN observacoes_analise TEXT NULL
        `);
        console.log('✅ Coluna observacoes_analise adicionada');
        
        // Atualizar cifras existentes para status 'aprovada' (assumindo que já são públicas)
        await sequelize.query(`
            UPDATE cifras 
            SET status_analise = 'aprovada' 
            WHERE ativo = true AND user_id IS NULL
        `);
        console.log('✅ Cifras existentes sem usuário marcadas como aprovadas');
        
        console.log('🎉 Migração concluída com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro na migração:', error);
        throw error;
    }
}

// Executar migração se chamado diretamente
if (require.main === module) {
    migrateCifrasAnalise()
        .then(() => {
            console.log('Migração executada com sucesso');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Erro na migração:', error);
            process.exit(1);
        });
}

module.exports = migrateCifrasAnalise; 