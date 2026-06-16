"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuestionsEditor } from "./QuestionsEditor";
import { QuotasEditor } from "./QuotasEditor";
import { SurveySettings } from "./SurveySettings";
import type { InferSelectModel } from "drizzle-orm";
import type { surveys, quotas } from "@/db/schema";

type Survey = InferSelectModel<typeof surveys>;
type Quota = InferSelectModel<typeof quotas>;
type Question = {
  id: string;
  surveyId: string;
  text: string;
  type: "multiple_choice" | "rating" | "open_text" | "date" | "number";
  order: number;
  required: boolean;
  createdAt: Date;
  options: { id: string; questionId: string; text: string; order: number }[];
};

const statusLabel: Record<Survey["status"], string> = {
  draft: "Brouillon",
  active: "Actif",
  closed: "Clôturé",
};

const statusVariant: Record<Survey["status"], "secondary" | "default" | "outline"> = {
  draft: "secondary",
  active: "default",
  closed: "outline",
};

export function SurveyBuilder({
  survey,
  questions,
  quotas,
}: {
  survey: Survey;
  questions: Question[];
  quotas: Quota[];
}) {
  return (
    <div className="space-y-4">
      {/* Survey header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">{survey.title}</h1>
            <Badge variant={statusVariant[survey.status]} className="text-xs rounded">
              {statusLabel[survey.status]}
            </Badge>
          </div>
          {survey.description && (
            <p className="text-sm text-muted-foreground mt-0.5">{survey.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            /survey/{survey.slug}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="questions">
        <TabsList className="rounded-md">
          <TabsTrigger value="questions" className="rounded-md text-sm">
            Questions{" "}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {questions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="quotas" className="rounded-md text-sm">
            Quotas{" "}
            <span className="ml-1.5 text-xs text-muted-foreground">
              {quotas.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-md text-sm">
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-4">
          <QuestionsEditor surveyId={survey.id} questions={questions} />
        </TabsContent>

        <TabsContent value="quotas" className="mt-4">
          <QuotasEditor surveyId={survey.id} quotas={quotas} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SurveySettings survey={survey} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
