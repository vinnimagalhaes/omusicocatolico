#!/bin/bash

# Script para atualizar a navegação em todas as páginas do OMúsicoCatólico
# Remove a barra duplicada e unifica a navegação com menu de usuário integrado

echo "🔄 Atualizando navegação em todas as páginas..."

# Lista de páginas para atualizar
PAGES=(
    "frontend/minhas-cifras.html"
    "frontend/categorias.html"
    "frontend/repertorios.html"
    "frontend/repertorios-comunidade.html"
    "frontend/perfil.html"
)

# Função para atualizar uma página
update_page() {
    local page=$1
    echo "📝 Atualizando $page..."
    
    # Verificar se a página existe
    if [ ! -f "$page" ]; then
        echo "❌ Página $page não encontrada"
        return 1
    fi
    
    # Criar backup
    cp "$page" "$page.backup"
    
    # Atualizar a página usando sed
    # Remover o header principal duplicado
    sed -i '' '/<!-- Header Principal -->/,/<\/header>/d' "$page"
    sed -i '' '/<!-- Header -->/,/<\/header>/d' "$page"
    
    # Substituir a navegação existente pela nova estrutura
    # Primeiro, encontrar onde começa a navegação atual
    sed -i '' 's/<!-- Navegação Principal -->/<!-- Navegação Principal Unificada -->/' "$page"
    
    # Adicionar data-nav attributes
    sed -i '' 's/href="\/inicio"/href="\/inicio" data-nav="inicio"/g' "$page"
    sed -i '' 's/href="\/favoritas"/href="\/favoritas" data-nav="favoritas"/g' "$page"
    sed -i '' 's/href="\/minhas-cifras"/href="\/minhas-cifras" data-nav="minhas-cifras"/g' "$page"
    sed -i '' 's/href="\/categorias"/href="\/categorias" data-nav="categorias"/g' "$page"
    sed -i '' 's/href="\/repertorios"/href="\/repertorios" data-nav="repertorios"/g' "$page"
    sed -i '' 's/href="\/repertorios-comunidade"/href="\/repertorios-comunidade" data-nav="repertorios-comunidade"/g' "$page"
    
    # Adicionar data-nav para dropdowns
    sed -i '' 's/nav-dropdown-toggle">/nav-dropdown-toggle" data-nav="repertorios">/g' "$page"
    
    # Adicionar id="mainNavigation" na navegação
    sed -i '' 's/<nav class="main-navigation">/<nav class="main-navigation" id="mainNavigation">/g' "$page"
    
    echo "✅ $page atualizada com sucesso"
}

# Atualizar cada página
for page in "${PAGES[@]}"; do
    update_page "$page"
done

echo "🎉 Atualização concluída!"
echo "📋 Páginas atualizadas:"
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "  ✅ $page"
    else
        echo "  ❌ $page (não encontrada)"
    fi
done

echo ""
echo "💡 Próximos passos:"
echo "1. Verifique se todas as páginas estão funcionando corretamente"
echo "2. Teste a navegação em desktop e mobile"
echo "3. Verifique se o menu de usuário está funcionando"
echo "4. Se necessário, restaure os backups: *.backup" 