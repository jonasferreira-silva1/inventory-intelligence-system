# 📝 Criar arquivo .env

Se o arquivo `.env` não existe ou está com problemas, crie manualmente:

## Localização
`backend/.env`

## Conteúdo (copie e cole):

```env
DATABASE_URL="postgresql://postgres:jonas1385@localhost:5432/smartstock"
JWT_SECRET="sua-chave-secreta-super-segura-aqui-altere-em-producao-123456789"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## ⚠️ IMPORTANTE

- Use **aspas duplas** (`"`) ao redor dos valores que contêm caracteres especiais
- A senha `jonas1385` está na URL de conexão
- Não deixe espaços antes ou depois do `=`

## Como criar no Windows:

1. Abra o Bloco de Notas
2. Cole o conteúdo acima
3. Salve como `.env` (com o ponto no início)
4. Coloque na pasta `backend`

Ou use PowerShell:
```powershell
@"
DATABASE_URL="postgresql://postgres:jonas1385@localhost:5432/smartstock"
JWT_SECRET="sua-chave-secreta-super-segura-aqui-altere-em-producao-123456789"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
"@ | Out-File -FilePath "backend\.env" -Encoding utf8
```

