import pgPromise from 'pg-promise';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

const pgp = pgPromise({
  capSQL: true // capitalize SQL
});

// Constrói a connection string
const getConnectionString = () => {
  // Se DATABASE_URL estiver definida, usa ela
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  // Senão, constrói a partir das variáveis individuais
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || '';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DATABASE_NAME || 'smartstock';
  
  // Codifica a senha para URL (importante para caracteres especiais)
  const encodedPassword = encodeURIComponent(password);
  
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`;
};

const connectionString = getConnectionString();

if (!connectionString || connectionString.includes('undefined')) {
  console.error('❌ ERRO: Configuração do banco de dados incompleta!');
  console.error('');
  console.error('📝 Configure o arquivo .env na pasta backend com:');
  console.error('');
  console.error('   Opção 1 (recomendada):');
  console.error('   DATABASE_URL="postgresql://postgres:senha@localhost:5432/smartstock"');
  console.error('');
  console.error('   Opção 2:');
  console.error('   DB_USER=postgres');
  console.error('   DB_PASSWORD=sua_senha');
  console.error('   DB_HOST=localhost');
  console.error('   DB_PORT=5432');
  console.error('   DATABASE_NAME=smartstock');
  console.error('');
  process.exit(1);
}

export const db = pgp(connectionString);

// Testa a conexão (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  db.connect()
    .then((obj) => {
      console.log('✅ Conectado ao PostgreSQL');
      obj.done();
    })
    .catch((error) => {
      console.error('❌ Erro ao conectar ao PostgreSQL:', error.message);
      console.error('');
      console.error('💡 Verifique:');
      console.error('   1. PostgreSQL está rodando?');
      console.error('   2. Credenciais no .env estão corretas?');
      console.error('   3. O banco existe? Execute: npm run db:setup');
      console.error('');
      process.exit(1);
    });
}

export default db;
