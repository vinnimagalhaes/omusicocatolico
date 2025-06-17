#!/bin/bash

# 🗄️ Script para configurar MySQL no servidor de produção
# Execute este script no seu servidor Digital Ocean

echo "🗄️ Configurando MySQL para produção..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# 1. Instalar MySQL
log "📦 Instalando MySQL..."
sudo apt update
sudo apt install -y mysql-server

# 2. Configurar segurança do MySQL
log "🔒 Configurando segurança do MySQL..."
sudo mysql_secure_installation

# 3. Criar banco de dados e usuário
log "🗄️ Criando banco de dados..."
sudo mysql -e "
CREATE DATABASE IF NOT EXISTS omusicocatolico;
CREATE USER IF NOT EXISTS 'omusicocatolico'@'localhost' IDENTIFIED BY 'OMusicoCatolico2025p*';
GRANT ALL PRIVILEGES ON omusicocatolico.* TO 'omusicocatolico'@'localhost';
FLUSH PRIVILEGES;
"

# 4. Verificar se foi criado
log "✅ Verificando criação do banco..."
sudo mysql -e "SHOW DATABASES;" | grep omusicocatolico

# 5. Configurar MySQL para aceitar conexões
log "⚙️ Configurando MySQL..."
sudo systemctl enable mysql
sudo systemctl start mysql

# 6. Verificar status
log "📊 Status do MySQL:"
sudo systemctl status mysql --no-pager

echo ""
log "🎉 MySQL configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Copie o arquivo env.production.example para .env"
echo "2. Configure as variáveis de ambiente"
echo "3. Execute: npm run sync:force"
echo "4. Reinicie a aplicação: pm2 restart omusicacatolico"
echo ""
echo "🔐 Credenciais do banco:"
echo "   • Database: omusicocatolico"
echo "   • Usuário: omusicocatolico"
echo "   • Senha: OMusicoCatolico2025p*"
echo "   ⚠️  IMPORTANTE: Altere a senha em produção!" 