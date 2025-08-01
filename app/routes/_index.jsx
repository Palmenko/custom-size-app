import { json } from "@remix-run/node";

export async function loader() {
  return json({ 
    status: "ok", 
    message: "Custom Size App is running",
    timestamp: new Date().toISOString() 
  });
}

export default function Index() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Custom Size App</h1>
      <p>Application is running successfully!</p>
    </div>
  );
} 