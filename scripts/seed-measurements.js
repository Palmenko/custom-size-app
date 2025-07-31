import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMeasurements() {
  try {
    console.log('Начинаем добавление тестовых мерок...');

    const measurements = [
      {
        name: 'Рост',
        description: 'Ваш рост в сантиметрах',
        unit: 'см',
        minValue: 100,
        maxValue: 250,
        step: 1,
        required: true,
        active: true,
        sortOrder: 0
      },
      {
        name: 'Обхват груди',
        description: 'Обхват груди в сантиметрах',
        unit: 'см',
        minValue: 60,
        maxValue: 150,
        step: 1,
        required: true,
        active: true,
        sortOrder: 1
      },
      {
        name: 'Обхват талии',
        description: 'Обхват талии в сантиметрах',
        unit: 'см',
        minValue: 50,
        maxValue: 150,
        step: 1,
        required: true,
        active: true,
        sortOrder: 2
      },
      {
        name: 'Обхват бедер',
        description: 'Обхват бедер в сантиметрах',
        unit: 'см',
        minValue: 70,
        maxValue: 160,
        step: 1,
        required: true,
        active: true,
        sortOrder: 3
      },
      {
        name: 'Длина рукава',
        description: 'Длина рукава от плеча до запястья',
        unit: 'см',
        minValue: 40,
        maxValue: 100,
        step: 1,
        required: false,
        active: true,
        sortOrder: 4
      },
      {
        name: 'Обхват шеи',
        description: 'Обхват шеи в сантиметрах',
        unit: 'см',
        minValue: 30,
        maxValue: 60,
        step: 1,
        required: false,
        active: true,
        sortOrder: 5
      },
      {
        name: 'Длина ноги',
        description: 'Внутренняя длина ноги от паха до щиколотки',
        unit: 'см',
        minValue: 50,
        maxValue: 100,
        step: 1,
        required: false,
        active: true,
        sortOrder: 6
      },
      {
        name: 'Обхват запястья',
        description: 'Обхват запястья в сантиметрах',
        unit: 'см',
        minValue: 10,
        maxValue: 30,
        step: 1,
        required: false,
        active: true,
        sortOrder: 7
      }
    ];

    for (const measurement of measurements) {
      await prisma.measurement.create({
        data: measurement
      });
      console.log(`Добавлена мерка: ${measurement.name}`);
    }

    console.log('Все тестовые мерки успешно добавлены!');
  } catch (error) {
    console.error('Ошибка при добавлении мерок:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем скрипт
seedMeasurements();