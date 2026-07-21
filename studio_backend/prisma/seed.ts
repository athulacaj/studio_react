import { PrismaClient } from '@prisma/client';
import { generateFileId } from '../src/utils/idGenerator';

const prisma = new PrismaClient();

async function main() {
  const projectId = 'demo-project-123';

  const file1 = {
    projectId,
    name: 'logo.png',
    relativePath: 'assets/images',
    updatedAt: new Date(),
  };

  await prisma.file.upsert({
    where: {
      projectId_id: {
        projectId,
        id: generateFileId(file1.relativePath, file1.name),
      },
    },
    update: {},
    create: {
      ...file1,
      id: generateFileId(file1.relativePath, file1.name),
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
