import { json } from "@remix-run/node";

export async function loader() {
  console.log("🏥 Healthcheck endpoint called");
  
  return json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    port: process.env.PORT || "3000",
    environment: process.env.NODE_ENV || "development"
  });
}

export async function action() {
  return json({ status: "ok" });
} 

export default function Health() {
  return (
    <html>
      <head>
        <title>Health Check</title>
      </head>
      <body>
        <h1>🏥 Health Check</h1>
        <p>Status: OK</p>
        <p>Port: {process.env.PORT || "3000"}</p>
        <p>Environment: {process.env.NODE_ENV || "development"}</p>
        <p>Time: {new Date().toISOString()}</p>
      </body>
    </html>
  );
} 