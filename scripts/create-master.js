const { User } = require('../backend/models');
const bcrypt = require('bcryptjs');

async function createMasterUser() {
    try {
        console.log('🔧 Criando usuário master...');
        
        // Verificar se já existe um usuário master
        const existingMaster = await User.findOne({ 
            where: { role: 'master' } 
        });
        
        if (existingMaster) {
            console.log('⚠️  Já existe um usuário master:', existingMaster.email);
            console.log('🔄 Atualizando senha para "master123"...');
            
            await existingMaster.update({
                senha: 'master123' // Será automaticamente hasheada pelo hook
            });
            
            console.log('✅ Senha do usuário master atualizada!');
            console.log('📧 Email:', existingMaster.email);
            console.log('🔑 Senha: master123');
        } else {
            // Criar novo usuário master
            const masterUser = await User.create({
                nome: 'Master Admin',
                email: 'master@omusicacatolico.com',
                senha: 'master123', // Será automaticamente hasheada pelo hook
                role: 'master',
                ativo: true
            });
            
            console.log('✅ Usuário master criado com sucesso!');
            console.log('📧 Email: master@omusicacatolico.com');
            console.log('🔑 Senha: master123');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuário master:', error);
        process.exit(1);
    }
}

createMasterUser(); 