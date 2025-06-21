# 🚀 Instruções de Deploy - OMúsicoCatólico

## ✅ Correções Implementadas

- **Service Worker**: Corrigido modo emergência que causava erro 404
- **Autenticação**: Adicionada dependência `google-auth-library` faltante
- **MySQL**: Configurado para usar MySQL em produção
- **Dependências**: Todas as dependências necessárias incluídas

## 📦 Deploy para Produção

### 1. Upload dos Arquivos
Faça upload deste diretório completo para seu servidor:
```bash
scp -r deploy-20250621-102021/* usuario@seu-servidor:/caminho/do/projeto/
```

### 2. Configuração do Banco MySQL
Certifique-se que o MySQL está rodando e execute:
```sql
CREATE DATABASE omusicocatolico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'omusicocatolico'@'localhost' IDENTIFIED BY 'OMusicoCatolico2025p*';
GRANT ALL PRIVILEGES ON omusicocatolico.* TO 'omusicocatolico'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configuração do Ambiente
Renomeie o arquivo de configuração MySQL:
```bash
mv .env.mysql .env
```

### 4. Instalação e Inicialização
```bash
# Instalar dependências
npm install

# Iniciar servidor (escolha uma opção)
# Opção 1: Direto com Node.js
npm start

# Opção 2: Com PM2 (recomendado para produção)
npm install -g pm2
npm run start:pm2

# Opção 3: Usar o script de inicialização
./start.sh
```

### 5. Verificação
- Servidor rodando: `http://seu-servidor:3000`
- API funcionando: `http://seu-servidor:3000/api/cifras`
- Service Worker: Não mais em modo emergência

### 6. Nginx (Opcional)
Configure o nginx.conf incluído para servir o site na porta 80/443.

## 🔧 Configurações Importantes

### MySQL
- Host: localhost
- Database: omusicocatolico  
- User: omusicocatolico
- Password: OMusicoCatolico2025p* (altere conforme necessário)

### Segurança
- JWT_SECRET: Configure um segredo único
- CORS: Configurado para omusicocatolico.com.br
- Rate Limiting: 100 requests/15min por IP

### Logs
- Diretório: `./logs/`
- Formato: JSON com timestamp
- Rotação: Diária

## 🆘 Solução de Problemas

### Erro de Conexão MySQL
```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Reiniciar se necessário
sudo systemctl restart mysql
```

### Dependências em Falta
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Service Worker Cache
Se ainda houver problemas de cache:
1. Abra DevTools (F12)
2. Application > Storage > Clear Storage
3. Recarregue a página

## 📊 Monitoramento

### Com PM2
```bash
pm2 status                    # Status dos processos
pm2 logs omusicocatolico-api  # Ver logs
pm2 monit                     # Monitor em tempo real
pm2 restart omusicocatolico-api # Reiniciar
```

### Logs Manuais
```bash
tail -f logs/combined.log     # Todos os logs
tail -f logs/err.log          # Apenas erros
```

## 🎉 Deploy Completo!

O site está agora corrigido e pronto para produção com:
- ✅ Service Worker funcionando corretamente
- ✅ Autenticação Google funcionando
- ✅ MySQL como banco de dados
- ✅ Todas as dependências incluídas
- ✅ Scripts de monitoramento
- ✅ Configuração de segurança 