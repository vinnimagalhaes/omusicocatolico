const sequelize = require('../database/config');

// Importar modelos
const User = require('./User');
const Cifra = require('./Cifra');
const Favorito = require('./Favorito');
const { Repertorio, RepertorioCifra } = require('./Repertorio');
const Banner = require('./Banner');
const CarrosselItem = require('./CarrosselItem');
const Content = require('./Content');

// Definir relacionamentos

// User -> Cifra (1:N)
User.hasMany(Cifra, {
    foreignKey: 'user_id',
    as: 'cifras'
});
Cifra.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario'
});

// User -> Favorito (1:N)
User.hasMany(Favorito, {
    foreignKey: 'user_id',
    as: 'favoritos'
});
Favorito.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario'
});

// Cifra -> Favorito (1:N)
Cifra.hasMany(Favorito, {
    foreignKey: 'cifra_id',
    as: 'favoritos'
});
Favorito.belongsTo(Cifra, {
    foreignKey: 'cifra_id',
    as: 'cifra'
});

// User -> Repertorio (1:N)
User.hasMany(Repertorio, {
    foreignKey: 'user_id',
    as: 'repertorios'
});
Repertorio.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario'
});

// User -> Banner (1:N)
User.hasMany(Banner, {
    foreignKey: 'user_id',
    as: 'banners'
});
Banner.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario'
});

// User -> CarrosselItem (1:N)
User.hasMany(CarrosselItem, {
    foreignKey: 'user_id',
    as: 'carrossel_items'
});
CarrosselItem.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'usuario'
});

// User -> Content (1:N)
User.hasMany(Content, {
    foreignKey: 'criado_por',
    as: 'conteudos_criados'
});
Content.belongsTo(User, {
    foreignKey: 'criado_por',
    as: 'criador'
});

User.hasMany(Content, {
    foreignKey: 'atualizado_por',
    as: 'conteudos_atualizados'
});
Content.belongsTo(User, {
    foreignKey: 'atualizado_por',
    as: 'atualizador'
});

// Repertorio -> RepertorioCifra (1:N)
Repertorio.hasMany(RepertorioCifra, {
    foreignKey: 'repertorio_id',
    as: 'cifras_do_repertorio'
});
RepertorioCifra.belongsTo(Repertorio, {
    foreignKey: 'repertorio_id',
    as: 'repertorio'
});

// Cifra -> RepertorioCifra (1:N)
Cifra.hasMany(RepertorioCifra, {
    foreignKey: 'cifra_id',
    as: 'repertorios_relacionados'
});
RepertorioCifra.belongsTo(Cifra, {
    foreignKey: 'cifra_id',
    as: 'cifra'
});

// Relacionamentos Many-to-Many através de tabelas intermediárias

// User <-> Cifra (Favoritos)
User.belongsToMany(Cifra, {
    through: Favorito,
    foreignKey: 'user_id',
    otherKey: 'cifra_id',
    as: 'cifras_favoritas'
});
Cifra.belongsToMany(User, {
    through: Favorito,
    foreignKey: 'cifra_id',
    otherKey: 'user_id',
    as: 'usuarios_que_favoritaram'
});

// Repertorio <-> Cifra (Repertórios)
Repertorio.belongsToMany(Cifra, {
    through: RepertorioCifra,
    foreignKey: 'repertorio_id',
    otherKey: 'cifra_id',
    as: 'cifras'
});
Cifra.belongsToMany(Repertorio, {
    through: RepertorioCifra,
    foreignKey: 'cifra_id',
    otherKey: 'repertorio_id',
    as: 'repertorios'
});

// Função para sincronizar banco de dados
const sincronizarBanco = async (force = false) => {
    try {
        await sequelize.sync({ force });
        console.log('✅ Banco de dados sincronizado!');
        
        if (force) {
            console.log('🌱 Adicionando dados iniciais...');
            await adicionarDadosIniciais();
        }
    } catch (error) {
        console.error('❌ Erro ao sincronizar banco:', error);
        throw error;
    }
};

// Função para adicionar dados iniciais
const adicionarDadosIniciais = async () => {
    try {
        // Criar usuário admin padrão
        const adminUser = await User.findOrCreate({
            where: { email: 'admin@omusicacatolico.com' },
            defaults: {
                nome: 'Administrador',
                email: 'admin@omusicacatolico.com',
                senha: 'admin123',
                role: 'admin'
            }
        });

        // Cifras iniciais
        const cifrasIniciais = [
            {
                titulo: "Segura na Mão de Deus",
                artista: "Pe. Zezinho",
                compositor: "Pe. Zezinho",
                tom: "G",
                categoria: "entrada",
                letra: `[Verso 1]
G                    C                G
Segura na mão de Deus e vai
                    D               G
Não temas o amanhã, ele vem
                    C               G
Segura na mão de Deus e vai
                    D               G
Não temas, pois Ele te sustém

[Refrão]
G                    C
Ainda que venha a tempestade
G                    D
Segura na mão de Deus
G                    C
Ele é tua felicidade
G            D       G
Segura na mão de Deus`,
                tags: ['esperança', 'confiança', 'deus'],
                duracao: "3:45",
                views: 2400,
                dificuldade: 'facil'
            },
            {
                titulo: "Eis-me Aqui, Senhor",
                artista: "Comunidade Católica",
                compositor: "Comunidade Católica",
                tom: "D",
                categoria: "comunhao",
                letra: `[Verso 1]
D                    G               D
Eis-me aqui, Senhor, para fazer Tua vontade
                    A               D
Eis-me aqui, Senhor, para Te obedecer

[Refrão]
D                    G
Fala, que Teu servo escuta
D                    A
Fala, Senhor, com Teu servo
D                    G               D
Eis-me aqui, pronto para servir`,
                tags: ['obediência', 'serviço', 'chamado'],
                duracao: "4:12",
                views: 1800,
                dificuldade: 'medio'
            },
            {
                titulo: "A Barca",
                artista: "Pe. Zezinho",
                compositor: "Pe. Zezinho",
                tom: "C",
                categoria: "final",
                letra: `[Verso 1]
C                    F               C
Tu vens também na minha barca
                    G               C
Quando navego neste mar
                    F               C
Tu vens também na minha barca
                    G               C
Para comigo navegar

[Refrão]
F                    C
Nesta barca eu não estou sozinho
G                    C
Jesus Cristo vem comigo
F                    C               G    C
Nesta barca que é a minha vida`,
                tags: ['companhia', 'jesus', 'vida'],
                duracao: "3:28",
                views: 3100,
                dificuldade: 'facil'
            }
        ];

        for (const cifraData of cifrasIniciais) {
            await Cifra.findOrCreate({
                where: { titulo: cifraData.titulo, artista: cifraData.artista },
                defaults: { ...cifraData, user_id: adminUser[0].id }
            });
        }

        console.log('✅ Dados iniciais adicionados!');
    } catch (error) {
        console.error('❌ Erro ao adicionar dados iniciais:', error);
    }
};

// Exportar modelos e funções
module.exports = {
    sequelize,
    User,
    Cifra,
    Favorito,
    Repertorio,
    RepertorioCifra,
    Banner,
    CarrosselItem,
    Content,
    sincronizarBanco,
    adicionarDadosIniciais
}; 