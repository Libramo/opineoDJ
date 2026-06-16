import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getSurveyById } from "@/lib/actions/surveys";
import { getQuestionsBySurvey } from "@/lib/actions/questions";
import { getQuotasBySurvey } from "@/lib/actions/quotas";
import { getWaveById } from "@/lib/actions/surveys";
import { SurveyBuilder } from "@/components/dashboard/surveys/SurveyBuilder";

export default async function SurveyBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const survey = await getSurveyById(id);
  if (!survey) notFound();

  const wave = await getWaveById(survey.waveId);

  const [questionList, quotaList] = await Promise.all([
    getQuestionsBySurvey(id),
    getQuotasBySurvey(id),
  ]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
        <Link href="/dashboard/campaigns" className="hover:text-foreground transition-colors">
          Campagnes
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0" />
        {wave && (
          <>
            <Link
              href={`/dashboard/campaigns/${wave.campaignId}`}
              className="hover:text-foreground transition-colors"
            >
              Campagne
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
            <Link
              href={`/dashboard/campaigns/${wave.campaignId}/waves/${wave.id}`}
              className="hover:text-foreground transition-colors"
            >
              {wave.name}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </>
        )}
        <span className="text-foreground font-medium">{survey.title}</span>
      </nav>

      <SurveyBuilder
        survey={survey}
        questions={questionList}
        quotas={quotaList}
      />
    </div>
  );
}
