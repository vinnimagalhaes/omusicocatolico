// Constantes da aplicação OMúsicoCatólico

// Categorias de cifras
const CATEGORIAS_CIFRAS = {
    ENTRADA: 'entrada',
    GLORIA: 'gloria',
    SALMO: 'salmo',
    ALELUIA: 'aleluia',
    OFERTORIO: 'ofertorio',
    SANTO: 'santo',
    COMUNHAO: 'comunhao',
    FINAL: 'final',
    ADORACAO: 'adoracao',
    MARIA: 'maria',
    NATAL: 'natal',
    PASCOA: 'pascoa',
    OUTRAS: 'outras'
};

// Labels das categorias
const LABELS_CATEGORIAS = {
    [CATEGORIAS_CIFRAS.ENTRADA]: 'Entrada',
    [CATEGORIAS_CIFRAS.GLORIA]: 'Glória',
    [CATEGORIAS_CIFRAS.SALMO]: 'Salmo',
    [CATEGORIAS_CIFRAS.ALELUIA]: 'Aleluia',
    [CATEGORIAS_CIFRAS.OFERTORIO]: 'Ofertório',
    [CATEGORIAS_CIFRAS.SANTO]: 'Santo',
    [CATEGORIAS_CIFRAS.COMUNHAO]: 'Comunhão',
    [CATEGORIAS_CIFRAS.FINAL]: 'Final',
    [CATEGORIAS_CIFRAS.ADORACAO]: 'Adoração',
    [CATEGORIAS_CIFRAS.MARIA]: 'Maria',
    [CATEGORIAS_CIFRAS.NATAL]: 'Natal',
    [CATEGORIAS_CIFRAS.PASCOA]: 'Páscoa',
    [CATEGORIAS_CIFRAS.OUTRAS]: 'Outras'
};

// Tons musicais válidos
const TONS_MUSICAIS = [
    'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 
    'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

// Tipos de arquivo suportados para OCR
const TIPOS_ARQUIVO_OCR = {
    IMAGEM: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    PDF: ['application/pdf'],
    TODOS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
};

// Limites de upload
const LIMITES_UPLOAD = {
    TAMANHO_MAX_ARQUIVO: 10 * 1024 * 1024, // 10MB
    NUMERO_MAX_ARQUIVOS: 5
};

// Configurações de OCR
const CONFIG_OCR = {
    CONFIANCA_MINIMA: 25,
    TOLERANCIA_Y_ALTA: 10,
    TOLERANCIA_Y_MEDIA: 15,
    TOLERANCIA_Y_BAIXA: 25,
    THRESHOLD_CONFIANCA_ALTA: 80,
    THRESHOLD_CONFIANCA_MEDIA: 60
};

// Padrões de acordes para detecção
const PADROES_ACORDES = {
    ACORDES_BASICOS: [
        // Acordes maiores
        'C', 'D', 'E', 'F', 'G', 'A', 'B',
        'Dm', 'Em', 'Am', 'Bm',
        // Acordes com sustenido/bemol
        'C#', 'D#', 'F#', 'G#', 'A#',
        'Db', 'Eb', 'Gb', 'Ab', 'Bb'
    ],
    SUFIXOS_ACORDES: [
        'm', 'maj', 'maj7', 'm7', '7', 'sus2', 'sus4',
        'add9', '9', '11', '13', 'dim', 'aug', '+5', '-5'
    ]
};

// Fontes de importação de cifras
const FONTES_IMPORTACAO = {
    USUARIO: 'usuario',
    CIFRA_CLUB: 'cifra_club',
    IMPORTACAO: 'importacao',
    OCR: 'ocr'
};

// Status de processamento
const STATUS_PROCESSAMENTO = {
    PENDENTE: 'pendente',
    PROCESSANDO: 'processando',
    CONCLUIDO: 'concluido',
    ERRO: 'erro'
};

// Configurações de autenticação
const CONFIG_AUTH = {
    JWT_EXPIRATION: '7d',
    BCRYPT_ROUNDS: 12
};

// Mensagens de erro padrão
const MENSAGENS_ERRO = {
    SERVIDOR_INTERNO: 'Erro interno do servidor',
    NAO_AUTORIZADO: 'Acesso não autorizado',
    PERMISSAO_NEGADA: 'Permissão negada',
    NAO_ENCONTRADO: 'Recurso não encontrado',
    DADOS_INVALIDOS: 'Dados inválidos fornecidos',
    ARQUIVO_NAO_SUPORTADO: 'Tipo de arquivo não suportado',
    ARQUIVO_MUITO_GRANDE: 'Arquivo muito grande',
    MUITOS_ARQUIVOS: 'Muitos arquivos enviados'
};

module.exports = {
    CATEGORIAS_CIFRAS,
    LABELS_CATEGORIAS,
    TONS_MUSICAIS,
    TIPOS_ARQUIVO_OCR,
    LIMITES_UPLOAD,
    CONFIG_OCR,
    PADROES_ACORDES,
    FONTES_IMPORTACAO,
    STATUS_PROCESSAMENTO,
    CONFIG_AUTH,
    MENSAGENS_ERRO
}; 