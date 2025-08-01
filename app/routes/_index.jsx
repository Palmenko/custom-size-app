import { json } from "@remix-run/node";

export async function loader() {
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
      </head>
      <body>
        <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "20px" }}>
          <h1>Custom Size App</h1>
          <p>Application is running successfully!</p>
          <p>Status: ✅ OK</p>
          <p>Port: {process.env.PORT || "3000"}</p>
        </div>
      </body>
    </html>
  );
} 