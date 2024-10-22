import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const token1 = await prisma.token.upsert({
    where: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' },
    update: {},
    create: {
      name: 'Ethereum',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
  });
  const token2 = await prisma.token.upsert({
    where: { address: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6' },
    update: {},
    create: {
      name: 'Polygon',
      address: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    },
  });

  console.log({ token1, token2 });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
