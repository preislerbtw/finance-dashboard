import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

export const env = {
  port: Number(process.env.PORT ?? 3333),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-nao-usar-em-producao',
  databaseUrl: process.env.DATABASE_URL ?? '',
}