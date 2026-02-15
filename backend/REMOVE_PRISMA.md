# ⚠️ Pasta Prisma Não é Mais Necessária

Esta pasta `prisma` pode ser **removida** do projeto.

## Por quê?

O projeto foi migrado de **Prisma ORM** para **PostgreSQL direto** usando `pg-promise`.

## Como remover?

### Windows (PowerShell):
```powershell
Remove-Item -Path "prisma" -Recurse -Force
```

### Windows (CMD):
```cmd
rmdir /s /q prisma
```

### Linux/Mac:
```bash
rm -rf prisma
```

## O que foi substituído?

- **Antes:** Prisma ORM (`@prisma/client`)
- **Agora:** PostgreSQL direto (`pg-promise`)
- **Schema:** Agora está em `src/database/schema.sql`
- **Migrações:** Execute `npm run db:migrate` ou o SQL diretamente

## Arquivos importantes (NÃO remover):

✅ `src/database/schema.sql` - Schema do banco  
✅ `src/database/connection.ts` - Conexão PostgreSQL  
✅ `src/database/migrate.ts` - Script de migração  

---

**A pasta `prisma` pode ser deletada com segurança!** 🗑️

