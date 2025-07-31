const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedProductGroups() {
  try {
    console.log('Начинаем заполнение групп товаров...');

    // Создаем группы товаров
    const productGroups = [
      {
        name: 'Платья',
        description: 'Мерки для платьев',
        type: 'tag',
        value: 'платье',
        sortOrder: 1,
        active: true
      },
      {
        name: 'Футболки',
        description: 'Мерки для футболок',
        type: 'tag',
        value: 'футболка',
        sortOrder: 2,
        active: true
      },
      {
        name: 'Джинсы',
        description: 'Мерки для джинсов',
        type: 'tag',
        value: 'джинсы',
        sortOrder: 3,
        active: true
      },
      {
        name: 'Рубашки',
        description: 'Мерки для рубашек',
        type: 'tag',
        value: 'рубашка',
        sortOrder: 4,
        active: true
      },
      {
        name: 'Брюки',
        description: 'Мерки для брюк',
        type: 'tag',
        value: 'брюки',
        sortOrder: 5,
        active: true
      }
    ];

    // Создаем группы
    for (const groupData of productGroups) {
      const group = await prisma.productGroup.create({
        data: groupData
      });
      console.log(`Создана группа: ${group.name}`);
    }

    // Получаем все мерки
    const measurements = await prisma.measurement.findMany({
      where: { active: true }
    });

    if (measurements.length === 0) {
      console.log('Нет активных мерок для назначения группам');
      return;
    }

    // Получаем созданные группы
    const groups = await prisma.productGroup.findMany();

    // Назначаем мерки группам
    const groupMeasurements = [
      // Платья - все мерки
      {
        groupId: groups.find(g => g.name === 'Платья').id,
        measurementIds: measurements.map(m => m.id),
        required: [26, 27, 28, 29] // Рост, Обхват груди, Обхват талии, Обхват бедер
      },
      // Футболки - основные мерки
      {
        groupId: groups.find(g => g.name === 'Футболки').id,
        measurementIds: [26, 27, 28, 30], // Рост, Обхват груди, Обхват талии, Длина рукава
        required: [26, 27, 30]
      },
      // Джинсы - мерки для брюк
      {
        groupId: groups.find(g => g.name === 'Джинсы').id,
        measurementIds: [26, 28, 29, 32], // Рост, Обхват талии, Обхват бедер, Длина ноги
        required: [26, 28, 29, 32]
      },
      // Рубашки - мерки для рубашек
      {
        groupId: groups.find(g => g.name === 'Рубашки').id,
        measurementIds: [26, 27, 28, 30, 31], // Рост, Обхват груди, Обхват талии, Длина рукава, Обхват шеи
        required: [26, 27, 30, 31]
      },
      // Брюки - мерки для брюк
      {
        groupId: groups.find(g => g.name === 'Брюки').id,
        measurementIds: [26, 28, 29, 32], // Рост, Обхват талии, Обхват бедер, Длина ноги
        required: [26, 28, 29, 32]
      }
    ];

    for (const gm of groupMeasurements) {
      for (let i = 0; i < gm.measurementIds.length; i++) {
        const measurementId = gm.measurementIds[i];
        const isRequired = gm.required.includes(measurementId);
        
        await prisma.groupMeasurement.create({
          data: {
            productGroupId: gm.groupId,
            measurementId: measurementId,
            required: isRequired,
            sortOrder: i,
            active: true
          }
        });
      }
      console.log(`Назначены мерки для группы ID: ${gm.groupId}`);
    }

    console.log('Заполнение групп товаров завершено!');

  } catch (error) {
    console.error('Ошибка при заполнении групп товаров:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProductGroups(); 