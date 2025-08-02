import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

export async function loader() {
  const prisma = new PrismaClient();
  
  try {
    // Проверяем подключение к базе данных
    console.log("🔗 Пытаемся подключиться к базе данных...");
    await prisma.$connect();
    console.log("✅ Подключение к базе данных успешно!");
    
    // Проверяем, что таблицы существуют
    console.log("📋 Проверяем таблицы...");
    const measurements = await prisma.measurement.findMany({ take: 1 });
    const sessions = await prisma.session.findMany({ take: 1 });
    
    console.log("✅ Таблицы существуют!");
    
    return json({
      status: "SUCCESS",
      databaseConnected: true,
      tablesExist: {
        measurements: true,
        sessions: true
      },
      counts: {
        measurements: await prisma.measurement.count(),
        sessions: await prisma.session.count()
      },
      message: "База данных работает корректно!"
    });
  } catch (error) {
    console.error("❌ Ошибка базы данных:", error);
    return json({
      status: "ERROR",
      error: error.message,
      databaseConnected: false,
      tablesExist: {
        measurements: false,
        sessions: false
      },
      message: "Проблема с базой данных!"
    });
  } finally {
    await prisma.$disconnect();
  }
}

import { useLoaderData } from "@remix-run/react";

export default function DbConnectionTest() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Database Connection Test</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        <div style={{ 
          fontFamily: "system-ui, sans-serif", 
          lineHeight: "1.8", 
          padding: "20px",
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <h1>🗄️ Database Connection Test</h1>
          
          <h2>Статус базы данных:</h2>
          <p><strong>Статус:</strong> {data.status}</p>
          <p><strong>Сообщение:</strong> {data.message}</p>
          <p><strong>Подключение:</strong> {data.databaseConnected ? "✅ УСПЕШНО" : "❌ ОШИБКА"}</p>
          
          {data.error && (
            <div style={{ background: "#fee", padding: "10px", borderRadius: "4px", margin: "10px 0" }}>
              <strong>Ошибка:</strong> {data.error}
            </div>
          )}
          
          {data.databaseConnected && (
            <div>
              <h3>Таблицы:</h3>
              <ul>
                <li>measurements: {data.tablesExist.measurements ? "✅" : "❌"}</li>
                <li>sessions: {data.tablesExist.sessions ? "✅" : "❌"}</li>
              </ul>
              
              <h3>Количество записей:</h3>
              <ul>
                <li>measurements: {data.counts.measurements}</li>
                <li>sessions: {data.counts.sessions}</li>
              </ul>
            </div>
          )}
          
          <h2>Возможные проблемы:</h2>
          <ol>
            <li>DATABASE_URL не настроен или неправильный</li>
            <li>База данных недоступна</li>
            <li>Миграции не применены</li>
            <li>Проблемы с правами доступа</li>
          </ol>
        </div>
      </body>
    </html>
  );
} 