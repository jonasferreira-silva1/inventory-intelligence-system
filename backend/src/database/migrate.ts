import { readFileSync } from 'fs';
import { join } from 'path';
import db from './connection';

async function migrate() {
  try {
    console.log('🔄 Executando migrações...');
    
    // Tenta diferentes caminhos
    const possiblePaths = [
      join(__dirname, 'schema.sql'),
      join(process.cwd(), 'src', 'database', 'schema.sql'),
      join(process.cwd(), 'backend', 'src', 'database', 'schema.sql')
    ];
    
    let schema = '';
    for (const path of possiblePaths) {
      try {
        schema = readFileSync(path, 'utf-8');
        console.log(`📄 Schema encontrado em: ${path}`);
        break;
      } catch (e) {
        // Tenta próximo caminho
      }
    }
    
    if (!schema) {
      throw new Error('Arquivo schema.sql não encontrado. Execute manualmente: psql -U usuario -d smartstock -f src/database/schema.sql');
    }
    
    await db.none(schema);
    
    console.log('✅ Migrações executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    console.error('\n💡 Dica: Execute manualmente o SQL:');
    console.error('   psql -U usuario -d smartstock -f src/database/schema.sql');
    process.exit(1);
  }
}

migrate();
