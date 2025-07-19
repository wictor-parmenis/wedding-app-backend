import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  const sqlFile = readFileSync(path.resolve(__dirname, 'seed.sql'), 'utf8')
  const statements = sqlFile.split(';').filter(statement => statement.trim())
  
  for (const statement of statements) {
    if (statement.trim()) {
      await prisma.$executeRawUnsafe(statement + ';')
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })