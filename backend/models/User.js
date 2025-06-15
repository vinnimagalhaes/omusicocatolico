const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [2, 100]
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 255]
        }
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('user', 'admin', 'master'),
        defaultValue: 'user'
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    ultimo_acesso: {
        type: DataTypes.DATE,
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    localizacao: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'users',
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ],
    hooks: {
        beforeCreate: async (user) => {
            if (user.senha) {
                user.senha = await bcrypt.hash(user.senha, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('senha')) {
                user.senha = await bcrypt.hash(user.senha, 10);
            }
        }
    }
});

// Método para verificar senha
User.prototype.verificarSenha = async function(senha) {
    return await bcrypt.compare(senha, this.senha);
};

// Método para dados seguros (sem senha)
User.prototype.toSafeJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.senha;
    return values;
};

module.exports = User; 