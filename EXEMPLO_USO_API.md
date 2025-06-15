# 🎵 OMúsicoCatólico - Guia de Uso da API

## ✅ **Banco de Dados Implementado!**

Agora sua plataforma tem um **banco de dados SQLite real** que permite:

- ✅ **Usuários persistentes** (cadastro, login, perfis)
- ✅ **Cifras salvas no banco** (não se perdem ao reiniciar)
- ✅ **Sistema de favoritos funcional**
- ✅ **Repertórios personalizados**
- ✅ **Relacionamentos entre dados**

## 🚀 **Como Usar**

### 1. **Inicializar o Banco**
```bash
npm run init-db  # Cria tabelas e dados iniciais
```

### 2. **Iniciar o Servidor**
```bash
npm run dev      # Modo desenvolvimento
npm start        # Modo produção
```

### 3. **Acessar a Plataforma**
- **Interface**: http://localhost:3000
- **API**: http://localhost:3000/api/cifras

## 📋 **Endpoints da API**

### **Cifras**
```bash
# Listar cifras
GET /api/cifras
GET /api/cifras?categoria=entrada
GET /api/cifras?search=ave%20maria

# Obter cifra específica
GET /api/cifras/1

# Criar cifra (requer autenticação)
POST /api/cifras/manual
{
  "titulo": "Ave Maria",
  "artista": "Tradicional",
  "tom": "C",
  "categoria": "maria",
  "letra": "[C]Ave Ma[Am]ria..."
}

# Atualizar cifra
PUT /api/cifras/1

# Deletar cifra
DELETE /api/cifras/1
```

### **Usuários**
```bash
# Registrar usuário
POST /api/auth/register
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456"
}

# Login
POST /api/auth/login
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

### **Favoritos**
```bash
# Listar favoritos do usuário
GET /api/favoritos

# Adicionar/remover favorito
POST /api/favoritos/1

# Verificar se é favorito
GET /api/favoritos/check/1
```

## 🎯 **Funcionalidades Implementadas**

### **1. Sistema de Usuários**
- Cadastro e login
- Senhas criptografadas (bcrypt)
- Tokens JWT para autenticação
- Perfis de usuário

### **2. Cifras Persistentes**
- Salvas no banco SQLite
- Busca por título, artista, categoria
- Contagem de visualizações
- Tags e metadados

### **3. Sistema de Favoritos**
- Cada usuário pode favoritar cifras
- Lista personalizada de favoritos
- Verificação de status de favorito

### **4. Relacionamentos**
- Usuário → Cifras (1:N)
- Usuário → Favoritos (1:N)
- Cifra → Favoritos (1:N)
- Usuário ↔ Cifra (N:N através de Favoritos)

## 🗄️ **Estrutura do Banco**

### **Tabelas Criadas:**
- `users` - Usuários da plataforma
- `cifras` - Cifras católicas
- `favoritos` - Relacionamento usuário-cifra
- `repertorios` - Listas de cifras dos usuários
- `repertorio_cifras` - Cifras dentro dos repertórios

### **Dados Iniciais:**
- Usuário admin: `admin@omusicacatolico.com` / `admin123`
- 3 cifras de exemplo já inseridas

## 🔄 **Migração para Produção**

O código já está preparado para produção:

### **Desenvolvimento (SQLite)**
```javascript
// Automático - arquivo local database.sqlite
```

### **Produção (PostgreSQL)**
```bash
# Definir variáveis de ambiente:
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
# ou
DB_HOST=localhost
DB_NAME=omusicacatolico
DB_USER=postgres
DB_PASS=senha
DB_PORT=5432
```

## 🧪 **Testando a API**

### **1. Listar Cifras**
```bash
curl http://localhost:3000/api/cifras
```

### **2. Buscar Cifras**
```bash
curl "http://localhost:3000/api/cifras?search=ave"
```

### **3. Registrar Usuário**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste","email":"teste@email.com","senha":"123456"}'
```

### **4. Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@email.com","senha":"123456"}'
```

### **5. Favoritar Cifra (com token)**
```bash
curl -X POST http://localhost:3000/api/favoritos/1 \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

## 🎉 **Próximos Passos**

Agora que o banco está funcionando, você pode:

1. **Melhorar a Interface**: Conectar o frontend com as novas APIs
2. **Adicionar Repertórios**: Implementar sistema de listas de músicas
3. **Upload de Imagens**: Avatar de usuários, capas de cifras
4. **Sistema de Comentários**: Usuários comentarem nas cifras
5. **Deploy**: Subir para Heroku, Vercel, ou outro serviço

## 🔧 **Comandos Úteis**

```bash
# Recriar banco do zero
npm run init-db

# Ver logs do servidor
npm run dev

# Parar servidor
Ctrl + C

# Verificar se porta está ocupada
lsof -i :3000
```

**🎵 Sua plataforma agora tem persistência real de dados!** 🎉 