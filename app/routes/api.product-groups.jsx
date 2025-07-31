import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }) {
  await authenticate.admin(request);
  
  try {
    const productGroups = await prisma.productGroup.findMany({
      include: {
        groupMeasurements: {
          include: {
            measurement: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        sortOrder: 'asc'
      }
    });
    
    return json({ productGroups });
  } catch (error) {
    console.error('Ошибка при загрузке групп товаров:', error);
    return json({ error: 'Ошибка при загрузке групп товаров' }, { status: 500 });
  }
}

export async function action({ request }) {
  await authenticate.admin(request);
  
  try {
    const formData = await request.formData();
    const action = formData.get('action');
    
    switch (action) {
      case 'create':
        return await createProductGroup(formData);
      case 'update':
        return await updateProductGroup(formData);
      case 'delete':
        return await deleteProductGroup(formData);
      case 'update-measurements':
        return await updateGroupMeasurements(formData);
      default:
        return json({ error: 'Неизвестное действие' }, { status: 400 });
    }
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return json({ error: 'Ошибка при обработке запроса' }, { status: 500 });
  }
}

async function createProductGroup(formData) {
  const name = formData.get('name');
  const description = formData.get('description');
  const type = formData.get('type');
  const value = formData.get('value');
  const sortOrder = parseInt(formData.get('sortOrder') || '0');
  
  if (!name || !type || !value) {
    return json({ error: 'Необходимо заполнить все обязательные поля' }, { status: 400 });
  }
  
  try {
    const productGroup = await prisma.productGroup.create({
      data: {
        name,
        description,
        type,
        value,
        sortOrder
      },
      include: {
        groupMeasurements: {
          include: {
            measurement: true
          }
        }
      }
    });
    
    return json({ productGroup });
  } catch (error) {
    console.error('Ошибка при создании группы товаров:', error);
    return json({ error: 'Ошибка при создании группы товаров' }, { status: 500 });
  }
}

async function updateProductGroup(formData) {
  const id = parseInt(formData.get('id'));
  const name = formData.get('name');
  const description = formData.get('description');
  const type = formData.get('type');
  const value = formData.get('value');
  const sortOrder = parseInt(formData.get('sortOrder') || '0');
  const active = formData.get('active') === 'true';
  
  if (!id || !name || !type || !value) {
    return json({ error: 'Необходимо заполнить все обязательные поля' }, { status: 400 });
  }
  
  try {
    const productGroup = await prisma.productGroup.update({
      where: { id },
      data: {
        name,
        description,
        type,
        value,
        sortOrder,
        active
      },
      include: {
        groupMeasurements: {
          include: {
            measurement: true
          }
        }
      }
    });
    
    return json({ productGroup });
  } catch (error) {
    console.error('Ошибка при обновлении группы товаров:', error);
    return json({ error: 'Ошибка при обновлении группы товаров' }, { status: 500 });
  }
}

async function deleteProductGroup(formData) {
  const id = parseInt(formData.get('id'));
  
  if (!id) {
    return json({ error: 'ID группы товаров не указан' }, { status: 400 });
  }
  
  try {
    await prisma.productGroup.delete({
      where: { id }
    });
    
    return json({ success: true });
  } catch (error) {
    console.error('Ошибка при удалении группы товаров:', error);
    return json({ error: 'Ошибка при удалении группы товаров' }, { status: 500 });
  }
}

async function updateGroupMeasurements(formData) {
  const productGroupId = parseInt(formData.get('productGroupId'));
  const measurements = JSON.parse(formData.get('measurements') || '[]');
  
  if (!productGroupId) {
    return json({ error: 'ID группы товаров не указан' }, { status: 400 });
  }
  
  try {
    // Удаляем все существующие мерки группы
    await prisma.groupMeasurement.deleteMany({
      where: { productGroupId }
    });
    
    // Добавляем новые мерки
    if (measurements.length > 0) {
      await prisma.groupMeasurement.createMany({
        data: measurements.map((measurement, index) => ({
          productGroupId,
          measurementId: measurement.measurementId,
          required: measurement.required || false,
          sortOrder: measurement.sortOrder || index,
          active: measurement.active !== false
        }))
      });
    }
    
    // Возвращаем обновленную группу
    const productGroup = await prisma.productGroup.findUnique({
      where: { id: productGroupId },
      include: {
        groupMeasurements: {
          include: {
            measurement: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        }
      }
    });
    
    return json({ productGroup });
  } catch (error) {
    console.error('Ошибка при обновлении мерок группы:', error);
    return json({ error: 'Ошибка при обновлении мерок группы' }, { status: 500 });
  }
} 