import { notFound } from "next/navigation";
import { eq, asc } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { surveys, questions, questionOptions } from "@/db/schema";
import { PublicSurveyForm } from "@/components/survey/PublicSurveyForm";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [survey] = await db
    .select({ title: surveys.title, description: surveys.description })
    .from(surveys)
    .where(eq(surveys.slug, slug));

  if (!survey) return { title: "Sondage introuvable — OpineoDJ" };

  return {
    title: `${survey.title} — OpineoDJ`,
    description: survey.description ?? "Participez à ce sondage OpineoDJ.",
  };
}

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;

  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.slug, slug));

  if (!survey) notFound();

  if (survey.status !== "active") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center flex flex-col gap-4">
          <h1 className="font-serif text-2xl text-foreground">{survey.title}</h1>
          <p className="text-sm text-muted-foreground">
            {survey.status === "draft"
              ? "Ce sondage n'est pas encore ouvert."
              : "Ce sondage est maintenant fermé. Merci de votre intérêt."}
          </p>
        </div>
      </main>
    );
  }

  const qs = await db
    .select()
    .from(questions)
    .where(eq(questions.surveyId, survey.id))
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

  const questionsWithOptions = qs.map((q, i) => ({
    ...q,
    options: allOptions[i],
  }));

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-start py-12 px-6">
      <div className="w-full max-w-[680px] flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground tracking-widest uppercase font-mono">
            OpineoDJ · BlyAnalytics
          </p>
          <h1 className="font-serif text-3xl text-foreground leading-tight">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {survey.description}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Form */}
        <PublicSurveyForm
          survey={{
            id: survey.id,
            title: survey.title,
            description: survey.description,
            slug: survey.slug,
          }}
          questions={questionsWithOptions}
        />

        {/* Footer */}
        <div className="border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            L&apos;analyse qui compte. — OpineoDJ by BlyAnalytics
          </p>
        </div>
      </div>
    </main>
  );
}
