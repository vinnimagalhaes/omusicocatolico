#!/bin/bash

echo "🎵 Iniciando OMúsicoCatólico..."
echo "📍 Verificando dependências..."

# Verificar se o google-auth-library está instalado
if ! npm list google-auth-library &>/dev/null; then
    echo "⚠️  Instalando google-auth-library..."
    npm install google-auth-library
fi

echo "✅ Dependências verificadas!"
echo "🚀 Iniciando servidor na porta 3000..."

cd backend && node server.js 