"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq, asc, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { questions, questionOptions, answers } from "@/db/schema";
import { auth } from "@/lib/auth";

const questionTypeSchema = z.enum([
  "multiple_choice",
  "rating",
  "open_text",
  "date",
  "number",
]);

const createQuestionSchema = z.object({
  surveyId: z.string().min(1),
  text: z.string().min(1).max(500),
  type: questionTypeSchema,
  required: z.coerce.boolean().default(true),
  order: z.coerce.number().int().nonnegative(),
});

export async function getQuestionsBySurvey(surveyId: string) {
  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.surveyId, surveyId))
    .orderBy(asc(questions.order));

  const allOptions = await Promise.all(
    qs.map((q) =>
      db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, q.id))
        .orderBy(asc(questionOptions.order))
    )
  );

  return qs.map((q, i) => ({ ...q, options: allOptions[i] }));
}

export async function createQuestion(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const parsed = createQuestionSchema.safeParse({
    surveyId: formData.get("surveyId"),
    text: formData.get("text"),
    type: formData.get("type"),
    required: formData.get("required") ?? true,
    order: formData.get("order"),
  });

  if (!parsed.success) throw new Error("Données invalides");

  const { surveyId, text, type, required, order } = parsed.data;

  const config =
    type === "rating"
      ? {
          scaleMin: Number(formData.get("scaleMin") ?? 1),
          scaleMax: Number(formData.get("scaleMax") ?? 10),
          labelMin: (formData.get("labelMin") as string) || undefined,
          labelMax: (formData.get("labelMax") as string) || undefined,
        }
      : null;

  const [question] = await db
    .insert(questions)
    .values({ id: nanoid(), surveyId, text, type, required, order, config })
    .returning();

  // If multiple choice, parse options from formData
  if (type === "multiple_choice") {
    const raw = formData.get("options");
    if (raw && typeof raw === "string") {
      const opts = raw
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean);

      if (opts.length > 0) {
        await db.insert(questionOptions).values(
          opts.map((text, i) => ({
            id: nanoid(),
            questionId: question.id,
            text,
            order: i,
          }))
        );
      }
    }
  }

  revalidatePath(`/dashboard/surveys/${surveyId}`);
}

export async function updateQuestion(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const id = formData.get("id") as string;
  const surveyId = formData.get("surveyId") as string;
  const text = formData.get("text") as string;
  const type = formData.get("type") as string;

  if (!id || !surveyId || !text) throw new Error("Données invalides");

  const config =
    type === "rating"
      ? {
          scaleMin: Number(formData.get("scaleMin") ?? 1),
          scaleMax: Number(formData.get("scaleMax") ?? 10),
          labelMin: (formData.get("labelMin") as string) || undefined,
          labelMax: (formData.get("labelMax") as string) || undefined,
        }
      : null;

  await db.update(questions).set({ text, config }).where(eq(questions.id, id));

  // If multiple choice, sync options without deleting ones that have answers
  if (type === "multiple_choice") {
    const raw = formData.get("options");
    if (raw && typeof raw === "string") {
      const newTexts = raw.split("\n").map((o) => o.trim()).filter(Boolean);

      // Get existing options in order
      const existing = await db
        .select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, id))
        .orderBy(asc(questionOptions.order));

      // Find which existing options are referenced by answers (cannot delete)
      const existingIds = existing.map((o) => o.id);
      const referenced = existingIds.length > 0
        ? await db
            .select({ optionId: answers.optionId })
            .from(answers)
            .where(inArray(answers.optionId, existingIds))
        : [];
      const referencedIds = new Set(referenced.map((r) => r.optionId));

      // Update existing options in place (by position)
      for (let i = 0; i < Math.min(newTexts.length, existing.length); i++) {
        await db
          .update(questionOptions)
          .set({ text: newTexts[i], order: i })
          .where(eq(questionOptions.id, existing[i].id));
      }

      // Insert new options beyond existing count
      if (newTexts.length > existing.length) {
        await db.insert(questionOptions).values(
          newTexts.slice(existing.length).map((text, i) => ({
            id: nanoid(),
            questionId: id,
            text,
            order: existing.length + i,
          }))
        );
      }

      // Delete options that were removed AND have no answers
      if (existing.length > newTexts.length) {
        const toRemove = existing
          .slice(newTexts.length)
          .filter((o) => !referencedIds.has(o.id))
          .map((o) => o.id);
        if (toRemove.length > 0) {
          await db
            .delete(questionOptions)
            .where(inArray(questionOptions.id, toRemove));
        }
      }
    }
  }

  revalidatePath(`/dashboard/surveys/${surveyId}`);
}

export async function deleteQuestion(id: string, surveyId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  await db.delete(questions).where(eq(questions.id, id));
  revalidatePath(`/dashboard/surveys/${surveyId}`);
}

export async function reorderQuestions(surveyId: string, orderedIds: string[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  // No revalidatePath — client state is already updated optimistically.
  // Order is persisted to DB and will be correct on next full page load.
  await Promise.all(
    orderedIds.map((id, i) =>
      db.update(questions).set({ order: i }).where(eq(questions.id, id))
    )
  );
}
