import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCampaignById } from "@/lib/actions/campaigns";
import { getWaveById, getSurveysByWave } from "@/lib/actions/surveys";
import { SurveysTable } from "@/components/dashboard/surveys/SurveysTable";
import { CreateSurveyDialog } from "@/components/dashboard/surveys/CreateSurveyDialog";

export default async function WaveDetailPage({
  params,
}: {
  params: Promise<{ id: string; waveId: string }>;
}) {
  const { id, waveId } = await params;
  const [campaign, wave, surveys] = await Promise.all([
    getCampaignById(id),
    getWaveById(waveId),
    getSurveysByWave(waveId),
  ]);

  if (!campaign || !wave) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard/campaigns" className="hover:text-foreground transition-colors">
          Campagnes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href={`/dashboard/campaigns/${id}`}
          className="hover:text-foreground transition-colors"
        >
          {campaign.name}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{wave.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{wave.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {campaign.name} · {surveys.length} sondage{surveys.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateSurveyDialog waveId={waveId} />
      </div>

      <SurveysTable surveys={surveys} />
    </div>
  );
}
