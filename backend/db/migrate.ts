import { readFileSync } from 'node:fs'
import path from 'node:path'
import { pool } from './pool'

async function main() {
  const sql = readFileSync(path.resolve(__dirname, 'schema.sql'), 'utf8')
  await pool.query(sql)
  console.log('Banco migrado com sucesso.')
  await pool.end()
}

main().catch((err) => {
  console.error('Falha na migração:', err)
  process.exit(1)
})