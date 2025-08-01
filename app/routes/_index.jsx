import { redirect, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  // Проверяем наличие необходимых переменных окружения
  const hasShopifyConfig = process.env.SHOPIFY_API_KEY && process.env.SHOPIFY_API_SECRET && process.env.SHOPIFY_APP_URL;
  
  if (hasShopifyConfig) {
    // Если переменные настроены, перенаправляем на приложение
    return redirect("/app");
  }
  
  // Если переменные не настроены, показываем инструкции
  return json({
    hasShopifyConfig: false,
    missingVars: {
      SHOPIFY_API_KEY: !process.env.SHOPIFY_API_KEY,
      SHOPIFY_API_SECRET: !process.env.SHOPIFY_API_SECRET,
      SHOPIFY_APP_URL: !process.env.SHOPIFY_APP_URL,
      DATABASE_URL: !process.env.DATABASE_URL
    }
  });
}

export default function Index() {
  const { hasShopifyConfig, missingVars } = useLoaderData();
  
  if (hasShopifyConfig) {
    return null; // Будет перенаправление
  }
  
  return (
    <html>
      <head>
        <title>Custom Size App - Настройка</title>
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
          <h1>🔧 Custom Size App - Настройка</h1>
          <p><strong>Статус:</strong> Приложение готово к работе, но требует настройки переменных окружения.</p>
          
          <h2>Необходимые переменные окружения:</h2>
          <ul>
            <li style={{ color: missingVars.SHOPIFY_API_KEY ? 'red' : 'green' }}>
              SHOPIFY_API_KEY: {missingVars.SHOPIFY_API_KEY ? 'НЕ НАСТРОЕНА' : 'НАСТРОЕНА'}
            </li>
            <li style={{ color: missingVars.SHOPIFY_API_SECRET ? 'red' : 'green' }}>
              SHOPIFY_API_SECRET: {missingVars.SHOPIFY_API_SECRET ? 'НЕ НАСТРОЕНА' : 'НАСТРОЕНА'}
            </li>
            <li style={{ color: missingVars.SHOPIFY_APP_URL ? 'red' : 'green' }}>
              SHOPIFY_APP_URL: {missingVars.SHOPIFY_APP_URL ? 'НЕ НАСТРОЕНА' : 'НАСТРОЕНА'}
            </li>
            <li style={{ color: missingVars.DATABASE_URL ? 'red' : 'green' }}>
              DATABASE_URL: {missingVars.DATABASE_URL ? 'НЕ НАСТРОЕНА' : 'НАСТРОЕНА'}
            </li>
          </ul>
          
          <h2>Инструкции по настройке:</h2>
          <ol>
            <li>Перейдите в Vercel Dashboard</li>
            <li>Откройте ваш проект</li>
            <li>Перейдите в раздел "Settings" → "Environment Variables"</li>
            <li>Добавьте следующие переменные:</li>
            <ul>
              <li><strong>SHOPIFY_API_KEY</strong> - ваш Shopify API ключ</li>
              <li><strong>SHOPIFY_API_SECRET</strong> - ваш Shopify API секрет</li>
              <li><strong>SHOPIFY_APP_URL</strong> - URL вашего приложения (например: https://your-app.vercel.app)</li>
              <li><strong>DATABASE_URL</strong> - URL вашей базы данных PostgreSQL</li>
              <li><strong>SCOPES</strong> - разрешения приложения (например: write_products,read_products)</li>
            </ul>
            <li>Сохраните переменные и перезапустите деплой</li>
          </ol>
          
          <p><strong>После настройки переменных окружения приложение будет автоматически перенаправлять на панель управления мерками.</strong></p>
        </div>
      </body>
    </html>
  );
} 