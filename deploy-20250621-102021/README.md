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

