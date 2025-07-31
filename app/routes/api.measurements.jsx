import { json } from "@remix-run/node";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../shopify.server";

const prisma = new PrismaClient();

export async function loader({ request }) {
  await authenticate.admin(request);
  try {
    const measurements = await prisma.measurement.findMany({ orderBy: { sortOrder: 'asc' } });
    return json({ measurements });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function action({ request }) {
  await authenticate.admin(request);
  if (request.method === "POST") {
    try {
      const body = await request.json();
      const measurement = await prisma.measurement.create({ data: body });
      return json({ measurement });
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }
  }
  if (request.method === "PUT") {
    try {
      const body = await request.json();
      const { id, ...data } = body;
      const measurement = await prisma.measurement.update({ where: { id: parseInt(id) }, data });
      return json({ measurement });
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }
  }
  if (request.method === "DELETE") {
    try {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");
      if (!id) return json({ error: "ID is required" }, { status: 400 });
      await prisma.measurement.delete({ where: { id: parseInt(id) } });
      return json({ success: true });
    } catch (error) {
      return json({ error: error.message }, { status: 400 });
    }
  }
  return json({ error: "Method not allowed" }, { status: 405 });
} 