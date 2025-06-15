#!/bin/bash

echo "🎵 Iniciando OMúsicoCatólico Server..."
echo "📁 Diretório: $(pwd)"

cd backend

echo "🔍 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

echo "🚀 Iniciando servidor..."
echo "📱 Acesse: http://localhost:8000"
echo "👑 Painel Master: http://localhost:8000/master-dashboard.html"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo "=" * 50

node server.js 