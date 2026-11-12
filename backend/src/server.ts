import { createApp } from './app'
import { env } from './config/env'
import { createInMemoryRepositories } from './repositories/memory'


const repos = createInMemoryRepositories()

createApp(repos).listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}`)
})
