import { getCampaigns } from "@/lib/actions/campaigns";
import { getClients } from "@/lib/actions/clients";
import { CampaignsTable } from "@/components/dashboard/campaigns/CampaignsTable";
import { CreateCampaignDialog } from "@/components/dashboard/campaigns/CreateCampaignDialog";

export const metadata = { title: "Campagnes — OpineoDJ" };

export default async function CampaignsPage() {
  const [campaigns, clients] = await Promise.all([getCampaigns(), getClients()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Campagnes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {campaigns.length} campagne{campaigns.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateCampaignDialog clients={clients} />
      </div>
      <CampaignsTable campaigns={campaigns} />
    </div>
  );
}
