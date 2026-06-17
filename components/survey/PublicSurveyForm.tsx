"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
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
  config?: { scaleMin?: number; scaleMax?: number; labelMin?: string; labelMax?: string } | null;
  options: QuestionOption[];
};

type Survey = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
};

type AnswerValue = {
  questionId: string;
  optionId?: string | null;
  valueText?: string | null;
  valueNumber?: number | null;
};

type Profile = {
  gender: string;
  ageRange: string;
  region: string;
  profession: string;
  csp: string;
};


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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MultipleChoiceInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {question.options.map((opt) => {
        const selected = value?.optionId === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() =>
              onChange({ questionId: question.id, optionId: opt.id })
            }
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
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  const scaleMin = question.config?.scaleMin ?? 1;
  const scaleMax = question.config?.scaleMax ?? 10;
  const labelMin = question.config?.labelMin;
  const labelMax = question.config?.labelMax;
  const steps = Array.from({ length: scaleMax - scaleMin + 1 }, (_, i) => scaleMin + i);
  const selected = value?.valueNumber;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap">
        {steps.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange({ questionId: question.id, valueNumber: n })}
            className={`w-10 h-10 rounded-md border text-sm font-mono font-medium transition-colors ${
              selected === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {(labelMin || labelMax) && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{labelMin ?? ""}</span>
          <span>{labelMax ?? ""}</span>
        </div>
      )}
    </div>
  );
}

function OpenTextInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <Textarea
      placeholder="Votre réponse..."
      value={value?.valueText ?? ""}
      onChange={(e) =>
        onChange({ questionId: question.id, valueText: e.target.value })
      }
      rows={4}
      className="resize-none"
    />
  );
}

function DateInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <Input
      type="date"
      value={value?.valueText ?? ""}
      onChange={(e) =>
        onChange({ questionId: question.id, valueText: e.target.value })
      }
    />
  );
}

function NumberInput({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  return (
    <Input
      type="number"
      placeholder="Votre réponse..."
      value={value?.valueNumber ?? ""}
      onChange={(e) =>
        onChange({
          questionId: question.id,
          valueNumber: e.target.value === "" ? null : Number(e.target.value),
        })
      }
    />
  );
}

function ProfileStep({
  profile,
  onChange,
}: {
  profile: Profile;
  onChange: (key: keyof Profile, val: string) => void;
}) {
  const select = (
    label: string,
    key: keyof Profile,
    opts: string[]
  ) => (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {opts.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(key, profile[key] === opt ? "" : opt)}
            className={`px-3 py-1.5 rounded text-sm border transition-colors ${
              profile[key] === opt
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

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Ces informations nous permettent de pondérer les résultats et sont
        traitées de manière anonyme.
      </p>
      {select("Genre", "gender", GENDER_OPTIONS)}
      {select("Tranche d'âge", "ageRange", AGE_RANGE_OPTIONS)}
      {select("Région", "region", REGION_OPTIONS)}
      {select("Profession", "profession", PROFESSION_OPTIONS)}
      {select("Catégorie socioprofessionnelle", "csp", CSP_OPTIONS)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

const reducedVariants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 0 },
};

export function PublicSurveyForm({
  survey,
  questions,
}: {
  survey: Survey;
  questions: Question[];
}) {
  const prefersReduced = useReducedMotion();
  const v = prefersReduced ? reducedVariants : variants;

  // steps: 0..n-1 = questions, n = profile, n+1 = done
  const PROFILE_STEP = questions.length;
  const DONE_STEP = questions.length + 1;

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [profile, setProfile] = useState<Profile>({
    gender: "",
    ageRange: "",
    region: "",
    profession: "",
    csp: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = questions.length + 1; // questions + profile
  const progress =
    step >= DONE_STEP ? 100 : Math.round((step / totalSteps) * 100);

  const currentQuestion = step < questions.length ? questions[step] : null;

  function isCurrentAnswered(): boolean {
    if (step >= PROFILE_STEP) return true;
    const q = questions[step];
    if (!q.required) return true;
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === "multiple_choice") return !!a.optionId;
    if (q.type === "open_text") return !!(a.valueText?.trim());
    if (q.type === "rating") return a.valueNumber != null;
    if (q.type === "date") return !!(a.valueText?.trim());
    if (q.type === "number") return a.valueNumber != null;
    return false;
  }

  function goNext() {
    if (!isCurrentAnswered()) return;
    setDir(1);
    setStep((s) => s + 1);
  }

  function goPrev() {
    if (step === 0) return;
    setDir(-1);
    setStep((s) => s - 1);
  }

  function setAnswer(v: AnswerValue) {
    setAnswers((prev) => ({ ...prev, [v.questionId]: v }));
  }

  function setProfileField(key: keyof Profile, val: string) {
    setProfile((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/surveys/${survey.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.values(answers),
          profile,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error ?? "Erreur inconnue.");
      setDir(1);
      setStep(DONE_STEP);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setSubmitting(false);
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
          <h2 className="font-serif text-2xl text-foreground">Merci pour votre participation !</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Vos réponses ont bien été enregistrées. Elles contribueront à
            l&apos;analyse de cette enquête.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
      <div className="relative overflow-hidden min-h-[260px]">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={v}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReduced ? 0.15 : 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-5"
          >
            {currentQuestion ? (
              <>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0 mt-0.5 font-mono text-xs">
                    {step + 1}
                  </Badge>
                  <p className="text-base font-medium text-foreground leading-snug">
                    {currentQuestion.text}
                    {currentQuestion.required && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </p>
                </div>

                {currentQuestion.type === "multiple_choice" && (
                  <MultipleChoiceInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={setAnswer}
                  />
                )}
                {currentQuestion.type === "rating" && (
                  <RatingInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={setAnswer}
                  />
                )}
                {currentQuestion.type === "open_text" && (
                  <OpenTextInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={setAnswer}
                  />
                )}
                {currentQuestion.type === "date" && (
                  <DateInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={setAnswer}
                  />
                )}
                {currentQuestion.type === "number" && (
                  <NumberInput
                    question={currentQuestion}
                    value={answers[currentQuestion.id]}
                    onChange={setAnswer}
                  />
                )}
              </>
            ) : (
              // Profile step
              <>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-medium text-foreground">
                    Votre profil <span className="text-muted-foreground font-normal">(facultatif)</span>
                  </h3>
                </div>
                <ProfileStep profile={profile} onChange={setProfileField} />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
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
          <Button
            onClick={goNext}
            disabled={!isCurrentAnswered()}
            className="gap-1"
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="gap-1">
            {submitting ? "Envoi..." : "Soumettre"}
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
