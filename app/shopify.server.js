// Временная версия без Shopify для тестирования
console.log("🔧 Loading temporary Shopify server configuration");

// Проверяем переменные окружения
const envVars = {
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET,
  SHOPIFY_APP_URL: process.env.SHOPIFY_APP_URL,
  HOST: process.env.HOST,
  NODE_ENV: process.env.NODE_ENV
};

console.log("🔧 Environment variables:", envVars);

// Если переменные не установлены, создаем заглушку
if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_APP_URL) {
  console.log("⚠️ Shopify variables not set, using mock configuration");
  
  // Создаем заглушки для тестирования
  const mockShopify = {
    addDocumentResponseHeaders: (request, responseHeaders) => {
      console.log("📄 Mock addDocumentResponseHeaders called");
    },
    authenticate: {
      admin: async (request) => {
        console.log("🔐 Mock admin authentication called");
        return { admin: { shop: "test-shop.myshopify.com" } };
      }
    },
    unauthenticated: {
      admin: async (request) => {
        console.log("🔓 Mock unauthenticated admin called");
        return { admin: { shop: "test-shop.myshopify.com" } };
      }
    },
    login: async (request) => {
      console.log("🔑 Mock login called");
      return new Response("Mock login", { status: 200 });
    },
    registerWebhooks: async () => {
      console.log("🔔 Mock registerWebhooks called");
    },
    sessionStorage: {
      loadSession: async () => {
        console.log("💾 Mock loadSession called");
        return null;
      }
    }
  };

  export default mockShopify;
  export const addDocumentResponseHeaders = mockShopify.addDocumentResponseHeaders;
  export const authenticate = mockShopify.authenticate;
  export const unauthenticated = mockShopify.unauthenticated;
  export const login = mockShopify.login;
  export const registerWebhooks = mockShopify.registerWebhooks;
  export const sessionStorage = mockShopify.sessionStorage;
} else {
  console.log("✅ Shopify variables set, loading real configuration");
  
  // Импортируем реальную конфигурацию Shopify
  import "@shopify/shopify-app-remix/adapters/node";
  import {
    ApiVersion,
    AppDistribution,
    shopifyApp,
  } from "@shopify/shopify-app-remix/server";
  import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
  import prisma from "./db.server";

  const shopify = shopifyApp({
    apiKey: process.env.SHOPIFY_API_KEY,
    apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
    apiVersion: ApiVersion.January25,
    scopes: process.env.SCOPES?.split(","),
    appUrl: process.env.SHOPIFY_APP_URL || "",
    authPathPrefix: "/auth",
    sessionStorage: new PrismaSessionStorage(prisma),
    distribution: AppDistribution.AppStore,
    future: {
      unstable_newEmbeddedAuthStrategy: true,
      removeRest: true,
    },
    ...(process.env.SHOP_CUSTOM_DOMAIN
      ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
      : {}),
  });

  export default shopify;
  export const apiVersion = ApiVersion.January25;
  export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
  export const authenticate = shopify.authenticate;
  export const unauthenticated = shopify.unauthenticated;
  export const login = shopify.login;
  export const registerWebhooks = shopify.registerWebhooks;
  export const sessionStorage = shopify.sessionStorage;
}
