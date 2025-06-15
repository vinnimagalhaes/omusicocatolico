#!/bin/bash

# 🚀 Script de Deploy - OMúsicoCatólico
# Execute com: bash deploy.sh

set -e

echo "🎵 Iniciando deploy do OMúsicoCatólico..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute o script no diretório raiz do projeto."
    exit 1
fi

# 1. Atualizar código
log "📥 Atualizando código do repositório..."
git pull origin main || {
    warn "Falha ao fazer git pull. Continuando..."
}

# 2. Instalar/atualizar dependências
log "📦 Instalando dependências..."
npm install --production

# 3. Criar diretórios necessários
log "📁 Criando diretórios necessários..."
mkdir -p logs
mkdir -p frontend/uploads
mkdir -p backend/uploads

# 4. Verificar arquivo .env
if [ ! -f ".env" ]; then
    warn "Arquivo .env não encontrado. Criando a partir do exemplo..."
    cp env.example .env
    warn "⚠️  IMPORTANTE: Configure as variáveis de ambiente no arquivo .env antes de continuar!"
    echo "Edite o arquivo .env e execute o script novamente."
    exit 1
fi

# 5. Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    log "📦 Instalando PM2..."
    npm install -g pm2
fi

# 6. Parar aplicação se estiver rodando
log "🛑 Parando aplicação atual..."
pm2 stop omusicacatolico 2>/dev/null || true
pm2 delete omusicacatolico 2>/dev/null || true

# 7. Iniciar aplicação
log "🚀 Iniciando aplicação..."
pm2 start ecosystem.config.js --env production

# 8. Salvar configuração PM2
log "💾 Salvando configuração PM2..."
pm2 save

# 9. Configurar auto-start (apenas se não estiver configurado)
if ! pm2 startup | grep -q "already"; then
    log "⚙️  Configurando auto-start..."
    pm2 startup
fi

# 10. Verificar status
log "📊 Verificando status da aplicação..."
sleep 5
pm2 status

# 11. Teste básico
log "🧪 Testando aplicação..."
if curl -f http://localhost:3000/api/cifras > /dev/null 2>&1; then
    log "✅ Aplicação está respondendo corretamente!"
else
    error "❌ Aplicação não está respondendo. Verifique os logs:"
    pm2 logs omusicacatolico --lines 20
    exit 1
fi

# 12. Mostrar informações úteis
echo ""
echo -e "${BLUE}🎉 Deploy concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}📋 Informações úteis:${NC}"
echo -e "   • Status: ${GREEN}pm2 status${NC}"
echo -e "   • Logs: ${GREEN}pm2 logs omusicacatolico${NC}"
echo -e "   • Restart: ${GREEN}pm2 restart omusicacatolico${NC}"
echo -e "   • Stop: ${GREEN}pm2 stop omusicacatolico${NC}"
echo ""

# 13. Verificar se Nginx está configurado
if command -v nginx &> /dev/null; then
    if nginx -t 2>/dev/null; then
        log "✅ Nginx configurado corretamente"
    else
        warn "⚠️  Nginx encontrado mas com problemas de configuração"
    fi
else
    warn "⚠️  Nginx não encontrado. Para produção, configure um proxy reverso."
fi

log "🎵 Deploy finalizado! O OMúsicoCatólico está no ar! 🎉" 