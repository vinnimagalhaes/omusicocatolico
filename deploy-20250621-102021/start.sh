#!/bin/bash

echo "🚀 Iniciando OMúsicoCatólico..."

# Instalar dependências de produção
npm run install:production

# Criar diretórios necessários
mkdir -p storage logs uploads

# Iniciar com PM2
npm run start:pm2

echo "✅ OMúsicoCatólico iniciado com sucesso!"
echo "📊 Monitore com: pm2 monit"
echo "📝 Logs: pm2 logs omusicocatolico-api"
