import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, count } from "drizzle-orm";
import { render } from "react-email";
import { db } from "@/db";
import { surveys, responses, answers, respondentProfiles, user } from "@/db/schema";
import { createHash } from "crypto";
import { resend, FROM_ADDRESS } from "@/lib/email/resend";
import { SubmissionNotification } from "@/lib/email/templates/SubmissionNotification";

const answerSchema = z.object({
  questionId: z.string().min(1),
  optionId: z.string().optional().nullable(),
  valueText: z.string().optional().nullable(),
  valueNumber: z.number().optional().nullable(),
});

const profileSchema = z.object({
  gender: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  profession: z.string().optional().nullable(),
  csp: z.string().optional().nullable(),
});

const submitSchema = z.object({
  answers: z.array(answerSchema).min(1),
  profile: profileSchema.optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [survey] = await db
    .select({
      id: surveys.id,
      title: surveys.title,
      slug: surveys.slug,
      status: surveys.status,
      analystId: surveys.analystId,
    })
    .from(surveys)
    .where(eq(surveys.slug, slug));

  if (!survey) {
    return NextResponse.json(
      { success: false, error: "Sondage introuvable." },
      { status: 404 }
    );
  }

  if (survey.status !== "active") {
    return NextResponse.json(
      { success: false, error: "Ce sondage n'est plus actif." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Données invalides." },
      { status: 400 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const responseId = nanoid();

  await db.insert(responses).values({
    id: responseId,
    surveyId: survey.id,
    ipHash,
  });

  if (parsed.data.answers.length > 0) {
    await db.insert(answers).values(
      parsed.data.answers.map((a) => ({
        id: nanoid(),
        responseId,
        questionId: a.questionId,
        optionId: a.optionId ?? null,
        valueText: a.valueText ?? null,
        valueNumber: a.valueNumber ?? null,
      }))
    );
  }

  if (parsed.data.profile) {
    const p = parsed.data.profile;
    const hasProfile = Object.values(p).some((v) => v != null && v !== "");
    if (hasProfile) {
      await db.insert(respondentProfiles).values({
        id: nanoid(),
        responseId,
        gender: p.gender ?? null,
        ageRange: p.ageRange ?? null,
        region: p.region ?? null,
        profession: p.profession ?? null,
        csp: p.csp ?? null,
      });
    }
  }

  // Send email notification — fire and forget, never block the response
  void sendNotification(survey.id, survey.title, survey.slug, survey.analystId);

  return NextResponse.json({ success: true, data: { responseId } });
}

async function sendNotification(
  surveyId: string,
  surveyTitle: string,
  surveySlug: string,
  analystId: string
) {
  try {
    const [analyst] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, analystId));

    if (!analyst?.email) return;

    const notifyEmail =
      process.env.ANALYST_NOTIFY_EMAIL ?? analyst.email;

    const [{ total }] = await db
      .select({ total: count() })
      .from(responses)
      .where(eq(responses.surveyId, surveyId));

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const surveyUrl = `${origin}/survey/${surveySlug}`;

    const html = await render(
      SubmissionNotification({
        surveyTitle,
        surveyUrl,
        responseCount: total,
        submittedAt: new Date(),
      })
    );

    await resend.emails.send({
      from: FROM_ADDRESS,
      to: notifyEmail,
      subject: `Nouvelle réponse — ${surveyTitle}`,
      html,
    });
  } catch (err) {
    // Non-critical — never let email failure affect the response
    console.error("[email] sendNotification failed:", err);
  }
}
