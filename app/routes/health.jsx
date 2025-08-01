import { json } from "@remix-run/node";

export async function loader() {
  return json({ status: "ok", timestamp: new Date().toISOString() });
}

export async function action() {
  return json({ status: "ok" });
} 