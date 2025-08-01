import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  try {
    // Проверяем наличие необходимых переменных окружения
    if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
      throw new Error("Shopify API credentials not configured");
    }
    
    await authenticate.admin(request);
    return { apiKey: process.env.SHOPIFY_API_KEY || "" };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Response("Authentication failed", { status: 401 });
  }
};

export default function App() {
  const { apiKey } = useLoaderData();
  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Главная</Link>
        <Link to="/app/measurements">Мерки</Link>
        <Link to="/app/product-groups">Группы товаров</Link>
        <Link to="/app/settings">Настройки</Link>
        <Link to="/app/pricing">Цены</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error("App error:", error);
  
  // Если ошибка аутентификации, показываем понятное сообщение
  if (error?.status === 401) {
    return (
      <html>
        <head>
          <title>Ошибка аутентификации</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </head>
        <body>
          <div style={{ 
            fontFamily: "system-ui, sans-serif", 
            lineHeight: "1.8", 
            padding: "20px",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            <h1>🔐 Ошибка аутентификации</h1>
            <p><strong>Проблема:</strong> Не удалось аутентифицироваться в Shopify.</p>
            
            <h2>Возможные причины:</h2>
            <ul>
              <li>Не настроены переменные окружения SHOPIFY_API_KEY и SHOPIFY_API_SECRET</li>
              <li>Неправильные значения API ключей</li>
              <li>Приложение не установлено в магазине</li>
            </ul>
            
            <h2>Решение:</h2>
            <ol>
              <li>Проверьте переменные окружения в Vercel Dashboard</li>
              <li>Убедитесь, что приложение установлено в вашем Shopify магазине</li>
              <li>Проверьте правильность API ключей</li>
            </ol>
            
            <p><strong>Техническая информация:</strong></p>
            <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
              {error?.message || "Unknown error"}
            </pre>
          </div>
        </body>
      </html>
    );
  }
  
  return boundary.error(error);
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
