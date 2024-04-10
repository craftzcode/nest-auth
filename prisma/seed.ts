import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

//! Initialize (PrismaClient)
const prisma = new PrismaClient()

async function main() {
  //! Create two dummy users
  const passwordIvan = await bcrypt.hash('password-ivan', 10)
  const passwordAli = await bcrypt.hash('password-ali', 10)
  const passwordChristine = await bcrypt.hash('password-christine', 10)

  const user1 = await prisma.user.upsert({
    where: { email: 'igmtdevofficial@gmail.com' },
    update: {},
    create: {
      name: 'Ivan Gregor Tabalno',
      username: 'igmtdev',
      email: 'igmtdevofficial@gmail.com',
      password: passwordIvan,
      role: 'ADMIN'
    }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'alitabalnoofficial@gmail.com' },
    update: {},
    create: {
      name: 'Aiori Lovemir Iveen Tabalno',
      username: 'aliofficial',
      email: 'alitabalnoofficial@gmail.com',
      password: passwordAli,
      role: 'USER'
    }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'cjamper12@gmail.com' },
    update: {},
    create: {
      name: 'Christine Joyce Amper',
      username: 'cjamper12',
      email: 'cjamper12@gmail.com',
      password: passwordChristine,
      role: 'USER'
    }
  })

  console.log({ user1, user2, user3 })
}

//! Execute the main function
main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    //! Close (PrismaClient) at the end
    await prisma.$disconnect()
  })
