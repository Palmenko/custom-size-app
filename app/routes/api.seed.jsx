import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ request }) {
  await authenticate.admin(request);
  
  try {
    console.log('Начинаем заполнение базы данных тестовыми данными...');

    // Проверяем, есть ли уже мерки
    const existingMeasurements = await prisma.measurement.count();
    if (existingMeasurements > 0) {
      return json({ 
        message: 'База данных уже содержит данные', 
        measurementsCount: existingMeasurements 
      });
    }

    // Добавляем тестовые мерки
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

    // Создаем мерки
    for (const measurement of measurements) {
      await prisma.measurement.create({
        data: measurement
      });
    }

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
      await prisma.productGroup.create({
        data: groupData
      });
    }

    // Получаем созданные мерки и группы
    const createdMeasurements = await prisma.measurement.findMany();
    const createdGroups = await prisma.productGroup.findMany();

    // Назначаем мерки группам
    const groupMeasurements = [
      // Платья - все мерки
      {
        groupId: createdGroups.find(g => g.name === 'Платья').id,
        measurementIds: createdMeasurements.map(m => m.id),
        required: createdMeasurements.filter(m => ['Рост', 'Обхват груди', 'Обхват талии', 'Обхват бедер'].includes(m.name)).map(m => m.id)
      },
      // Футболки - основные мерки
      {
        groupId: createdGroups.find(g => g.name === 'Футболки').id,
        measurementIds: createdMeasurements.filter(m => ['Рост', 'Обхват груди', 'Обхват талии', 'Длина рукава'].includes(m.name)).map(m => m.id),
        required: createdMeasurements.filter(m => ['Рост', 'Обхват груди', 'Длина рукава'].includes(m.name)).map(m => m.id)
      },
      // Джинсы - мерки для брюк
      {
        groupId: createdGroups.find(g => g.name === 'Джинсы').id,
        measurementIds: createdMeasurements.filter(m => ['Рост', 'Обхват талии', 'Обхват бедер', 'Длина ноги'].includes(m.name)).map(m => m.id),
        required: createdMeasurements.filter(m => ['Рост', 'Обхват талии', 'Обхват бедер', 'Длина ноги'].includes(m.name)).map(m => m.id)
      },
      // Рубашки - мерки для рубашек
      {
        groupId: createdGroups.find(g => g.name === 'Рубашки').id,
        measurementIds: createdMeasurements.filter(m => ['Рост', 'Обхват груди', 'Обхват талии', 'Длина рукава', 'Обхват шеи'].includes(m.name)).map(m => m.id),
        required: createdMeasurements.filter(m => ['Рост', 'Обхват груди', 'Длина рукава', 'Обхват шеи'].includes(m.name)).map(m => m.id)
      },
      // Брюки - мерки для брюк
      {
        groupId: createdGroups.find(g => g.name === 'Брюки').id,
        measurementIds: createdMeasurements.filter(m => ['Рост', 'Обхват талии', 'Обхват бедер', 'Длина ноги'].includes(m.name)).map(m => m.id),
        required: createdMeasurements.filter(m => ['Рост', 'Обхват талии', 'Обхват бедер', 'Длина ноги'].includes(m.name)).map(m => m.id)
      }
    ];

    // Создаем связи мерок с группами
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
    }

    console.log('База данных успешно заполнена тестовыми данными!');

    return json({ 
      success: true,
      message: 'База данных заполнена тестовыми данными',
      measurementsCount: createdMeasurements.length,
      groupsCount: createdGroups.length
    });

  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    return json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
} 