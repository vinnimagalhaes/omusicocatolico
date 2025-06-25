# 🎵 OMúsicoCatólico

Uma plataforma completa para cifras de música católica, desenvolvida para facilitar o acesso e organização de repertórios musicais para comunidades católicas.

## 🚀 Funcionalidades

### Para Usuários
- 📖 **Visualização de Cifras**: Interface limpa e responsiva para leitura
- ⭐ **Sistema de Favoritos**: Salve suas cifras preferidas
- 📚 **Repertórios**: Crie e organize repertórios personalizados
- 🔍 **Busca Avançada**: Encontre cifras por título, artista ou categoria
- 👤 **Perfil Personalizado**: Gerencie suas informações e preferências

### Para Administradores (Master)
- 🎛️ **Painel Administrativo**: Dashboard completo para gestão
- 👥 **Gestão de Usuários**: Controle total sobre usuários da plataforma
- 🎼 **Administração de Cifras**: Adicionar, editar e moderar cifras
- 📊 **Analytics**: Estatísticas de uso e engajamento
- 🖼️ **Gestão de Conteúdo**: Upload de imagens, banners e carrosséis
- 📄 **Páginas Estáticas**: Criação e edição de páginas do site

## 🛠️ Tecnologias

### Backend
- **Node.js** + **Express.js**
- **SQLite** com **Sequelize ORM**
- **JWT** para autenticação
- **Multer** para upload de arquivos
- **bcrypt** para criptografia de senhas

### Frontend
- **HTML5** + **CSS3** + **JavaScript Vanilla**
- **Tailwind CSS** para estilização
- **Responsive Design**
- **PWA Ready**

### Deploy
- **PM2** para gerenciamento de processos
- **Nginx** como proxy reverso
- **Let's Encrypt** para SSL
- **Backup automático**

## 🏃‍♂️ Início Rápido

### Desenvolvimento Local

1. **Clone o repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd catcifras
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o ambiente**
```bash
# O arquivo .env será criado automaticamente na primeira execução
# Ou copie manualmente:
cp env.example .env
```

4. **Inicie o servidor**
```bash
# Opção 1: Script automatizado
./start.sh

# Opção 2: Manual
npm start

# Opção 3: Desenvolvimento com nodemon
npm run dev
```

5. **Acesse a aplicação**
- Site: http://localhost:8000
- API: http://localhost:8000/api
- Painel Master: http://localhost:8000/master-dashboard.html

### Credenciais Padrão
- **Email**: master@omusicacatolico.com
- **Senha**: master123

## 🚀 Deploy em Produção

### Pré-requisitos
- Servidor VPS/Cloud (Ubuntu 20.04+ recomendado)
- Domínio configurado
- Node.js 18+
- PM2, Nginx, Certbot

### Deploy Automático
```bash
# 1. Clone o projeto no servidor
git clone [URL_DO_REPOSITORIO] /var/www/omusicacatolico
cd /var/www/omusicacatolico

# 2. Configure as variáveis de ambiente
cp env.example .env
nano .env  # Configure para produção

# 3. Execute o deploy
./deploy.sh
```

### Deploy Manual
Siga o guia completo em [DEPLOY.md](DEPLOY.md)

## 🚀 Deploy Automático Configurado

✅ GitHub Actions configurado para deploy automático na branch main

---

*Última atualização: Deploy automático configurado com sucesso!*

## 📁 Estrutura do Projeto

```
catcifras/
├── backend/                 # Servidor Node.js
│   ├── config/             # Configurações
│   ├── database/           # Configuração do banco
│   ├── middleware/         # Middlewares customizados
│   ├── models/             # Modelos do Sequelize
│   ├── routes/             # Rotas da API
│   ├── services/           # Serviços e lógica de negócio
│   └── server.js           # Arquivo principal do servidor
├── frontend/               # Interface do usuário
│   ├── css/               # Estilos CSS
│   ├── js/                # JavaScript do frontend
│   ├── uploads/           # Arquivos enviados pelos usuários
│   └── *.html             # Páginas HTML
├── logs/                  # Logs da aplicação
├── deploy.sh              # Script de deploy
├── start.sh               # Script de desenvolvimento
├── ecosystem.config.js    # Configuração do PM2
├── nginx.conf             # Configuração do Nginx
└── README.md              # Este arquivo
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```env
# Ambiente
NODE_ENV=production

# Servidor
PORT=3000

# Segurança
JWT_SECRET=sua_chave_super_secreta_128_caracteres

# URLs
FRONTEND_URL=https://seudominio.com
API_URL=https://seudominio.com/api

# Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./frontend/uploads

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_de_app
```

## 📊 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

### Cifras
- `GET /api/cifras` - Listar cifras
- `GET /api/cifras/:id` - Obter cifra específica
- `POST /api/cifras` - Criar cifra (requer auth)
- `PUT /api/cifras/:id` - Atualizar cifra (requer auth)
- `DELETE /api/cifras/:id` - Deletar cifra (requer auth)

### Favoritos
- `GET /api/favoritos` - Listar favoritos do usuário
- `POST /api/favoritos` - Adicionar aos favoritos
- `DELETE /api/favoritos/:id` - Remover dos favoritos

### Repertórios
- `GET /api/repertorios` - Listar repertórios
- `POST /api/repertorios` - Criar repertório
- `PUT /api/repertorios/:id` - Atualizar repertório
- `DELETE /api/repertorios/:id` - Deletar repertório

### Master (Admin)
- `GET /api/master/users` - Listar usuários
- `GET /api/master/cifras` - Listar todas as cifras
- `GET /api/master/content` - Gestão de conteúdo
- `POST /api/master/content` - Criar conteúdo
- `PUT /api/master/content/:id` - Atualizar conteúdo

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes de integração
npm run test:integration
```

## 📝 Scripts Disponíveis

```bash
npm start          # Iniciar servidor
npm run dev        # Desenvolvimento com nodemon
npm test           # Executar testes
npm run build      # Build para produção
npm run lint       # Verificar código
npm run format     # Formatar código
```

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Criptografia de senhas com bcrypt
- ✅ Rate limiting nas APIs
- ✅ Headers de segurança
- ✅ Validação de entrada
- ✅ Upload seguro de arquivos
- ✅ HTTPS obrigatório em produção

## 📈 Monitoramento

### Logs
```bash
# Logs da aplicação
pm2 logs omusicacatolico

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
```

### Status
```bash
# Status da aplicação
pm2 status

# Métricas
pm2 monit
```

## 🔄 Backup

O sistema inclui backup automático:
- **Banco de dados**: Backup diário às 2h
- **Uploads**: Backup semanal
- **Retenção**: 7 dias

```bash
# Backup manual
sudo /usr/local/bin/backup-omusicacatolico.sh

# Restaurar backup
cp /var/backups/omusicacatolico/database_YYYYMMDD.sqlite ./backend/database.sqlite
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- 📧 Email: suporte@omusicacatolico.com
- 📱 WhatsApp: (XX) XXXXX-XXXX
- 🐛 Issues: [GitHub Issues](link-para-issues)

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] App mobile (React Native)
- [ ] Sistema de comentários
- [ ] Integração com YouTube
- [ ] Modo offline (PWA)
- [ ] Sistema de notificações
- [ ] API pública
- [ ] Integração com redes sociais
- [ ] Sistema de doações

### Melhorias Técnicas
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Docker containers
- [ ] Kubernetes deployment
- [ ] CDN para assets
- [ ] Cache Redis
- [ ] Elasticsearch para busca

---

**Desenvolvido com ❤️ para a comunidade católica**

🎵 *"Cantai ao Senhor um cântico novo, porque ele fez maravilhas"* - Salmo 98:1 ## Deploy test Tue Jun 17 12:27:41 -03 2025
## Deploy test com secrets corrigidos - Tue Jun 17 12:29:51 -03 2025
## Forçando novo deploy - 12:31:20
# Teste GitHub Actions Tue Jun 17 12:36:10 -03 2025
trigger deploy
