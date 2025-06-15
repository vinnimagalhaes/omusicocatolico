const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Banner = sequelize.define('Banner', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Banner'
    },
    arquivo: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nome do arquivo de imagem do banner'
    },
    descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descrição do banner'
    },
    link_url: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL para redirecionamento quando clicado'
    },
    ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Ordem de exibição do banner'
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o banner está ativo para exibição'
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Usuário que criou o banner'
    },
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de início da exibição (opcional)'
    },
    data_fim: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de fim da exibição (opcional)'
    }
}, {
    tableName: 'banners',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            name: 'banners_user_id',
            fields: ['user_id']
        },
        {
            name: 'banners_ativo',
            fields: ['ativo']
        },
        {
            name: 'banners_ordem',
            fields: ['ordem']
        }
    ]
});

module.exports = Banner;