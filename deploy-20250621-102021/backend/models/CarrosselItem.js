const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const CarrosselItem = sequelize.define('CarrosselItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subtitulo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    imagem: {
        type: DataTypes.STRING,
        allowNull: false
    },
    link_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tipo_carrossel: {
        type: DataTypes.ENUM('mais_tocadas', 'novas_cifras', 'por_categoria'),
        allowNull: false
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: true
    },
    data_fim: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'carrossel_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = CarrosselItem; 