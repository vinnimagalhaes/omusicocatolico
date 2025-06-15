# OCR com Preservação de Layout Espacial - OMúsicoCatólico

## 🎯 Problema Resolvido

**Antes**: O OCR extraía todo o texto "corrido", perdendo a estrutura espacial onde os acordes ficam posicionados acima das letras da música.

**Agora**: O sistema preserva a estrutura original da cifra, mantendo os acordes alinhados sobre as palavras corretas.

## 🚀 Como Funciona

### 1. Detecção de Coordenadas
- O Tesseract.js extrai não apenas o texto, mas também as **coordenadas X,Y** de cada palavra
- Cada palavra tem sua posição exata na imagem original

### 2. Organização por Linhas
- Palavras são agrupadas por proximidade na coordenada Y (±10 pixels de tolerância)
- Dentro de cada linha, palavras são ordenadas da esquerda para direita (coordenada X)

### 3. Identificação de Acordes
Uma linha é considerada de acordes quando:
- **40% ou mais** das palavras são acordes válidos
- Máximo de **12 palavras** por linha
- **Não contém** palavras comuns de letras de música

### 4. Alinhamento Espacial
- Acordes são posicionados sobre as letras baseado na sobreposição horizontal
- Sistema calcula a intersecção entre posições dos acordes e das palavras
- Preserva o espaçamento original usando coordenadas

## 🔧 Implementação Técnica

### Backend (`backend/services/ocr.js`)

#### Principais Métodos:

```javascript
// Preservar layout espacial
preserveLayout(ocrData)

// Organizar palavras por linhas
organizeWordsByLines(words)

// Identificar linhas de acordes
isLikelyChordLine(lineWords)

// Alinhar acordes com letras
alignChordsWithLyrics(chordLine, lyricLine)
```

#### Fluxo de Processamento:
1. **Extração**: `processImageWithLayout()` → captura texto + coordenadas
2. **Organização**: `organizeWordsByLines()` → agrupa por proximidade Y
3. **Identificação**: `isLikelyChordLine()` → detecta linhas de acordes
4. **Alinhamento**: `alignChordsWithLyrics()` → posiciona acordes sobre letras

### Frontend (`frontend/js/app.js`)

#### Interface Melhorada:
- **3 colunas**: Texto estruturado | Texto original | Formulário
- **Comparação visual** entre texto corrido e estruturado
- **Dicas de edição** para ajustes manuais
- **Botão de cópia** do texto estruturado

## 📝 Como Usar

### 1. Preparar Imagem
- Use o arquivo `test-cifra.html` como exemplo
- Capturar screenshot de cifras com estrutura clara
- Certifique-se que acordes estão visivelmente acima das letras

### 2. Upload no Sistema
1. Fazer login no sistema
2. Clicar em "Nova Cifra" → "Upload de Arquivo"
3. Selecionar imagem da cifra
4. Aguardar processamento

### 3. Resultado
- **Coluna 1**: Cifra com estrutura preservada
- **Coluna 2**: Texto original corrido (para comparação)
- **Coluna 3**: Formulário editável para ajustes

### 4. Edição e Salvamento
- Revisar e ajustar dados (título, artista, tom)
- Editar cifra se necessário
- Salvar no sistema

## 🎨 Exemplo de Resultado

### Entrada (Imagem):
```
    C              F         C
Bless the Lord, my soul, and bless God's holy name.
    C                      G         C
Bless the Lord, my soul, He rescues me from death.
```

### Saída (Texto Estruturado):
```
C              F         C
Bless the Lord, my soul, and bless God's holy name.
C                      G         C
Bless the Lord, my soul, He rescues me from death.
```

### Texto Original (Corrido):
```
C F C Bless the Lord my soul and bless God's holy name C G C Bless the Lord my soul He rescues me from death
```

## 🔍 Critérios de Detecção

### Acordes Válidos:
- Padrão: `[A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?[0-9]?`
- Exemplos: `C`, `Dm`, `F#m`, `G7`, `Am7`, `Dsus4`

### Palavras de Letras Comuns:
- Pronomes: eu, tu, ele, ela, nós, vocês
- Artigos: o, a, os, as, um, uma
- Preposições: de, em, para, por, com
- Palavras religiosas: jesus, cristo, deus, senhor, maria

## 🚨 Limitações e Melhorias

### Limitações Atuais:
- Funciona melhor com cifras bem estruturadas
- Requer contraste adequado na imagem
- Tolerância fixa de posicionamento (±20 pixels)

### Melhorias Futuras:
- Tolerância adaptativa baseada no tamanho da fonte
- Detecção de colunas múltiplas
- Reconhecimento de símbolos musicais especiais
- Suporte a diferentes idiomas

## 🧪 Teste da Funcionalidade

1. Abra `test-cifra.html` no navegador
2. Capture screenshot da página
3. Use a imagem no sistema de upload
4. Compare os resultados entre texto estruturado e original

## 📊 Métricas de Qualidade

### Indicadores de Sucesso:
- **Precisão de acordes**: % de acordes detectados corretamente
- **Alinhamento**: % de acordes posicionados sobre palavras corretas
- **Preservação**: Manutenção da estrutura visual original

### Monitoramento:
- Log de confiança do OCR (confidence > 30)
- Contagem de acordes vs palavras por linha
- Feedback dos usuários sobre qualidade 