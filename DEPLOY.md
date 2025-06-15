# 🚀 Guia de Deploy - OMúsicoCatólico

## Pré-requisitos

- Servidor VPS/Cloud (recomendado: DigitalOcean, AWS, Vultr)
- Node.js 18+ instalado
- PM2 para gerenciamento de processos
- Nginx como proxy reverso
- Domínio configurado

## 1. Configuração do Servidor

### Instalar dependências
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx
sudo apt install nginx -y

# Instalar Git
sudo apt install git -y
```

## 2. Deploy da Aplicação

### Clonar repositório
```bash
cd /var/www
sudo git clone [SEU_REPOSITORIO] omusicacatolico
sudo chown -R $USER:$USER /var/www/omusicacatolico
cd omusicacatolico
```

### Instalar dependências
```bash
npm install
```

### Configurar variáveis de ambiente
```bash
# Criar arquivo .env
cp .env.example .env
nano .env
```

### Configuração do .env para produção:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_super_secreta_aqui_128_caracteres_minimo
DB_PATH=./database.sqlite

# URLs
FRONTEND_URL=https://seudominio.com
API_URL=https://seudominio.com/api

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./frontend/uploads
```

## 3. Configuração do PM2

### Criar arquivo ecosystem
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'omusicacatolico',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

### Iniciar aplicação
```bash
# Criar diretório de logs
mkdir logs

# Iniciar com PM2
pm2 start ecosystem.config.js --env production

# Salvar configuração
pm2 save

# Configurar auto-start
pm2 startup
```

## 4. Configuração do Nginx

### Criar configuração do site
```bash
sudo nano /etc/nginx/sites-available/omusicacatolico
```

```nginx
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration (será configurado com Certbot)
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Static files
    location /uploads/ {
        alias /var/www/omusicacatolico/frontend/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /css/ {
        alias /var/www/omusicacatolico/frontend/css/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /js/ {
        alias /var/www/omusicacatolico/frontend/js/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
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

    # Frontend routes
    location / {
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

    # Security
    location ~ /\.ht {
        deny all;
    }

    location ~ /\.git {
        deny all;
    }
}
```

### Ativar site
```bash
sudo ln -s /etc/nginx/sites-available/omusicacatolico /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 6. Configurações de Segurança

### Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### Backup automático
```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-omusicacatolico.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/omusicacatolico"
APP_DIR="/var/www/omusicacatolico"

mkdir -p $BACKUP_DIR

# Backup do banco de dados
cp $APP_DIR/backend/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $APP_DIR/frontend uploads/

# Manter apenas os últimos 7 backups
find $BACKUP_DIR -name "*.sqlite" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

```bash
sudo chmod +x /usr/local/bin/backup-omusicacatolico.sh

# Configurar cron para backup diário
sudo crontab -e
# Adicionar linha:
0 2 * * * /usr/local/bin/backup-omusicacatolico.sh
```

## 7. Monitoramento

### Logs
```bash
# Ver logs da aplicação
pm2 logs omusicacatolico

# Ver logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Status
```bash
# Status da aplicação
pm2 status

# Status do Nginx
sudo systemctl status nginx

# Uso de recursos
htop
```

## 8. Atualizações

```bash
# Atualizar código
cd /var/www/omusicacatolico
git pull origin main

# Instalar novas dependências
npm install

# Reiniciar aplicação
pm2 restart omusicacatolico
```

## 9. Troubleshooting

### Problemas comuns:

1. **Aplicação não inicia**
   ```bash
   pm2 logs omusicacatolico
   ```

2. **Erro 502 Bad Gateway**
   ```bash
   sudo systemctl status nginx
   pm2 status
   ```

3. **Problemas de permissão**
   ```bash
   sudo chown -R www-data:www-data /var/www/omusicacatolico/frontend/uploads
   ```

4. **Banco de dados corrompido**
   ```bash
   # Restaurar backup
   cp /var/backups/omusicacatolico/database_YYYYMMDD_HHMMSS.sqlite /var/www/omusicacatolico/backend/database.sqlite
   pm2 restart omusicacatolico
   ```

## 10. Checklist de Deploy

- [ ] Servidor configurado
- [ ] Dependências instaladas
- [ ] Código clonado
- [ ] Variáveis de ambiente configuradas
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado
- [ ] SSL configurado
- [ ] Firewall configurado
- [ ] Backup configurado
- [ ] Domínio apontando para o servidor
- [ ] Testes realizados

## URLs importantes:
- Site: https://seudominio.com
- Painel Master: https://seudominio.com/master-dashboard.html
- API: https://seudominio.com/api 