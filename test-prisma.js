const { PrismaClient } = require('./b2-backend/dist/src/generated/prisma');

try {
  const p = new PrismaClient({ accelerateUrl: 'prisma+postgres://dummy' });
  console.log('SUCCESS with accelerateUrl');
} catch (e) {
  console.error('ERROR:', e.message.split('\n')[0]);
}
