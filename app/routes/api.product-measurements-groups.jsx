import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  // Обработка preflight запросов
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
  
  try {
    console.log('=== API product-measurements-groups ===');
    
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const tagsParam = url.searchParams.get('tags');
    
    console.log('Параметры:', { productId, tagsParam });
    console.log('URL:', request.url);
    console.log('Все параметры URL:', Object.fromEntries(url.searchParams.entries()));
    console.log('Headers:', Object.fromEntries(request.headers.entries()));
    
    if (!productId) {
      return json({ error: 'ID товара не указан' }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // Обрабатываем теги
    const productTags = tagsParam ? tagsParam.split(',').map(tag => tag.trim()) : [];
    console.log('Теги товара:', productTags);
    console.log('Количество тегов:', productTags.length);
    console.log('Первый тег:', productTags[0]);
    
    // Ищем группы по тегам
    console.log('Выполняем Prisma запрос с параметрами:', {
      active: true,
      type: 'tag',
      value: { in: productTags }
    });
    
    const matchingGroups = await prisma.productGroup.findMany({
      where: {
        active: true,
        type: 'tag',
        value: { in: productTags }
      },
      include: {
        groupMeasurements: {
          where: { active: true },
          include: {
            measurement: true
          },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    
    console.log('Найдено подходящих групп:', matchingGroups.length);
    
    // Если найдены группы, берем первую
    let measurements = [];
    let groupName = '';
    let groupDescription = '';
    
    if (matchingGroups.length > 0) {
      const selectedGroup = matchingGroups[0];
      groupName = selectedGroup.name;
      groupDescription = selectedGroup.description || `Мерки для группы "${selectedGroup.name}"`;
      
      // Получаем мерки из группы
      measurements = selectedGroup.groupMeasurements
        .filter(gm => gm.measurement && gm.measurement.active) // Фильтруем только активные мерки
        .map(gm => ({
          id: gm.measurement.id,
          name: gm.measurement.name,
          description: gm.measurement.description,
          unit: gm.measurement.unit,
          minValue: gm.measurement.minValue,
          maxValue: gm.measurement.maxValue,
          step: gm.measurement.step,
          required: gm.required, // Используем required из группы
          sortOrder: gm.sortOrder
        }))
        .sort((a, b) => a.sortOrder - b.sortOrder);
      
      console.log(`Группа "${selectedGroup.name}": найдено ${measurements.length} мерок`);
    }
    
    return json({ 
      measurements,
      groupName,
      groupDescription,
      foundGroups: matchingGroups.length
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('Ошибка в тестовом API:', error);
    return json({ error: error.message }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
} 