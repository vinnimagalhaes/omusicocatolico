#!/bin/bash

# 🚀 Deploy Script Enterprise - OMúsicoCatólico
# Autor: Assistant AI
# Data: $(date)

set -e

echo "🚀 Iniciando Deploy Enterprise do OMúsicoCatólico..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    error "package.json não encontrado. Execute este script no diretório raiz do projeto."
fi

log "Verificando estrutura do projeto..."

# Verificar se os diretórios existem
if [ ! -d "apps/api" ]; then
    error "Diretório apps/api não encontrado"
fi

if [ ! -d "apps/web" ]; then
    error "Diretório apps/web não encontrado"
fi

success "Estrutura do projeto verificada"

# Criar diretório de deploy
DEPLOY_DIR="./deploy-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$DEPLOY_DIR"

log "Criando estrutura de deploy em $DEPLOY_DIR..."

# Copiar arquivos do backend
mkdir -p "$DEPLOY_DIR/backend"
cp -r apps/api/* "$DEPLOY_DIR/backend/" 2>/dev/null || true
cp -r backend/* "$DEPLOY_DIR/backend/" 2>/dev/null || true

# Copiar arquivos principais
cp package.json "$DEPLOY_DIR/"
cp .env* "$DEPLOY_DIR/" 2>/dev/null || true
cp ecosystem.config.js "$DEPLOY_DIR/" 2>/dev/null || true

# Copiar frontend (HTML original como fallback)
mkdir -p "$DEPLOY_DIR/public"
if [ -d "frontend" ]; then
    cp -r frontend/* "$DEPLOY_DIR/public/"
    success "Frontend HTML copiado"
fi

# Criar estrutura para React (se React estiver funcionando)
if [ -d "apps/web/src" ]; then
    mkdir -p "$DEPLOY_DIR/react-app"
    cp -r apps/web/* "$DEPLOY_DIR/react-app/"
    warning "React app copiado (requer build manual)"
fi

# Criar package.json simplificado para produção
cat > "$DEPLOY_DIR/package.json" << 'EOF'
{
  "name": "omusicocatolico-production",
  "version": "1.0.0",
  "description": "OMúsicoCatólico - Sistema de Cifras Católicas",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "start:pm2": "pm2 start ecosystem.config.js",
    "install:production": "npm ci --only=production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-slow-down": "^2.0.1",
    "compression": "^1.7.4",
    "sequelize": "^6.35.1",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.3.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

# Criar arquivo de configuração do PM2
cat > "$DEPLOY_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'omusicocatolico-api',
      script: 'backend/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: 'logs/err.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      max_memory_restart: '1G',
      restart_delay: 1000,
      watch: false
    }
  ]
};
EOF

# Criar diretório de logs
mkdir -p "$DEPLOY_DIR/logs"

# Criar arquivo .env de produção
cat > "$DEPLOY_DIR/.env" << 'EOF'
NODE_ENV=production
PORT=3000

# Database
DB_TYPE=sqlite
DB_PATH=./storage/database.sqlite

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui_change_this
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d

# Upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Logs
LOG_LEVEL=info
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://seu-dominio.com
EOF

# Criar script de inicialização
cat > "$DEPLOY_DIR/start.sh" << 'EOF'
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
EOF

chmod +x "$DEPLOY_DIR/start.sh"

# Criar Nginx config
cat > "$DEPLOY_DIR/nginx.conf" << 'EOF'
server {
    listen 80;
    server_name seu-dominio.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    # SSL certificates (configure com Let's Encrypt)
    # ssl_certificate /path/to/cert.pem;
    # ssl_certificate_key /path/to/key.pem;
    
    # Static files
    location / {
        root /path/to/omusicocatolico/public;
        try_files $uri $uri/ @api;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API routes
    location @api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # API routes explicit
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
EOF

# Criar README de deploy
cat > "$DEPLOY_DIR/README.md" << 'EOF'
# 🚀 Deploy OMúsicoCatólico

## Estrutura do Deploy

```
deploy-YYYYMMDD-HHMMSS/
├── backend/                 # Código do servidor Node.js
├── public/                  # Frontend estático
├── react-app/              # App React (requer build)
├── logs/                   # Logs da aplicação
├── package.json            # Dependências de produção
├── ecosystem.config.js     # Configuração PM2
├── .env                    # Variáveis de ambiente
├── start.sh               # Script de inicialização
├── nginx.conf             # Configuração Nginx
└── README.md              # Este arquivo
```

## Instalação

1. **Upload para servidor:**
   ```bash
   scp -r deploy-* user@servidor:/path/to/app/
   ```

2. **No servidor:**
   ```bash
   cd /path/to/app/deploy-*
   chmod +x start.sh
   ./start.sh
   ```

3. **Configurar Nginx:**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/omusicocatolico
   sudo ln -s /etc/nginx/sites-available/omusicocatolico /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

## Comandos Úteis

- **Parar aplicação:** `pm2 stop omusicocatolico-api`
- **Reiniciar:** `pm2 restart omusicocatolico-api`
- **Ver logs:** `pm2 logs omusicocatolico-api`
- **Monitorar:** `pm2 monit`
- **Status:** `pm2 status`

## Configurações Importantes

1. **Altere o JWT_SECRET** no arquivo `.env`
2. **Configure os domínios** em ALLOWED_ORIGINS
3. **Configure SSL** no Nginx
4. **Backup regular** do banco SQLite em `storage/`

## URLs de Acesso

- **Frontend:** https://seu-dominio.com
- **API:** https://seu-dominio.com/api/
- **Health Check:** https://seu-dominio.com/api/health

## Estrutura de Pastas no Servidor

```
/var/www/omusicocatolico/
├── current/               # Deploy atual
├── releases/             # Deploys anteriores
├── shared/              # Arquivos compartilhados
│   ├── storage/        # Banco de dados
│   ├── uploads/        # Arquivos enviados
│   └── logs/          # Logs persistentes
```

## Backup

```bash
# Backup do banco
cp storage/database.sqlite backups/db-$(date +%Y%m%d).sqlite

# Backup dos uploads
tar -czf backups/uploads-$(date +%Y%m%d).tar.gz uploads/
```

EOF

success "Deploy package criado em: $DEPLOY_DIR"

# Mostrar resumo
echo ""
log "📦 RESUMO DO DEPLOY"
echo "├── 📁 Diretório: $DEPLOY_DIR"
echo "├── 🖥️  Backend: Node.js + Express + SQLite"
echo "├── 🌐 Frontend: HTML + CSS + JavaScript"
echo "├── ⚙️  Servidor: PM2 + Nginx"
echo "├── 🛡️  Segurança: Helmet + Rate Limiting + CORS"
echo "├── 📊 Logs: Winston + Daily Rotate"
echo "└── 🗄️  Database: SQLite com Sequelize"

echo ""
warning "⚠️  AÇÕES NECESSÁRIAS:"
echo "1. 🔐 Altere JWT_SECRET no arquivo .env"
echo "2. 🌐 Configure ALLOWED_ORIGINS com seus domínios"
echo "3. 📋 Instale dependências: npm run install:production"
echo "4. 🚀 Execute: ./start.sh"
echo "5. 🔧 Configure Nginx conforme nginx.conf"

echo ""
success "🎉 Deploy package pronto para produção!"
log "Para testar localmente: cd $DEPLOY_DIR && ./start.sh"

# Criar tarball para upload
log "Criando arquivo para upload..."
tar -czf "omusicocatolico-deploy-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$DEPLOY_DIR" .
success "Arquivo de deploy criado: omusicocatolico-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo ""
echo "🚀 DEPLOY ENTERPRISE COMPLETO! 🚀" 