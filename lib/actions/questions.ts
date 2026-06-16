"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { questions, questionOptions } from "@/db/schema";
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

  const [question] = await db
    .insert(questions)
    .values({ id: nanoid(), surveyId, text, type, required, order })
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

  await db.update(questions).set({ text }).where(eq(questions.id, id));

  // If multiple choice, replace options
  if (type === "multiple_choice") {
    const raw = formData.get("options");
    if (raw && typeof raw === "string") {
      await db.delete(questionOptions).where(eq(questionOptions.questionId, id));
      const opts = raw.split("\n").map((o) => o.trim()).filter(Boolean);
      if (opts.length > 0) {
        await db.insert(questionOptions).values(
          opts.map((text, i) => ({ id: nanoid(), questionId: id, text, order: i }))
        );
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
