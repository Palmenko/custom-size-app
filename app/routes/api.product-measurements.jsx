import { json } from "@remix-run/node";
import prisma from "../db.server";

export async function loader({ request }) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const productTags = url.searchParams.get('tags')?.split(',').map(tag => tag.trim()) || [];
    const productTemplate = url.searchParams.get('template');
    const productType = url.searchParams.get('type');
    const productVendor = url.searchParams.get('vendor');
    const productCollections = url.searchParams.get('collections')?.split(',').map(collection => collection.trim()) || [];
    
    if (!productId) {
      return json({ error: 'ID товара не указан' }, { status: 400 });
    }
    
    console.log('Поиск мерок для товара:', {
      productId,
      tags: productTags,
      template: productTemplate,
      type: productType,
      vendor: productVendor,
      collections: productCollections
    });
    
    // Ищем подходящую группу товаров
    let matchedGroup = null;
    
    // Сначала проверяем группы по тегам
    for (const tag of productTags) {
      const group = await prisma.productGroup.findFirst({
        where: {
          type: 'tag',
          value: tag,
          active: true
        },
        include: {
          groupMeasurements: {
            where: {
              active: true
            },
            include: {
              measurement: {
                where: {
                  active: true
                }
              }
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
      
      if (group && group.groupMeasurements.length > 0) {
        matchedGroup = group;
        console.log('Найдена группа по тегу:', tag, group.name);
        break;
      }
    }
    
    // Если группа не найдена по тегам, проверяем по темплейту
    if (!matchedGroup && productTemplate) {
      const group = await prisma.productGroup.findFirst({
        where: {
          type: 'template',
          value: productTemplate,
          active: true
        },
        include: {
          groupMeasurements: {
            where: {
              active: true
            },
            include: {
              measurement: {
                where: {
                  active: true
                }
              }
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
      
      if (group && group.groupMeasurements.length > 0) {
        matchedGroup = group;
        console.log('Найдена группа по темплейту:', productTemplate, group.name);
      }
    }
    
    // Если группа не найдена, проверяем по типу товара
    if (!matchedGroup && productType) {
      const group = await prisma.productGroup.findFirst({
        where: {
          type: 'type',
          value: productType,
          active: true
        },
        include: {
          groupMeasurements: {
            where: {
              active: true
            },
            include: {
              measurement: {
                where: {
                  active: true
                }
              }
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
      
      if (group && group.groupMeasurements.length > 0) {
        matchedGroup = group;
        console.log('Найдена группа по типу товара:', productType, group.name);
      }
    }
    
    // Если группа не найдена, проверяем по вендору
    if (!matchedGroup && productVendor) {
      const group = await prisma.productGroup.findFirst({
        where: {
          type: 'vendor',
          value: productVendor,
          active: true
        },
        include: {
          groupMeasurements: {
            where: {
              active: true
            },
            include: {
              measurement: {
                where: {
                  active: true
                }
              }
            },
            orderBy: {
              sortOrder: 'asc'
            }
          }
        }
      });
      
      if (group && group.groupMeasurements.length > 0) {
        matchedGroup = group;
        console.log('Найдена группа по вендору:', productVendor, group.name);
      }
    }
    
    // Если группа не найдена, проверяем по коллекциям
    if (!matchedGroup && productCollections.length > 0) {
      for (const collection of productCollections) {
        const group = await prisma.productGroup.findFirst({
          where: {
            type: 'collection',
            value: collection,
            active: true
          },
          include: {
            groupMeasurements: {
              where: {
                active: true
              },
              include: {
                measurement: {
                  where: {
                    active: true
                  }
                }
              },
              orderBy: {
                sortOrder: 'asc'
              }
            }
          }
        });
        
        if (group && group.groupMeasurements.length > 0) {
          matchedGroup = group;
          console.log('Найдена группа по коллекции:', collection, group.name);
          break;
        }
      }
    }
    
    if (!matchedGroup) {
      console.log('Подходящая группа товаров не найдена');
      return json({ measurements: [] });
    }
    
    // Преобразуем мерки группы в формат для фронтенда
    const measurements = matchedGroup.groupMeasurements.map(gm => ({
      id: gm.measurement.id,
      name: gm.measurement.name,
      description: gm.measurement.description,
      unit: gm.measurement.unit,
      minValue: gm.measurement.minValue,
      maxValue: gm.measurement.maxValue,
      step: gm.measurement.step,
      required: gm.required,
      sortOrder: gm.sortOrder
    }));
    
    console.log('Возвращаем мерки для группы:', matchedGroup.name, measurements.length);
    
    return json({ 
      measurements,
      groupName: matchedGroup.name,
      groupDescription: matchedGroup.description
    });
    
  } catch (error) {
    console.error('Ошибка при получении мерок товара:', error);
    return json({ error: 'Ошибка при получении мерок товара' }, { status: 500 });
  }
} 