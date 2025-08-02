import { json } from "@remix-run/node";

export async function loader() {
  return json({
    message: "Test route works!",
    timestamp: new Date().toISOString()
  });
}

import { useLoaderData } from "@remix-run/react";

export default function Test() {
  const data = useLoaderData();
  
  return (
    <html>
      <head>
        <title>Test Route</title>
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
          <h1>🧪 Test Route</h1>
          <p><strong>Сообщение:</strong> {data.message}</p>
          <p><strong>Время:</strong> {data.timestamp}</p>
          <p>Если вы видите эту страницу, значит Remix работает!</p>
        </div>
      </body>
    </html>
  );
} 