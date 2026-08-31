import { mkdirSync, copyFileSync } from 'fs'
import { join } from 'path'

const routes = ['decolar', 'sound-room', 'playstation-connect']
const distIndex = join('dist', 'index.html')

for (const route of routes) {
  const dir = join('dist', route)
  mkdirSync(dir, { recursive: true })
  copyFileSync(distIndex, join(dir, 'index.html'))
}

console.log('Copiado index.html para:', routes.join(', '))