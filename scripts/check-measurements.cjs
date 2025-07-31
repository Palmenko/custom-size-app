const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMeasurements() {
  try {
    console.log('Проверяем мерки в базе данных...');

    const measurements = await prisma.measurement.findMany({
      orderBy: { id: 'asc' }
    });

    console.log('Найдено мерок:', measurements.length);
    measurements.forEach(m => {
      console.log(`ID: ${m.id}, Название: ${m.name}, Активна: ${m.active}`);
    });

  } catch (error) {
    console.error('Ошибка при проверке мерок:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMeasurements(); 