# 🗄️ Guia Completo - Banco de Dados do OMúsicoCatólico

## 📋 **Resumo da Situação**

Seu projeto agora está configurado para funcionar com **dois tipos de banco de dados**:

- **🖥️ Desenvolvimento (seu computador)**: **SQLite** (mais simples)
- **🌐 Produção (Digital Ocean)**: **MySQL** (mais robusto)

## 🔄 **O que mudou**

### **Antes:**
- ❌ Tentando usar MySQL local (que não existia)
- ❌ Erro de conexão no desenvolvimento
- ❌ SQLite no servidor (não ideal para usuários reais)

### **Agora:**
- ✅ SQLite local para desenvolvimento (funciona perfeitamente)
- ✅ MySQL no servidor para produção (robusto para usuários reais)
- ✅ Configuração automática baseada no ambiente

## 🖥️ **Para Desenvolvimento (seu computador)**

### **Configuração atual:**
```env
DB_DIALECT=sqlite
DB_PATH=./backend/database.sqlite
NODE_ENV=development
```

### **Como testar:**
```bash
# Testar conexão
node -e "require('./backend/database/config.js')"

# Iniciar servidor
npm run dev

# Sincronizar banco (criar tabelas)
npm run sync:force
```

### **Vantagens do SQLite local:**
- ✅ Não precisa instalar nada
- ✅ Arquivo único (fácil de backup)
- ✅ Perfeito para desenvolvimento
- ✅ Não precisa de senha/usuário

## 🌐 **Para Produção (Digital Ocean)**

### **Configuração necessária:**
```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_USER=omusicocatolico
DB_PASS=SUA_SENHA_AQUI
DB_NAME=omusicocatolico
NODE_ENV=production
```

### **Como configurar no servidor:**

1. **Conectar ao servidor:**
```bash
ssh root@SEU_IP_DO_DIGITAL_OCEAN
```

2. **Executar script de configuração:**
```bash
cd /var/www/omusicacatolico
chmod +x scripts/setup-mysql-production.sh
./scripts/setup-mysql-production.sh
```

3. **Configurar variáveis de ambiente:**
```bash
cp env.production.example .env
nano .env
# Editar as configurações
```

4. **Sincronizar banco:**
```bash
npm run sync:force
```

5. **Reiniciar aplicação:**
```bash
pm2 restart omusicacatolico
```

## 📊 **Diferenças entre SQLite e MySQL**

| **Aspecto** | **SQLite** | **MySQL** |
|-------------|------------|-----------|
| **Tipo** | Arquivo | Servidor |
| **Instalação** | Já vem com Node.js | Precisa instalar |
| **Usuários simultâneos** | Limitado | Muitos |
| **Performance** | Bom para pequenos | Excelente |
| **Backup** | Copiar arquivo | Comando específico |
| **Segurança** | Básica | Avançada |
| **Uso recomendado** | Desenvolvimento | Produção |

## 🔧 **Comandos Úteis**

### **Desenvolvimento:**
```bash
# Testar conexão
node -e "require('./backend/database/config.js')"

# Ver banco SQLite
ls -la backend/database.sqlite

# Backup do banco
cp backend/database.sqlite backend/database.sqlite.backup
```

### **Produção:**
```bash
# Conectar ao MySQL
mysql -u omusicocatolico -p omusicocatolico

# Ver tabelas
SHOW TABLES;

# Backup do banco
mysqldump -u omusicocatolico -p omusicocatolico > backup.sql

# Restaurar backup
mysql -u omusicocatolico -p omusicocatolico < backup.sql
```

## 🚨 **Problemas Comuns**

### **Erro: "Connection refused"**
- **Causa**: MySQL não está rodando
- **Solução**: `sudo systemctl start mysql`

### **Erro: "Access denied"**
- **Causa**: Senha ou usuário incorreto
- **Solução**: Verificar arquivo `.env`

### **Erro: "Database doesn't exist"**
- **Causa**: Banco não foi criado
- **Solução**: Executar script de setup

## 📈 **Monitoramento**

### **Verificar status:**
```bash
# Desenvolvimento
ls -la backend/database.sqlite

# Produção
sudo systemctl status mysql
pm2 status
```

### **Ver logs:**
```bash
# Aplicação
pm2 logs omusicacatolico

# MySQL
sudo tail -f /var/log/mysql/error.log
```

## 🔐 **Segurança**

### **Desenvolvimento:**
- ✅ SQLite é seguro para desenvolvimento
- ✅ Arquivo local, sem acesso externo

### **Produção:**
- 🔒 Alterar senha padrão do MySQL
- 🔒 Configurar firewall
- 🔒 Usar HTTPS
- 🔒 Fazer backups regulares

## 📝 **Próximos Passos**

1. **✅ Desenvolvimento**: Já está funcionando com SQLite
2. **🌐 Produção**: Configurar MySQL no Digital Ocean
3. **📊 Monitoramento**: Configurar backups automáticos
4. **🔐 Segurança**: Alterar senhas padrão

## 🎯 **Resumo**

- **Seu computador**: Use SQLite (já configurado ✅)
- **Digital Ocean**: Configure MySQL (script pronto ✅)
- **Usuários reais**: Ficam no MySQL (mais seguro ✅)
- **Desenvolvimento**: Fica no SQLite (mais simples ✅)

Agora você tem o melhor dos dois mundos! 🎉 