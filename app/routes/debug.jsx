import { json } from "@remix-run/node";

export async function loader() {
  return json({
    SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА",
    SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА", 
    SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL || "НЕ НАСТРОЕНА",
    DATABASE_URL: process.env.DATABASE_URL ? "НАСТРОЕНА" : "НЕ НАСТРОЕНА",
    SCOPES: process.env.SCOPES || "НЕ НАСТРОЕНА",
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL
  });
}

import { useLoaderData } from "@remix-run/react";

export default function Debug() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Debug - Переменные окружения</title>
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
          <h1>🔧 Debug - Переменные окружения</h1>
          
          <h2>Статус переменных:</h2>
          <ul>
            <li><strong>SHOPIFY_API_KEY:</strong> {data.SHOPIFY_API_KEY}</li>
            <li><strong>SHOPIFY_API_SECRET:</strong> {data.SHOPIFY_API_SECRET}</li>
            <li><strong>SHOPIFY_APP_URL:</strong> {data.SHOPIFY_APP_URL}</li>
            <li><strong>DATABASE_URL:</strong> {data.DATABASE_URL}</li>
            <li><strong>SCOPES:</strong> {data.SCOPES}</li>
            <li><strong>NODE_ENV:</strong> {data.NODE_ENV}</li>
            <li><strong>VERCEL_ENV:</strong> {data.VERCEL_ENV}</li>
            <li><strong>VERCEL_URL:</strong> {data.VERCEL_URL}</li>
          </ul>
          
          <h2>Возможные проблемы:</h2>
          <ol>
            <li>Переменные настроены только для Production, но не для Preview</li>
            <li>Переменные настроены с неправильными именами</li>
            <li>Нужно перезапустить деплой после изменения переменных</li>
            <li>Переменные настроены в неправильном окружении (Production/Preview/Development)</li>
          </ol>
          
          <h2>Решение:</h2>
          <ol>
            <li>Проверьте, что переменные настроены для всех окружений (Production, Preview, Development)</li>
            <li>Убедитесь, что имена переменных написаны правильно</li>
            <li>После изменения переменных перезапустите деплой</li>
            <li>Проверьте логи в Vercel Dashboard</li>
          </ol>
        </div>
      </body>
    </html>
  );
} 