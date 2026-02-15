# 🚀 Configuração Rápida - SmartStock

## ⚠️ Erro: DATABASE_URL não configurada

Se você está vendo este erro, siga os passos abaixo:

## 📋 Passo 1: Criar arquivo .env

Crie um arquivo `.env` na pasta `backend` com o seguinte conteúdo:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smartstock"
JWT_SECRET="sua-chave-secreta-super-segura-aqui-altere-em-producao"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### 🔧 Ajustar DATABASE_URL

Substitua os valores conforme sua configuração do PostgreSQL:

- `postgres` (primeiro) = usuário do PostgreSQL
- `postgres` (segundo) = senha do PostgreSQL  
- `localhost` = host do banco
- `5432` = porta do PostgreSQL
- `smartstock` = nome do banco de dados

**Exemplo:**
```env
DATABASE_URL="postgresql://meuusuario:minhasenha@localhost:5432/smartstock"
```

## 📋 Passo 2: Criar o banco de dados

Execute no PostgreSQL:

```sql
CREATE DATABASE smartstock;
```

Ou via linha de comando:

```bash
psql -U postgres -c "CREATE DATABASE smartstock;"
```

## 📋 Passo 3: Executar migrações

```bash
cd backend
npm run db:migrate
```

Ou execute o SQL manualmente:

```bash
psql -U postgres -d smartstock -f src/database/schema.sql
```

## 📋 Passo 4: Iniciar o servidor

```bash
npm run dev
```

## ✅ Pronto!

Agora o servidor deve iniciar sem erros.

---

## 🐛 Problemas Comuns

### Erro: "database does not exist"
→ Crie o banco: `CREATE DATABASE smartstock;`

### Erro: "password authentication failed"
→ Verifique usuário e senha no `.env`

### Erro: "connection refused"
→ Verifique se o PostgreSQL está rodando

