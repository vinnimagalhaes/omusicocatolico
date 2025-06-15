# 🚀 Deploy Rápido - OMúsicoCatólico

## ⚡ Deploy em 5 Minutos

### 1. Preparar Servidor
```bash
# Conectar ao servidor
ssh root@SEU_SERVIDOR

# Instalar dependências básicas
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### 2. Clonar e Configurar
```bash
# Clonar projeto
cd /var/www
sudo git clone SEU_REPOSITORIO omusicacatolico
sudo chown -R $USER:$USER /var/www/omusicacatolico
cd omusicacatolico

# Instalar dependências
npm install

# Configurar ambiente
cp env.example .env
nano .env  # Editar configurações
```

### 3. Configurar .env para Produção
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=SUA_CHAVE_SUPER_SECRETA_128_CARACTERES_AQUI
FRONTEND_URL=https://omusicocatolico.com.br
API_URL=https://omusicocatolico.com.br/api
```

### 4. Deploy Automático
```bash
# Executar script de deploy
./deploy.sh
```

### 5. Configurar Nginx
```bash
# Copiar configuração
sudo cp nginx.conf /etc/nginx/sites-available/omusicacatolico

# Editar domínio (já configurado para omusicocatolico.com.br)
sudo nano /etc/nginx/sites-available/omusicacatolico
# Verificar se o domínio está correto

# Ativar site
sudo ln -s /etc/nginx/sites-available/omusicacatolico /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. SSL com Let's Encrypt
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d omusicocatolico.com.br -d www.omusicocatolico.com.br

# Configurar renovação automática
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### 7. Configurar Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## ✅ Verificar Deploy

```bash
# Status da aplicação
pm2 status

# Testar API
curl https://omusicocatolico.com.br/api/cifras

# Ver logs
pm2 logs omusicacatolico
```

## 🔧 Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart omusicacatolico

# Ver logs em tempo real
pm2 logs omusicacatolico --lines 50

# Status do Nginx
sudo systemctl status nginx

# Recarregar Nginx
sudo systemctl reload nginx

# Backup manual
sudo /usr/local/bin/backup-omusicacatolico.sh
```

## 🆘 Troubleshooting

### Aplicação não inicia
```bash
pm2 logs omusicacatolico
# Verificar erros nos logs
```

### Erro 502 Bad Gateway
```bash
pm2 status  # Verificar se app está rodando
sudo systemctl status nginx  # Verificar Nginx
```

### Problemas de SSL
```bash
sudo certbot certificates  # Ver certificados
sudo certbot renew --dry-run  # Testar renovação
```

### Problemas de permissão
```bash
sudo chown -R www-data:www-data /var/www/omusicacatolico/frontend/uploads
sudo chmod -R 755 /var/www/omusicacatolico/frontend/uploads
```

## 📊 Monitoramento

### Configurar alertas básicos
```bash
# Criar script de monitoramento
sudo nano /usr/local/bin/monitor-omusicacatolico.sh
```

```bash
#!/bin/bash
if ! curl -f http://localhost:3000/api/cifras > /dev/null 2>&1; then
    echo "OMúsicoCatólico está fora do ar!" | mail -s "ALERTA: Site fora do ar" seu@email.com
    pm2 restart omusicacatolico
fi
```

```bash
sudo chmod +x /usr/local/bin/monitor-omusicacatolico.sh

# Executar a cada 5 minutos
echo "*/5 * * * * /usr/local/bin/monitor-omusicacatolico.sh" | sudo crontab -
```

## 🎯 Checklist Final

- [ ] Servidor configurado
- [ ] Código clonado e dependências instaladas
- [ ] Arquivo .env configurado
- [ ] PM2 rodando a aplicação
- [ ] Nginx configurado com seu domínio
- [ ] SSL configurado
- [ ] Firewall ativo
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] DNS apontando para o servidor
- [ ] Site acessível via HTTPS

## 🎉 Pronto!

Seu site está no ar em: **https://omusicocatolico.com.br**

### URLs importantes:
- **Site**: https://omusicocatolico.com.br
- **API**: https://omusicocatolico.com.br/api
- **Painel Master**: https://omusicocatolico.com.br/master-dashboard.html

### Credenciais padrão:
- **Email**: master@omusicacatolico.com
- **Senha**: master123

**⚠️ IMPORTANTE**: Altere a senha padrão após o primeiro login! 