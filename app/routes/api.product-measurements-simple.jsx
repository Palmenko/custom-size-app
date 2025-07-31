import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const productTags = url.searchParams.get('tags')?.split(',').map(tag => tag.trim()) || [];
    
    if (!productId) {
      return json({ error: 'ID товара не указан' }, { status: 400 });
    }
    
    console.log('Поиск мерок для товара:', {
      productId,
      tags: productTags
    });
    
    // Простая логика: если есть тег "платье", возвращаем все мерки
    // В реальной реализации здесь будет логика поиска групп
    let measurements = [];
    
    if (productTags.includes('платье')) {
      // Для платьев - все мерки
      measurements = await prisma.measurement.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' }
      });
    } else if (productTags.includes('футболка')) {
      // Для футболок - основные мерки
      measurements = await prisma.measurement.findMany({
        where: { 
          active: true,
          name: { in: ['Рост', 'Обхват груди', 'Обхват талии', 'Длина рукава'] }
        },
        orderBy: { sortOrder: 'asc' }
      });
    } else if (productTags.includes('джинсы') || productTags.includes('брюки')) {
      // Для джинсов и брюк - мерки для брюк
      measurements = await prisma.measurement.findMany({
        where: { 
          active: true,
          name: { in: ['Рост', 'Обхват талии', 'Обхват бедер', 'Длина ноги'] }
        },
        orderBy: { sortOrder: 'asc' }
      });
    } else if (productTags.includes('рубашка')) {
      // Для рубашек - мерки для рубашек
      measurements = await prisma.measurement.findMany({
        where: { 
          active: true,
          name: { in: ['Рост', 'Обхват груди', 'Обхват талии', 'Длина рукава', 'Обхват шеи'] }
        },
        orderBy: { sortOrder: 'asc' }
      });
    }
    
    // Преобразуем мерки в нужный формат
    const formattedMeasurements = measurements.map(m => ({
      id: m.id,
      name: m.name,
      description: m.description,
      unit: m.unit,
      minValue: m.minValue,
      maxValue: m.maxValue,
      step: m.step,
      required: m.required,
      sortOrder: m.sortOrder
    }));
    
    console.log('Возвращаем мерки:', formattedMeasurements.length);
    
    return json({ 
      measurements: formattedMeasurements,
      groupName: productTags.length > 0 ? `Группа для ${productTags[0]}` : 'Общие мерки',
      groupDescription: `Мерки для товара с тегами: ${productTags.join(', ')}`
    });
    
  } catch (error) {
    console.error('Ошибка при получении мерок товара:', error);
    return json({ error: 'Ошибка при получении мерок товара' }, { status: 500 });
  }
} 