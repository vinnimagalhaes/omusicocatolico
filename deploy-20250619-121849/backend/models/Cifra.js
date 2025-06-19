const { DataTypes } = require('sequelize');
const sequelize = require('../database/config');

const Cifra = sequelize.define('Cifra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    titulo: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 200]
        }
    },
    artista: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 100]
        }
    },
    compositor: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tom: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [1, 10]
        }
    },
    categoria: {
        type: DataTypes.ENUM('entrada', 'gloria', 'salmo', 'aleluia', 'ofertorio', 'santo', 'comunhao', 'final', 'adoracao', 'maria', 'natal', 'pascoa', 'outras'),
        allowNull: false,
        defaultValue: 'outras'
    },
    letra: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    letra_original: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    duracao: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Duração em formato MM:SS'
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    tags: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array de tags para busca'
    },
    youtube_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    spotify_url: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    dificuldade: {
        type: DataTypes.ENUM('facil', 'medio', 'dificil'),
        defaultValue: 'medio'
    },
    bpm: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 60,
            max: 200
        }
    },
    capo: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 12
        }
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status_analise: {
        type: DataTypes.ENUM('privada', 'pendente', 'aprovada', 'rejeitada'),
        defaultValue: 'privada',
        comment: 'Status da cifra: privada (só do usuário), pendente (enviada para análise), aprovada (pública), rejeitada (negada)'
    },
    data_submissao: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Data em que foi enviada para análise'
    },
    observacoes_analise: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Observações do moderador sobre a análise'
    }
    // url_original: {
    //     type: DataTypes.STRING,
    //     allowNull: true,
    //     validate: {
    //         isUrl: true
    //     },
    //     comment: 'URL original da cifra importada de sites externos'
    // }
}, {
    tableName: 'cifras',
    indexes: [
        {
            fields: ['titulo']
        },
        {
            fields: ['artista']
        },
        {
            fields: ['categoria']
        },
        {
            fields: ['views']
        },
        {
            fields: ['user_id']
        }
        // {
        //     fields: ['url_original']  // Temporariamente removido até coluna ser criada
        // }
    ]
});

// Método para incrementar views
Cifra.prototype.incrementarViews = async function() {
    this.views += 1;
    await this.save({ fields: ['views'] });
    return this;
};

// Método para formatar views para exibição
Cifra.prototype.getViewsFormatadas = function() {
    if (this.views >= 1000000) {
        return Math.floor(this.views / 1000000) + 'M';
    } else if (this.views >= 1000) {
        return Math.floor(this.views / 1000) + 'k';
    }
    return this.views.toString();
};

module.exports = Cifra; 