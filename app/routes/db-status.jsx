import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";

export async function loader() {
  const prisma = new PrismaClient();
  
  try {
    // Проверяем подключение к базе данных
    await prisma.$connect();
    
    // Проверяем, что таблицы существуют
    const measurementsCount = await prisma.measurement.count();
    const sessionsCount = await prisma.session.count();
    
    return json({
      status: "SUCCESS",
      databaseConnected: true,
      tablesExist: {
        measurements: true,
        sessions: true
      },
      counts: {
        measurements: measurementsCount,
        sessions: sessionsCount
      }
    });
  } catch (error) {
    return json({
      status: "ERROR",
      error: error.message,
      databaseConnected: false,
      tablesExist: {
        measurements: false,
        sessions: false
      }
    });
  } finally {
    await prisma.$disconnect();
  }
}

import { useLoaderData } from "@remix-run/react";

export default function DbStatus() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Database Status</title>
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
          <h1>🗄️ Database Status</h1>
          
          <h2>Статус базы данных:</h2>
          <p><strong>Статус:</strong> {data.status}</p>
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