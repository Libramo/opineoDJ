"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { surveys, surveyWaves } from "@/db/schema";
import { auth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const createSurveySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().or(z.literal("")),
  targetResponses: z.coerce.number().int().positive().optional(),
  waveId: z.string().min(1),
});

export async function getSurveysByWave(waveId: string) {
  return db.select().from(surveys).where(eq(surveys.waveId, waveId));
}

export async function getWaveById(waveId: string) {
  const rows = await db
    .select()
    .from(surveyWaves)
    .where(eq(surveyWaves.id, waveId));
  return rows[0] ?? null;
}

export async function getSurveyById(id: string) {
  const rows = await db.select().from(surveys).where(eq(surveys.id, id));
  return rows[0] ?? null;
}

export async function updateSurveyStatus(
  id: string,
  status: "draft" | "active" | "closed"
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  await db
    .update(surveys)
    .set({
      status,
      publishedAt: status === "active" ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(surveys.id, id));

  revalidatePath(`/dashboard/surveys/${id}`);
}

export async function createSurvey(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createSurveySchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    targetResponses: formData.get("targetResponses") || undefined,
    waveId: formData.get("waveId"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { title, description, targetResponses, waveId } = parsed.data;

  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${nanoid(6)}`;

  const [survey] = await db
    .insert(surveys)
    .values({
      id: nanoid(),
      title,
      description: description || null,
      targetResponses: targetResponses ?? null,
      waveId,
      analystId: session.user.id,
      slug,
    })
    .returning();

  revalidatePath(`/dashboard/surveys/${survey.id}`);
  return survey;
}
