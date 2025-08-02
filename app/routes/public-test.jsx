import { json } from "@remix-run/node";

export async function loader() {
  return json({
    message: "Приложение работает!",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    }
  });
}

import { useLoaderData } from "@remix-run/react";

export default function PublicTest() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Public Test</title>
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
          <h1>✅ Public Test - Приложение работает!</h1>
          
          <h2>Сообщение:</h2>
          <p>{data.message}</p>
          
          <h2>Время:</h2>
          <p>{data.timestamp}</p>
          
          <h2>Переменные окружения:</h2>
          <ul>
            <li><strong>NODE_ENV:</strong> {data.env.NODE_ENV}</li>
            <li><strong>VERCEL_ENV:</strong> {data.env.VERCEL_ENV}</li>
            <li><strong>VERCEL_URL:</strong> {data.env.VERCEL_URL}</li>
          </ul>
          
          <h2>Ссылки для тестирования:</h2>
          <ul>
            <li><a href="/debug">Debug (требует аутентификации)</a></li>
            <li><a href="/db-test">Database Test (требует аутентификации)</a></li>
            <li><a href="/health">Health Check</a></li>
          </ul>
        </div>
      </body>
    </html>
  );
} 