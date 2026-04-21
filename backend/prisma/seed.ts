import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Puxamos a URL completa que já configuramos no .env e que sabemos que funciona
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não encontrada no .env');
}

// Passamos a connectionString direto para o Pool do pg
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminExists = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
  });

  if (!adminExists) {
    const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL;
    const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;

    if (!initialAdminEmail || !initialAdminPassword) {
      throw new Error(
        'INITIAL_ADMIN_EMAIL ou INITIAL_ADMIN_PASSWORD não definidas no ambiente. Defina no .env antes de iniciar a aplicação.',
      );
    }

    await prisma.user.create({
      data: {
        name: 'Administrador',
        email: initialAdminEmail,
        password: initialAdminPassword, // Lembrete: em um ambiente real, isso deveria passar por um hash (ex: bcrypt)
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin ${initialAdminEmail} criado com sucesso.`);
  } else {
    console.log('ℹ️ Admin já existe. Nenhuma ação necessária.');
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());