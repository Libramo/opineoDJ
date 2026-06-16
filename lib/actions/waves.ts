"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { surveyWaves } from "@/db/schema";
import { auth } from "@/lib/auth";

const createWaveSchema = z.object({
  name: z.string().min(1).max(150),
  campaignId: z.string().min(1),
  waveNumber: z.coerce.number().int().positive(),
});

export async function getWavesByCampaign(campaignId: string) {
  return db
    .select()
    .from(surveyWaves)
    .where(eq(surveyWaves.campaignId, campaignId))
    .orderBy(asc(surveyWaves.waveNumber));
}

export async function createWave(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createWaveSchema.safeParse({
    name: formData.get("name"),
    campaignId: formData.get("campaignId"),
    waveNumber: formData.get("waveNumber"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { name, campaignId, waveNumber } = parsed.data;

  await db.insert(surveyWaves).values({
    id: nanoid(),
    name,
    campaignId,
    waveNumber,
  });

  revalidatePath(`/dashboard/campaigns/${campaignId}`);
}
