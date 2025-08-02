import { json } from "@remix-run/node";

export async function loader() {
  return json({
    status: "OK",
    message: "Приложение работает!",
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    },
    variables: {
      SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА",
      SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА",
      DATABASE_URL: process.env.DATABASE_URL ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА"
    }
  });
}

import { useLoaderData } from "@remix-run/react";

export default function Status() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Status - Custom Size App</title>
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
          <h1>✅ Status - Custom Size App</h1>
          
          <h2>Статус приложения:</h2>
          <p><strong>Статус:</strong> {data.status}</p>
          <p><strong>Сообщение:</strong> {data.message}</p>
          <p><strong>Время:</strong> {data.timestamp}</p>
          
          <h2>Окружение:</h2>
          <ul>
            <li><strong>NODE_ENV:</strong> {data.environment.NODE_ENV}</li>
            <li><strong>VERCEL_ENV:</strong> {data.environment.VERCEL_ENV}</li>
            <li><strong>VERCEL_URL:</strong> {data.environment.VERCEL_URL}</li>
          </ul>
          
          <h2>Переменные окружения:</h2>
          <ul>
            <li><strong>SHOPIFY_API_KEY:</strong> {data.variables.SHOPIFY_API_KEY}</li>
            <li><strong>SHOPIFY_API_SECRET:</strong> {data.variables.SHOPIFY_API_SECRET}</li>
            <li><strong>DATABASE_URL:</strong> {data.variables.DATABASE_URL}</li>
          </ul>
          
          <h2>Следующие шаги:</h2>
          <ol>
            <li>Отключите "Build Logs and Source Protection" в Vercel Dashboard</li>
            <li>Проверьте переменные окружения</li>
            <li>Убедитесь, что база данных подключена</li>
            <li>Настройте Shopify App</li>
          </ol>
        </div>
      </body>
    </html>
  );
} 