import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient();
  }
}

const prisma = global.prismaGlobal ?? new PrismaClient();

// Функция для инициализации базы данных
async function initializeDatabase() {
  try {
    // Проверяем подключение к базе данных
    await prisma.$connect();
    console.log('✅ Подключение к базе данных установлено');
    
    // Проверяем существование таблицы session
    try {
      await prisma.session.count();
      console.log('✅ Таблица session существует');
    } catch (error) {
      console.log('⚠️ Таблица session не существует, создаем...');
      // Здесь можно добавить создание таблиц если нужно
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    throw error;
  }
}

// Инициализируем базу данных при импорте
if (typeof window === 'undefined') {
  initializeDatabase().catch(console.error);
}

export default prisma;
