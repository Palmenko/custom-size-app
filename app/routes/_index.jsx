import { json } from "@remix-run/node";

export async function loader() {
  console.log("🚀 Healthcheck called at:", new Date().toISOString());
  console.log("📡 Port:", process.env.PORT || "3000");
  
  return json({ 
    status: "ok", 
    message: "Custom Size App is running",
    timestamp: new Date().toISOString(),
    port: process.env.PORT || "3000"
  });
}

export default function Index() {
  return (
    <html>
      <head>
        <title>Custom Size App</title>
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
          <h1>✅ Custom Size App</h1>
          <p><strong>Status:</strong> Running successfully!</p>
          <p><strong>Port:</strong> {process.env.PORT || "3000"}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV || "development"}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>
      </body>
    </html>
  );
} 