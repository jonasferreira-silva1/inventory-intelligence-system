import pgPromise from 'pg-promise';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Carrega variáveis de ambiente
dotenv.config();

const pgp = pgPromise();
const dbName = process.env.DATABASE_NAME || 'smartstock';

// Conecta ao banco padrão 'postgres' para criar o banco se não existir
const getConnectionString = (database: string = 'postgres') => {
  let url = process.env.DATABASE_URL || '';
  
  // Remove aspas se existirem
  url = url.replace(/^["']|["']$/g, '').trim();
  
  if (!url) {
    throw new Error('DATABASE_URL não configurada no arquivo .env');
  }
  
  // Se DATABASE_URL está definida, substitui apenas o nome do banco
  // Formato: postgresql://user:pass@host:port/dbname
  const urlWithoutDb = url.replace(/\/[^\/\?]+(\?.*)?$/, '');
  const connectionString = `${urlWithoutDb}/${database}`;
  
  // Valida o formato
  const match = connectionString.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error(`Formato inválido de DATABASE_URL: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  }
  
  const [, user, password] = match;
  if (!password || password.trim() === '') {
    throw new Error('Senha não pode estar vazia na DATABASE_URL');
  }
  
  return connectionString;
};

async function setupDatabase() {
  try {
    console.log('🔄 Verificando banco de dados...');
    
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
    console.log(`📝 DATABASE_URL: ${maskedUrl}`);
    
    // Conecta ao banco 'postgres' para verificar/criar o banco
    console.log('🔗 Conectando ao PostgreSQL...');
    const adminDb = pgp(getConnectionString('postgres'));
    
    // Testa a conexão primeiro
    await adminDb.one('SELECT 1 as test');
    console.log('✅ Conexão com PostgreSQL estabelecida!');
    
    // Verifica se o banco existe
    const dbExists = await adminDb.oneOrNone(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    
    if (!dbExists) {
      console.log(`📦 Criando banco de dados "${dbName}"...`);
      // Cria o banco (não pode usar parâmetros aqui, mas é seguro porque dbName vem do .env)
      await adminDb.none(`CREATE DATABASE "${dbName}"`);
      console.log(`✅ Banco de dados "${dbName}" criado com sucesso!`);
    } else {
      console.log(`✅ Banco de dados "${dbName}" já existe.`);
    }
    
    await adminDb.$pool.end();
    
    // Agora conecta ao banco criado e executa o schema
    console.log('🔄 Executando schema SQL...');
    const db = pgp(getConnectionString(dbName));
    
    // Tenta diferentes caminhos para o schema.sql
    const possiblePaths = [
      join(__dirname, 'schema.sql'),
      join(process.cwd(), 'src', 'database', 'schema.sql'),
      join(process.cwd(), 'backend', 'src', 'database', 'schema.sql')
    ];
    
    let schema = '';
    let schemaPath = '';
    for (const path of possiblePaths) {
      try {
        schema = readFileSync(path, 'utf-8');
        schemaPath = path;
        console.log(`📄 Schema encontrado em: ${path}`);
        break;
      } catch (e) {
        // Tenta próximo caminho
      }
    }
    
    if (!schema) {
      console.warn('⚠️  Arquivo schema.sql não encontrado. Pulando execução do schema.');
      console.warn('   Execute manualmente: psql -U postgres -d smartstock -f src/database/schema.sql');
    } else {
      // Executa o schema completo de uma vez (mais eficiente)
      try {
        await db.none(schema);
        console.log('✅ Schema SQL executado com sucesso!');
      } catch (error: any) {
        // Se der erro, tenta executar comando por comando
        console.log('⚠️  Tentando executar comando por comando...');
        const commands = schema
          .split(';')
          .map(cmd => cmd.trim())
          .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
        
        for (const command of commands) {
          if (command.trim()) {
            try {
              await db.none(command);
            } catch (error: any) {
              // Ignora erros de "já existe" (IF NOT EXISTS)
              if (!error.message?.includes('already exists') && 
                  !error.message?.includes('duplicate') &&
                  !error.message?.includes('does not exist')) {
                console.warn(`⚠️  Aviso ao executar comando: ${error.message}`);
              }
            }
          }
        }
        console.log('✅ Schema SQL executado com sucesso!');
      }
    }
    
    await db.$pool.end();
    console.log('🎉 Setup do banco de dados concluído!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao configurar banco de dados:', error.message);
    console.error('');
    console.error('💡 Verifique:');
    console.error('   1. PostgreSQL está rodando?');
    console.error('   2. Credenciais no .env estão corretas?');
    console.error('   3. Usuário tem permissão para criar bancos?');
    console.error('');
    console.error('📝 Exemplo de DATABASE_URL no .env:');
    console.error('   DATABASE_URL="postgresql://postgres:jonas1385@localhost:5432/smartstock"');
    console.error('   (ou sem aspas: DATABASE_URL=postgresql://postgres:jonas1385@localhost:5432/smartstock)');
    process.exit(1);
  }
}

setupDatabase();
