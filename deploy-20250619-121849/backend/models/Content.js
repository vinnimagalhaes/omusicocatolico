const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Content = sequelize.define('Content', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: DataTypes.ENUM('pagina', 'banner', 'texto', 'imagem', 'carrossel'),
        allowNull: false,
        comment: 'Tipo do conteúdo'
    },
    chave: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Chave única para identificar o conteúdo (ex: home_banner_1, sobre_texto)'
    },
    titulo: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Título do conteúdo'
    },
    conteudo: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Conteúdo HTML ou texto'
    },
    url_imagem: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL da imagem associada'
    },
    url_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL de destino (para banners/links)'
    },
    ordem: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: 'Ordem de exibição (para carrosseis/listas)'
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Se o conteúdo está ativo'
    },
    data_inicio: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de início de exibição (para campanhas)'
    },
    data_fim: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data de fim de exibição (para campanhas)'
    },
    metadados: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Dados extras em JSON (configurações específicas)'
    },
    criado_por: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'ID do usuário que criou'
    },
    atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        },
        comment: 'ID do último usuário que atualizou'
    }
}, {
    tableName: 'contents',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        {
            fields: ['tipo']
        },
        {
            fields: ['chave']
        },
        {
            fields: ['ativo']
        },
        {
            fields: ['ordem']
        }
    ]
});

// Métodos do modelo
Content.prototype.isAtivo = function() {
    if (!this.ativo) return false;
    
    const agora = new Date();
    
    if (this.data_inicio && agora < this.data_inicio) return false;
    if (this.data_fim && agora > this.data_fim) return false;
    
    return true;
};

Content.prototype.getImagemCompleta = function() {
    if (!this.url_imagem) return null;
    
    // Se já é uma URL completa, retorna como está
    if (this.url_imagem.startsWith('http')) {
        return this.url_imagem;
    }
    
    // Senão, adiciona o prefixo do servidor
    return `/uploads/${this.url_imagem}`;
};

module.exports = Content; 