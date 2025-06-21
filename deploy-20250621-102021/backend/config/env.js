require('dotenv').config();

const config = {
    // Ambiente
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // Servidor
    PORT: process.env.PORT || 8000,
    
    // Segurança
    JWT_SECRET: process.env.JWT_SECRET || 'sua_chave_super_secreta_aqui_128_caracteres_minimo_para_jwt_tokens_desenvolvimento',
    
    // Banco de dados
    DB_PATH: process.env.DB_PATH || './backend/database.sqlite',
    
    // URLs
    FRONTEND_URL: process.env.FRONTEND_URL || `http://localhost:${process.env.PORT || 8000}`,
    API_URL: process.env.API_URL || `http://localhost:${process.env.PORT || 8000}/api`,
    
    // Upload
    MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
    UPLOAD_PATH: process.env.UPLOAD_PATH || './frontend/uploads',
    
    // Email
    EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
    EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
    EMAIL_USER: process.env.EMAIL_USER || '',
    EMAIL_PASS: process.env.EMAIL_PASS || '',
    
    // Logs
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Desenvolvimento
    isDevelopment: () => config.NODE_ENV === 'development',
    isProduction: () => config.NODE_ENV === 'production',
    
    // URLs dinâmicas
    getBaseUrl: () => {
        if (config.isProduction()) {
            return config.FRONTEND_URL;
        }
        return `http://localhost:${config.PORT}`;
    },
    
    getApiUrl: () => {
        if (config.isProduction()) {
            return config.API_URL;
        }
        return `http://localhost:${config.PORT}/api`;
    }
};

module.exports = config; 