"use client";

import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { CheckCircle2, ChevronRight, ChevronLeft, Send } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type QuestionOption = { id: string; text: string; order: number };

type Question = {
  id: string;
  text: string;
  type: "multiple_choice" | "rating" | "open_text" | "date" | "number";
  required: boolean;
  order: number;
  config?: {
    scaleMin?: number;
    scaleMax?: number;
    labelMin?: string;
    labelMax?: string;
  } | null;
  options: QuestionOption[];
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
};

type AnswerField = {
  optionId?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
};

type ProfileKey = "gender" | "ageRange" | "region" | "profession" | "csp";

type FormValues = {
  answers: Record<string, AnswerField | undefined>;
  profile: Record<ProfileKey, string>;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENDER_OPTIONS = ["Homme", "Femme", "Autre", "Préfère ne pas répondre"];
const AGE_RANGE_OPTIONS = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const REGION_OPTIONS = [
  "Djibouti (ville)",
  "Ali Sabieh",
  "Dikhil",
  "Tadjourah",
  "Obock",
  "Arta",
];
const PROFESSION_OPTIONS = [
  "Employé(e) du secteur public",
  "Employé(e) du secteur privé",
  "Indépendant(e) / Auto-entrepreneur",
  "Etudiant(e)",
  "Sans emploi",
  "Retraité(e)",
  "Autre",
];
const CSP_OPTIONS = [
  "Cadre supérieur / Profession libérale",
  "Cadre intermédiaire / Technicien",
  "Employé(e)",
  "Ouvrier(e)",
  "Commerçant(e) / Artisan",
  "Agriculteur(trice)",
  "Etudiant(e) / Lycéen(ne)",
  "Inactif / Retraité(e)",
];

const PROFILE_FIELDS: {
  key: ProfileKey;
  label: string;
  options: string[];
}[] = [
  { key: "gender", label: "Genre", options: GENDER_OPTIONS },
  { key: "ageRange", label: "Tranche d'âge", options: AGE_RANGE_OPTIONS },
  { key: "region", label: "Région", options: REGION_OPTIONS },
  { key: "profession", label: "Profession", options: PROFESSION_OPTIONS },
  { key: "csp", label: "Catégorie socioprofessionnelle", options: CSP_OPTIONS },
];

// ---------------------------------------------------------------------------
// Schema builder
// ---------------------------------------------------------------------------

function buildAnswerSchema(q: Question): z.ZodTypeAny {
  const base = z.object({
    optionId: z.string().nullable().optional(),
    valueText: z.string().nullable().optional(),
    valueNumber: z.number().nullable().optional(),
  });

  if (!q.required) return base.optional();

  return base.superRefine((val, ctx) => {
    if (!val) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ce champ est obligatoire." });
      return;
    }
    let valid = false;
    if (q.type === "multiple_choice") valid = !!val.optionId;
    else if (q.type === "open_text") valid = !!val.valueText?.trim();
    else if (q.type === "rating" || q.type === "number") valid = val.valueNumber != null;
    else if (q.type === "date") valid = !!val.valueText?.trim();
    if (!valid) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ce champ est obligatoire." });
    }
  });
}

function buildFormSchema(questions: Question[]) {
  const answersShape: Record<string, z.ZodTypeAny> = {};
  for (const q of questions) {
    answersShape[q.id] = buildAnswerSchema(q);
  }
  return z.object({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answers: z.object(answersShape as any),
    profile: z.object({
      gender: z.string().default(""),
      ageRange: z.string().default(""),
      region: z.string().default(""),
      profession: z.string().default(""),
      csp: z.string().default(""),
    }),
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerField | undefined;
  onChange: (v: AnswerField) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt) => {
        const selected = value?.optionId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange({ optionId: opt.id })}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {opt.text}
          </button>
        );
      })}
    </div>
  );
}

function RatingInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerField | undefined;
  onChange: (v: AnswerField) => void;
}) {
  const scaleMin = question.config?.scaleMin ?? 1;
  const scaleMax = question.config?.scaleMax ?? 10;
  const steps = Array.from(
    { length: scaleMax - scaleMin + 1 },
    (_, i) => scaleMin + i,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {steps.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ valueNumber: n })}
            className={`w-10 h-10 rounded-md border text-sm font-mono font-medium transition-colors ${
              value?.valueNumber === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {(question.config?.labelMin || question.config?.labelMax) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{question.config?.labelMin ?? ""}</span>
          <span>{question.config?.labelMax ?? ""}</span>
        </div>
      )}
    </div>
  );
}

function ProfileToggleGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              value === opt
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const reducedStepVariants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 0 },
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PublicSurveyForm({
  survey,
  questions,
}: {
  survey: Survey;
  questions: Question[];
}) {
  const prefersReduced = useReducedMotion();
  const motionVariants = prefersReduced ? reducedStepVariants : stepVariants;

  const PROFILE_STEP = questions.length;
  const DONE_STEP = questions.length + 1;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const schema = useMemo(() => buildFormSchema(questions), [questions]);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      answers: Object.fromEntries(questions.map((q) => [q.id, undefined])),
      profile: { gender: "", ageRange: "", region: "", profession: "", csp: "" },
    },
  });

  const totalSteps = questions.length + 1;
  const progress =
    step >= DONE_STEP ? 100 : Math.round((step / totalSteps) * 100);
  const currentQuestion = step < questions.length ? questions[step] : null;

  async function goNext() {
    if (currentQuestion) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valid = await form.trigger(`answers.${currentQuestion.id}` as any);
      if (!valid) return;
    }
    setDir(1);
    setStep((s) => s + 1);
  }

  function goPrev() {
    if (step === 0) return;
    setDir(-1);
    setStep((s) => s - 1);
  }

  async function onSubmit(data: FormValues) {
    setSubmitError(null);
    try {
      const answers = Object.entries(data.answers)
        .filter(([, val]) => val != null)
        .map(([questionId, val]) => ({ questionId, ...val }));

      const res = await fetch(`/api/surveys/${survey.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, profile: data.profile }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Erreur inconnue.");
      setDir(1);
      setStep(DONE_STEP);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Une erreur est survenue.",
      );
    }
  }

  // Done screen
  if (step === DONE_STEP) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 py-16 text-center"
      >
        <CheckCircle2 className="h-14 w-14 text-primary" strokeWidth={1.5} />
        <div className="flex flex-col gap-2">
          <h2 className="font-serif text-2xl text-foreground">
            Merci pour votre participation !
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Vos réponses ont bien été enregistrées. Elles contribueront à
            l&apos;analyse de cette enquête.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {step < PROFILE_STEP
              ? `Question ${step + 1} sur ${questions.length}`
              : "Votre profil"}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step content */}
      <div className="relative overflow-hidden min-h-65">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={motionVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: prefersReduced ? 0.15 : 0.3,
              ease: "easeInOut",
            }}
            className="flex flex-col gap-5"
          >
            {currentQuestion ? (
              <Controller
                name={`answers.${currentQuestion.id}` as `answers.${string}`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      <div className="flex items-start gap-2">
                        <Badge
                          variant="outline"
                          className="shrink-0 mt-0.5 font-mono text-xs"
                        >
                          {step + 1}
                        </Badge>
                        <span className="text-base font-medium text-foreground leading-snug">
                          {currentQuestion.text}
                          {currentQuestion.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </span>
                      </div>
                    </FieldLabel>

                    {currentQuestion.type === "multiple_choice" && (
                      <MultipleChoiceInput
                        question={currentQuestion}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    {currentQuestion.type === "rating" && (
                      <RatingInput
                        question={currentQuestion}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                    {currentQuestion.type === "open_text" && (
                      <Textarea
                        id={field.name}
                        placeholder="Votre réponse..."
                        value={field.value?.valueText ?? ""}
                        onChange={(e) =>
                          field.onChange({ valueText: e.target.value })
                        }
                        aria-invalid={fieldState.invalid}
                        rows={4}
                        className="resize-none"
                      />
                    )}
                    {currentQuestion.type === "date" && (
                      <Input
                        id={field.name}
                        type="date"
                        value={field.value?.valueText ?? ""}
                        onChange={(e) =>
                          field.onChange({ valueText: e.target.value })
                        }
                        aria-invalid={fieldState.invalid}
                      />
                    )}
                    {currentQuestion.type === "number" && (
                      <Input
                        id={field.name}
                        type="number"
                        placeholder="Votre réponse..."
                        value={field.value?.valueNumber ?? ""}
                        onChange={(e) =>
                          field.onChange({
                            valueNumber:
                              e.target.value === ""
                                ? null
                                : Number(e.target.value),
                          })
                        }
                        aria-invalid={fieldState.invalid}
                      />
                    )}

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            ) : (
              /* Profile step */
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-medium text-foreground">
                    Votre profil{" "}
                    <span className="text-muted-foreground font-normal">
                      (facultatif)
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ces informations nous permettent de pondérer les résultats
                    et sont traitées de manière anonyme.
                  </p>
                </div>

                {PROFILE_FIELDS.map(({ key, label, options }) => (
                  <Controller
                    key={key}
                    name={`profile.${key}`}
                    control={form.control}
                    render={({ field }) => (
                      <ProfileToggleGroup
                        label={label}
                        options={options}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Submit error */}
      {submitError && (
        <p className="text-sm text-destructive">{submitError}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={goPrev}
          disabled={step === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>

        {step < PROFILE_STEP ? (
          <Button type="button" onClick={goNext} className="gap-1">
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="gap-1"
          >
            {form.formState.isSubmitting ? "Envoi..." : "Soumettre"}
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}
