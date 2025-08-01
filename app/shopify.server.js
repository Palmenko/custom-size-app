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

console.log("⚠️ Using mock Shopify configuration for testing");

export default mockShopify;
export const addDocumentResponseHeaders = mockShopify.addDocumentResponseHeaders;
export const authenticate = mockShopify.authenticate;
export const unauthenticated = mockShopify.unauthenticated;
export const login = mockShopify.login;
export const registerWebhooks = mockShopify.registerWebhooks;
export const sessionStorage = mockShopify.sessionStorage;
