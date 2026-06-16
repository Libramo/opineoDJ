import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCampaignById } from "@/lib/actions/campaigns";
import { getWavesByCampaign } from "@/lib/actions/waves";
import { WavesTable } from "@/components/dashboard/waves/WavesTable";
import { CreateWaveDialog } from "@/components/dashboard/waves/CreateWaveDialog";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [campaign, waves] = await Promise.all([
    getCampaignById(id),
    getWavesByCampaign(id),
  ]);

  if (!campaign) notFound();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/dashboard/campaigns" className="hover:text-foreground transition-colors">
          Campagnes
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{campaign.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{campaign.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {campaign.clientName} · {waves.length} vague{waves.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateWaveDialog campaignId={id} nextWaveNumber={waves.length + 1} />
      </div>

      <WavesTable waves={waves} campaignId={id} />
    </div>
  );
}
