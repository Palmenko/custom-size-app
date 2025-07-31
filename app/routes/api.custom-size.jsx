import { json } from "@remix-run/node";
import fs from "fs/promises";
import path from "path";

export async function loader({ request }) {
  // Обработка CORS preflight запросов
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }

  const filePath = path.resolve("shop-settings.json");

  try {
    const file = await fs.readFile(filePath, "utf-8");
    const settings = JSON.parse(file);

    return json({
      enabled: settings.enabled,
      products: settings.products || [], // массив GID
    }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (e) {
    console.error('Ошибка чтения настроек:', e);
    return json({ enabled: false, products: [] }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
}