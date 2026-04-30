import { PrismaClient, Rol } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@cristaleria.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin1234!';

  const existing = await prisma.usuario.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log(`ℹ️  El usuario administrador ya existe: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.usuario.create({
    data: {
      email: adminEmail,
      nombre: 'Administrador',
      password: hashedPassword,
      rol: Rol.ADMIN,
      activo: true,
    },
  });

  console.log(`✅ Usuario administrador creado:`);
  console.log(`   Email:    ${admin.email}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Rol:      ${admin.rol}`);
  console.log(`\n⚠️  Cambia la contraseña tras el primer inicio de sesión.`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
