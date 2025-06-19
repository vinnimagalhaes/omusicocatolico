const bcrypt = require('bcrypt');
const sequelize = require('../database/config');

// Modelo de usuário
const User = sequelize.define('users', {
    id: {
        type: require('sequelize').DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: require('sequelize').DataTypes.STRING,
        allowNull: false
    },
    avatar: require('sequelize').DataTypes.STRING,
    role: {
        type: require('sequelize').DataTypes.STRING,
        defaultValue: 'admin'
    },
    ativo: {
        type: require('sequelize').DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acesso: require('sequelize').DataTypes.DATE,
    bio: require('sequelize').DataTypes.TEXT,
    localizacao: require('sequelize').DataTypes.STRING
}, {
    timestamps: true,
    underscored: true
});

const createAdminUser = async () => {
    try {
        // Testar conexão
        await sequelize.authenticate();
        console.log('✅ Conexão com banco estabelecida');

        // Sincronizar modelo
        await User.sync();
        console.log('✅ Tabela users sincronizada');

        // Verificar se o usuário já existe
        const existingUser = await User.findOne({
            where: { email: 'viniciusmagalhaes.vsm@gmail.com' }
        });

        if (existingUser) {
            console.log('⚠️  Usuário admin já existe!');
            return;
        }

        // Criar hash da senha
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('OMusicoCatolico2025p*', saltRounds);

        // Criar usuário admin
        const adminUser = await User.create({
            nome: 'Vinicius Magalhães',
            email: 'viniciusmagalhaes.vsm@gmail.com',
            senha: hashedPassword,
            role: 'admin',
            ativo: true,
            bio: 'Administrador do sistema O Músico Católico'
        });

        console.log('✅ Usuário admin criado com sucesso!');
        console.log('📧 Email:', adminUser.email);
        console.log('👤 Nome:', adminUser.nome);
        console.log('🔑 Role:', adminUser.role);

    } catch (error) {
        console.error('❌ Erro ao criar usuário admin:', error);
    } finally {
        await sequelize.close();
    }
};

createAdminUser(); 