#!/bin/bash

# 🎵 Script de Inicialização - OMúsicoCatólico
# Para desenvolvimento local

echo "🎵 Iniciando OMúsicoCatólico em modo desenvolvimento..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute o script no diretório raiz do projeto"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p frontend/uploads
mkdir -p backend/uploads
mkdir -p logs

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚙️  Criando arquivo .env..."
    cp env.example .env
    echo "✅ Arquivo .env criado. Configure as variáveis se necessário."
fi

# Parar qualquer processo anterior
echo "🛑 Parando processos anteriores..."
pkill -f "node.*server.js" 2>/dev/null || true

# Iniciar servidor
echo "🚀 Iniciando servidor..."
cd backend && node server.js 