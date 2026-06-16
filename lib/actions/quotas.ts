"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { quotas } from "@/db/schema";
import { auth } from "@/lib/auth";

const demographicKeySchema = z.enum([
  "gender",
  "age_range",
  "region",
  "profession",
  "csp",
]);

const createQuotaSchema = z.object({
  surveyId: z.string().min(1),
  demographicKey: demographicKeySchema,
  cellLabel: z.string().min(1).max(100),
  targetCount: z.coerce.number().int().positive(),
});

export async function getQuotasBySurvey(surveyId: string) {
  return db.select().from(quotas).where(eq(quotas.surveyId, surveyId));
}

export async function createQuota(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createQuotaSchema.safeParse({
    surveyId: formData.get("surveyId"),
    demographicKey: formData.get("demographicKey"),
    cellLabel: formData.get("cellLabel"),
    targetCount: formData.get("targetCount"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { surveyId, demographicKey, cellLabel, targetCount } = parsed.data;

  await db.insert(quotas).values({
    id: nanoid(),
    surveyId,
    demographicKey,
    cellLabel,
    targetCount,
  });

  revalidatePath(`/dashboard/surveys/${surveyId}`);
}

export async function deleteQuota(id: string, surveyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  await db.delete(quotas).where(eq(quotas.id, id));
  revalidatePath(`/dashboard/surveys/${surveyId}`);
}
