const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Favorito = sequelize.define('Favorito', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
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
    }
}, {
    tableName: 'favoritos',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'cifra_id'],
            name: 'unique_user_cifra_favorito'
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['cifra_id']
        }
    ]
});

module.exports = Favorito; 