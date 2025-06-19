# Sistema de Design CSS - OMúsicoCatólico

Este é o sistema de design CSS padronizado para o projeto OMúsicoCatólico. Ele foi criado para garantir consistência visual, facilidade de manutenção e desenvolvimento profissional.

## 📁 Estrutura dos Arquivos

```
frontend/css/
├── design-system.css   # Variáveis CSS e utilitários base
├── components.css      # Componentes reutilizáveis
├── responsive.css      # Media queries e responsividade
├── main.css           # Arquivo principal que importa tudo
└── README.md          # Esta documentação
```

## 🚀 Como Usar

### 1. Importação nos HTML

**NOVO (Recomendado):**
```html
<link href="css/main.css" rel="stylesheet">
```

**ANTIGO (Remover gradualmente):**
```html
<link href="estilo.css" rel="stylesheet">
<link href="estilo-novo.css" rel="stylesheet">
<link href="css/responsive.css" rel="stylesheet">
```

### 2. Estrutura HTML Base

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sua Página - OMúsicoCatólico</title>
    
    <!-- Fontes -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- Novo Sistema CSS -->
    <link href="css/main.css" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="app-header">
            <!-- Conteúdo do header -->
        </header>
        
        <!-- Main Content -->
        <main class="app-main">
            <div class="container">
                <!-- Seu conteúdo aqui -->
            </div>
        </main>
        
        <!-- Footer -->
        <footer class="app-footer">
            <!-- Conteúdo do footer -->
        </footer>
    </div>
</body>
</html>
```

## 🎨 Design Tokens (Variáveis CSS)

### Cores

```css
/* Cores Primárias */
var(--color-primary-50)    /* #eff6ff - Azul muito claro */
var(--color-primary-600)   /* #2563eb - Azul principal */
var(--color-primary-700)   /* #1d4ed8 - Azul escuro */

/* Cores Secundárias */
var(--color-secondary-600) /* #059669 - Verde principal */

/* Cores Neutras */
var(--color-gray-50)       /* #f9fafb - Cinza clarinho */
var(--color-gray-500)      /* #6b7280 - Cinza médio */
var(--color-gray-900)      /* #111827 - Cinza escuro */

/* Cores de Estado */
var(--color-success)       /* Verde de sucesso */
var(--color-warning)       /* Amarelo de aviso */
var(--color-error)         /* Vermelho de erro */
```

### Tipografia

```css
/* Tamanhos */
var(--font-size-xs)        /* 12px */
var(--font-size-sm)        /* 14px */
var(--font-size-base)      /* 16px */
var(--font-size-lg)        /* 18px */
var(--font-size-xl)        /* 20px */
var(--font-size-2xl)       /* 24px */

/* Pesos */
var(--font-weight-normal)  /* 400 */
var(--font-weight-medium)  /* 500 */
var(--font-weight-semibold) /* 600 */
var(--font-weight-bold)    /* 700 */

/* Famílias */
var(--font-family-primary) /* Inter, sans-serif */
var(--font-family-mono)    /* Roboto Mono, monospace */
```

### Espaçamentos

```css
var(--spacing-1)   /* 4px */
var(--spacing-2)   /* 8px */
var(--spacing-3)   /* 12px */
var(--spacing-4)   /* 16px */
var(--spacing-6)   /* 24px */
var(--spacing-8)   /* 32px */
var(--spacing-12)  /* 48px */
```

### Border Radius

```css
var(--radius-md)   /* 6px */
var(--radius-lg)   /* 8px */
var(--radius-xl)   /* 12px */
var(--radius-2xl)  /* 16px */
```

## 🧩 Componentes

### Botões

```html
<!-- Botão Primário -->
<button class="btn btn-primary btn-base">
    <i class="fas fa-plus"></i>
    Adicionar Cifra
</button>

<!-- Botão Secundário -->
<button class="btn btn-secondary btn-sm">Salvar</button>

<!-- Botão Outline -->
<button class="btn btn-outline btn-lg">Cancelar</button>

<!-- Botão Ghost -->
<button class="btn btn-ghost btn-xs">Editar</button>
```

**Tamanhos:** `btn-xs`, `btn-sm`, `btn-base`, `btn-lg`, `btn-xl`
**Tipos:** `btn-primary`, `btn-secondary`, `btn-outline`, `btn-ghost`, `btn-danger`

### Cards

```html
<div class="card">
    <div class="card-header">
        <h3 class="card-title">Título do Card</h3>
        <p class="card-subtitle">Subtítulo opcional</p>
    </div>
    <div class="card-body">
        <p class="card-text">Conteúdo do card...</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary btn-sm">Ação</button>
    </div>
</div>
```

### Navegação

```html
<nav class="nav">
    <div class="nav-container">
        <a href="#" class="nav-brand">
            <i class="fas fa-music"></i>
            OMúsicoCatólico
        </a>
        
        <ul class="nav-menu">
            <li class="nav-item">
                <a href="#" class="nav-link active">Início</a>
            </li>
            <li class="nav-item nav-dropdown">
                <a href="#" class="nav-link">
                    Cifras <i class="fas fa-chevron-down"></i>
                </a>
                <div class="nav-dropdown-menu">
                    <a href="#" class="nav-dropdown-item">Todas as Cifras</a>
                    <a href="#" class="nav-dropdown-item">Por Categoria</a>
                </div>
            </li>
        </ul>
    </div>
</nav>
```

### Formulários

```html
<div class="form-group">
    <label class="form-label">Nome da Cifra</label>
    <input type="text" class="form-input" placeholder="Digite o nome...">
    <span class="form-help">Dica opcional</span>
</div>

<div class="form-group">
    <label class="form-label">Descrição</label>
    <textarea class="form-textarea" rows="4"></textarea>
</div>

<div class="form-group">
    <label class="form-label">Categoria</label>
    <select class="form-select">
        <option>Selecione...</option>
        <option>Entrada</option>
        <option>Ofertório</option>
    </select>
</div>
```

### Modais

```html
<div class="modal" id="meuModal">
    <div class="modal-content">
        <div class="modal-header">
            <h2 class="modal-title">Título do Modal</h2>
            <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
            <p>Conteúdo do modal...</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost">Cancelar</button>
            <button class="btn btn-primary">Salvar</button>
        </div>
    </div>
</div>
```

### Cifras

```html
<!-- Card de Cifra -->
<div class="cifra-card">
    <div class="cifra-header">
        <h3 class="cifra-title">Nome da Música</h3>
        <p class="cifra-artist">Artista</p>
    </div>
    <div class="cifra-content">
        <div class="cifra-linha">
            <span class="cifra-acordes">C    F    G    C</span>
            <span class="cifra-letra">Ave Maria cheia de graça</span>
        </div>
    </div>
    <div class="cifra-actions">
        <div class="tag-group">
            <span class="tag tag-tom">C</span>
            <span class="tag tag-categoria">Mariana</span>
        </div>
        <button class="btn btn-ghost btn-xs">
            <i class="fas fa-heart"></i>
        </button>
    </div>
</div>

<!-- Grid de Cifras -->
<div class="cifra-grid cols-3">
    <!-- Múltiplos cifra-card aqui -->
</div>
```

### Tags e Badges

```html
<!-- Tags -->
<span class="tag">Padrão</span>
<span class="tag tag-tom">Tom: C</span>
<span class="tag tag-categoria">Entrada</span>

<!-- Badges -->
<span class="badge badge-primary">Novo</span>
<span class="badge badge-success">Aprovado</span>
<span class="badge badge-warning">Pendente</span>
<span class="badge badge-danger">Rejeitado</span>
```

### Alertas

```html
<div class="alert alert-success">
    <i class="fas fa-check-circle"></i>
    Cifra salva com sucesso!
</div>

<div class="alert alert-warning">
    <i class="fas fa-exclamation-triangle"></i>
    Verifique os dados antes de continuar.
</div>

<div class="alert alert-danger">
    <i class="fas fa-times-circle"></i>
    Erro ao salvar a cifra.
</div>
```

## 📱 Sistema de Grid Responsivo

### Grid de Cifras

```html
<!-- 1 coluna (mobile) -->
<div class="cifra-grid cols-1">
    <!-- cifras aqui -->
</div>

<!-- 2 colunas (tablet) -->
<div class="cifra-grid cols-2">
    <!-- cifras aqui -->
</div>

<!-- 3 colunas (desktop) -->
<div class="cifra-grid cols-3">
    <!-- cifras aqui -->
</div>

<!-- 4 colunas (desktop grande) -->
<div class="cifra-grid cols-4">
    <!-- cifras aqui -->
</div>
```

### Grid Geral

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>
```

### Utilitários Responsivos

```html
<!-- Visível apenas no desktop -->
<div class="hidden lg:block">Conteúdo desktop</div>

<!-- Visível apenas no mobile -->
<div class="block lg:hidden">Conteúdo mobile</div>

<!-- Flex responsivo -->
<div class="flex-col md:flex-row">
    <div>Coluna 1</div>
    <div>Coluna 2</div>
</div>
```

## 🎯 Classes Utilitárias

### Tipografia

```html
<h1 class="text-3xl font-bold text-primary">Título Principal</h1>
<p class="text-base text-gray-600">Parágrafo normal</p>
<small class="text-sm text-gray-500">Texto pequeno</small>
```

### Espaçamentos

```html
<div class="p-4">Padding médio</div>
<div class="m-6">Margin grande</div>
<div class="px-8 py-4">Padding horizontal e vertical</div>
```

### Cores

```html
<div class="bg-primary text-white">Fundo azul</div>
<div class="bg-gray-50 text-gray-900">Fundo cinza claro</div>
```

### Flexbox

```html
<div class="flex items-center justify-between">
    <div>Esquerda</div>
    <div>Direita</div>
</div>
```

## ⚡ Performance e Otimização

### Carregamento dos Estilos

1. **Crítico**: Carregue apenas `main.css`
2. **Fontes**: Use `preload` para fontes críticas
3. **Cache**: Adicione versioning (`?v=1.0`) quando necessário

### Minimização de Estilos Inline

Evite estilos inline. Use classes do sistema:

```html
<!-- ❌ Evitar -->
<div style="padding: 16px; background: #f9fafb;">

<!-- ✅ Recomendado -->
<div class="p-4 bg-gray-50">
```

## 🔧 Migração dos Arquivos Antigos

### Passo a Passo

1. **Substitua as importações CSS**:
   ```html
   <!-- Remover -->
   <link href="estilo.css" rel="stylesheet">
   <link href="estilo-novo.css" rel="stylesheet">
   
   <!-- Adicionar -->
   <link href="css/main.css" rel="stylesheet">
   ```

2. **Atualize as classes**:
   ```html
   <!-- Antigo -->
   <button class="botao-inicio">Clique</button>
   
   <!-- Novo -->
   <button class="btn btn-primary btn-base">Clique</button>
   ```

3. **Remova estilos inline**:
   ```html
   <!-- Antigo -->
   <div style="display: flex; align-items: center;">
   
   <!-- Novo -->
   <div class="flex items-center">
   ```

### Mapeamento de Classes

| Antigo | Novo |
|--------|------|
| `.botao-inicio` | `.btn .btn-primary` |
| `.titulo` | `.text-2xl .font-semibold .text-primary` |
| `.cifra-container` | `.cifra-grid` |
| `.cifra-content` | `.cifra-display-body` |
| `.acordes` | `.cifra-acordes` |
| `.letra` | `.cifra-letra` |

## 🐛 Troubleshooting

### Problemas Comuns

1. **Estilos não aplicados**: Verifique se `main.css` está importado
2. **Layout quebrado**: Certifique-se de usar `.app-container`
3. **Responsividade**: Use classes responsivas (`md:`, `lg:`)
4. **Cores inconsistentes**: Use variáveis CSS (`var(--color-primary-600)`)

### Debug

```css
/* Adicione temporariamente para debug */
* {
    outline: 1px solid red;
}
```

## 📋 Checklist de Implementação

- [ ] Importar `css/main.css` em todas as páginas
- [ ] Remover imports antigos (`estilo.css`, `estilo-novo.css`)
- [ ] Atualizar estrutura HTML com `.app-container`
- [ ] Migrar botões para `.btn .btn-*`
- [ ] Migrar cards para `.card`
- [ ] Atualizar grids de cifras para `.cifra-grid`
- [ ] Remover estilos inline
- [ ] Testar em diferentes dispositivos
- [ ] Validar acessibilidade
- [ ] Otimizar performance

## 🚀 Próximos Passos

1. **Dark Mode**: Implementar tema escuro
2. **Mais Componentes**: Adicionar tabs, accordion, etc.
3. **Animações**: Melhorar micro-interações
4. **A11y**: Aprimorar acessibilidade
5. **CSS-in-JS**: Considerar migração futura

---

Este sistema foi criado para ser **simples**, **consistente** e **escalável**. Para dúvidas ou sugestões, consulte a documentação ou entre em contato com o time de desenvolvimento. 