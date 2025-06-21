const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');

// Configuração MySQL para o servidor
const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    username: 'omusicocatolico',
    password: 'OMusicoCatolico2025p*',
    database: 'omusicocatolico',
    logging: false,
    define: {
        timestamps: true,
        underscored: true,
    }
});

// Modelo de usuário
const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: DataTypes.STRING,
    role: {
        type: DataTypes.STRING,
        defaultValue: 'admin'
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acesso: DataTypes.DATE,
    bio: DataTypes.TEXT,
    localizacao: DataTypes.STRING
}, {
    timestamps: true,
    underscored: true
});

const createAdminUser = async () => {
    try {
        console.log('🔄 Conectando ao banco de dados...');
        await sequelize.authenticate();
        console.log('✅ Conexão com banco estabelecida');

        console.log('🔄 Sincronizando tabela users...');
        await User.sync();
        console.log('✅ Tabela users sincronizada');

        // Verificar se o usuário já existe
        console.log('🔄 Verificando se usuário admin já existe...');
        const existingUser = await User.findOne({
            where: { email: 'viniciusmagalhaes.vsm@gmail.com' }
        });

        if (existingUser) {
            console.log('⚠️  Usuário admin já existe!');
            console.log('📧 Email:', existingUser.email);
            console.log('👤 Nome:', existingUser.nome);
            console.log('🔑 Role:', existingUser.role);
            return;
        }

        // Criar hash da senha
        console.log('🔄 Criando hash da senha...');
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash('OMusicoCatolico2025p*', saltRounds);

        // Criar usuário admin
        console.log('🔄 Criando usuário admin...');
        const adminUser = await User.create({
            nome: 'Vinicius Magalhães',
            email: 'viniciusmagalhaes.vsm@gmail.com',
            senha: hashedPassword,
            role: 'admin',
            ativo: true,
            bio: 'Administrador do sistema O Músico Católico'
        });

        console.log('\n🎉 Usuário admin criado com sucesso!');
        console.log('📧 Email:', adminUser.email);
        console.log('👤 Nome:', adminUser.nome);
        console.log('🔑 Role:', adminUser.role);
        console.log('🆔 ID:', adminUser.id);
        console.log('\n✅ Você já pode fazer login com essas credenciais!');

    } catch (error) {
        console.error('\n❌ Erro ao criar usuário admin:', error.message);
        if (error.parent) {
            console.error('Detalhes:', error.parent.message);
        }
    } finally {
        await sequelize.close();
        console.log('\n🔌 Conexão com banco fechada');
    }
};

console.log('🚀 Iniciando criação do usuário admin...\n');
createAdminUser(); 