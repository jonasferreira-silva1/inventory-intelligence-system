# 🚀 Início Rápido - SmartStock

## ✅ Configuração Automática

O projeto já está configurado com suas credenciais!

## 📋 Passo 1: Executar Setup Automático

O script vai criar o banco automaticamente se não existir:

```bash
cd backend
npm run db:setup
```

Isso vai:
- ✅ Verificar se o banco `smartstock` existe
- ✅ Criar o banco automaticamente se não existir
- ✅ Executar o schema SQL (criar tabelas)
- ✅ Configurar tudo automaticamente

## 📋 Passo 2: Iniciar o Servidor

```bash
# Na raiz do projeto
npm run dev
```

## 🎉 Pronto!

Agora você pode acessar:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3001

---

## 🔧 Credenciais Configuradas

- **Usuário:** postgres
- **Senha:** jonas1385
- **Banco:** smartstock
- **Host:** localhost
- **Porta:** 5432

Se precisar alterar, edite o arquivo `backend/.env`

---

## 🐛 Problemas?

### Erro: "password authentication failed"
→ Verifique se a senha no `.env` está correta

### Erro: "connection refused"
→ Verifique se o PostgreSQL está rodando:
```bash
# Windows (serviço)
net start postgresql-x64-14

# Ou verifique no Gerenciador de Serviços
```

### Erro: "permission denied"
→ O usuário precisa ter permissão para criar bancos:
```sql
ALTER USER postgres CREATEDB;
```

