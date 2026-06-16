"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { campaigns, clients } from "@/db/schema";
import { auth } from "@/lib/auth";

const createCampaignSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(500).optional().or(z.literal("")),
  clientId: z.string().min(1),
});

export async function getCampaigns() {
  return db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      clientId: campaigns.clientId,
      clientName: clients.name,
    })
    .from(campaigns)
    .innerJoin(clients, eq(campaigns.clientId, clients.id))
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: string) {
  const rows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      clientId: campaigns.clientId,
      clientName: clients.name,
    })
    .from(campaigns)
    .innerJoin(clients, eq(campaigns.clientId, clients.id))
    .where(eq(campaigns.id, id));

  return rows[0] ?? null;
}

export async function createCampaign(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createCampaignSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    clientId: formData.get("clientId"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { name, description, clientId } = parsed.data;

  await db.insert(campaigns).values({
    id: nanoid(),
    name,
    description: description || null,
    clientId,
    createdBy: session.user.id,
  });

  revalidatePath("/dashboard/campaigns");
}

export async function archiveCampaign(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  await db
    .update(campaigns)
    .set({ status: "archived" })
    .where(eq(campaigns.id, id));

  revalidatePath("/dashboard/campaigns");
}
