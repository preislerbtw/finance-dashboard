import { createApp } from './app'
import { env } from './config/env'
import { createInMemoryRepositories } from './repositories/memory'
import { createPostgresRepositories } from './repositories/postgres'
import { pool } from '../db/pool';

async function bootstrap() {
  let repos
  if (env.databaseUrl) {
    await pool.query('SELECT 1') // falha cedo se o banco estiver fora do ar
    repos = createPostgresRepositories(pool)
    console.log('Usando PostgreSQL')
  } else {
    repos = createInMemoryRepositories()
    console.log('DATABASE_URL vazio: usando repositório em memória')
  }

  createApp(repos).listen(env.port, () => {
    console.log(`API rodando em http://localhost:${env.port}`)
  })
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar:', err)
  process.exit(1)
})