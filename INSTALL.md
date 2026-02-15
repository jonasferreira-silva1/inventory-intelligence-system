# 🚀 Guia de Instalação - SmartStock

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** ou **yarn**
- **Git**

## 🔧 Instalação Passo a Passo

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/smartstock.git
cd smartstock
```

### 2. Instale as Dependências

```bash
# Instala dependências da raiz, backend e frontend
npm run install:all
```

Ou manualmente:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Configure o Banco de Dados

#### 3.1. Crie o Banco de Dados PostgreSQL

```sql
CREATE DATABASE smartstock;
```

#### 3.2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@localhost:5432/smartstock"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura-aqui-altere-em-producao"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

**⚠️ IMPORTANTE:** Altere `usuario` e `senha` para suas credenciais do PostgreSQL.

### 4. Execute as Migrações do Banco

```bash
cd backend
npm run db:migrate
```

Ou execute o SQL diretamente no PostgreSQL:

```bash
psql -U usuario -d smartstock -f src/database/schema.sql
```

Isso criará todas as tabelas necessárias no banco de dados.

### 5. Inicie o Servidor

#### Opção 1: Iniciar Backend e Frontend Juntos

Na raiz do projeto:

```bash
npm run dev
```

#### Opção 2: Iniciar Separadamente

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Acesse a Aplicação

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 🎯 Primeiro Uso

1. Acesse http://localhost:5173
2. Clique em **"Cadastre-se"**
3. Crie sua conta
4. Faça login
5. Comece criando **Categorias** e depois **Produtos**

## 🛠️ Comandos Úteis

### Backend

```bash
cd backend

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Prisma Studio (Interface visual do banco)
npm run prisma:studio
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Preview da build
npm run preview
```

## 🐛 Solução de Problemas

### Erro de Conexão com Banco de Dados

1. Verifique se o PostgreSQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Teste a conexão:
```bash
psql -U usuario -d smartstock
```

### Erro de Porta em Uso

Se a porta 3001 ou 5173 estiver em uso:

- **Backend:** Altere `PORT` no arquivo `.env`
- **Frontend:** Altere `port` no arquivo `vite.config.ts`

### Erro de Migrações

Se houver problemas com migrações:

```bash
cd backend
npx prisma migrate reset  # ⚠️ CUIDADO: Apaga todos os dados
npx prisma migrate dev
```

## 📚 Próximos Passos

- Leia o [README.md](./README.md) para entender as funcionalidades
- Explore o código para entender a arquitetura
- Personalize conforme suas necessidades

## 💡 Dicas

- Use o **Prisma Studio** para visualizar e editar dados diretamente no banco
- Configure um **.env.example** para documentar as variáveis necessárias
- Use **Git** para versionar seu código

---

**Pronto!** Seu SmartStock está configurado e pronto para uso! 🎉

