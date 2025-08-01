import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { LATEST_API_VERSION, DeliveryMethod } from "@shopify/shopify-api";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { PrismaClient } from "@prisma/client";

// Проверяем необходимые переменные окружения
const requiredEnvVars = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL
};

// Проверяем, что все переменные настроены
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('❌ Отсутствуют переменные окружения:', missingVars);
  console.error('Пожалуйста, настройте следующие переменные в Vercel Dashboard:');
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`);
  });
}

const prisma = new PrismaClient();

// Создаем session storage с обработкой ошибок
let prismaSessionStorage;
try {
  prismaSessionStorage = new PrismaSessionStorage(prisma);
  console.log('✅ PrismaSessionStorage инициализирован');
} catch (error) {
  console.error('❌ Ошибка инициализации PrismaSessionStorage:', error);
  throw error;
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(",") || [],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: prismaSessionStorage,
  distribution: "app",
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    APP_SCOPES_UPDATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/scopes_update",
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      try {
        await shopify.registerWebhooks({ session });
        console.log('✅ Webhooks зарегистрированы');
      } catch (error) {
        console.error('❌ Ошибка регистрации webhooks:', error);
      }
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  isEmbeddedApp: true,
});

export default shopify;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
