const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Repertorio = sequelize.define('Repertorio', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    data_evento: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        comment: 'Data da celebração, missa ou evento'
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    publico: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    cor: {
        type: DataTypes.STRING,
        defaultValue: '#3B82F6',
        validate: {
            isHexColor: function(value) {
                if (!/^#[0-9A-F]{6}$/i.test(value)) {
                    throw new Error('Cor deve ser um código hexadecimal válido');
                }
            }
        }
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'repertorios',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['publico']
        }
    ]
});

const RepertorioCifra = sequelize.define('RepertorioCifra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    repertorio_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'repertorios',
            key: 'id'
        }
    },
    cifra_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cifras',
            key: 'id'
        }
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    observacoes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'repertorio_cifras',
    indexes: [
        {
            unique: true,
            fields: ['repertorio_id', 'cifra_id'],
            name: 'unique_repertorio_cifra'
        },
        {
            fields: ['repertorio_id']
        },
        {
            fields: ['cifra_id']
        }
    ]
});

module.exports = { Repertorio, RepertorioCifra }; 