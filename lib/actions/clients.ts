"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { auth } from "@/lib/auth";

const createClientSchema = z.object({
  name: z.string().min(1).max(100),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export async function getClients() {
  return db.select().from(clients).orderBy(clients.createdAt);
}

export async function createClient(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createClientSchema.safeParse({
    name: formData.get("name"),
    contactEmail: formData.get("contactEmail"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { name, contactEmail } = parsed.data;

  await db.insert(clients).values({
    id: nanoid(),
    name,
    contactEmail: contactEmail || null,
  });

  revalidatePath("/dashboard/clients");
}

export async function deleteClient(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  await db.delete(clients).where(eq(clients.id, id));
  revalidatePath("/dashboard/clients");
}
