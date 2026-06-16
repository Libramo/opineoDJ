"use client";

import Link from "next/link";
import { Archive } from "lucide-react";
import { archiveCampaign } from "@/lib/actions/campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "archived";
  createdAt: Date;
  clientId: string;
  clientName: string;
};

export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Aucune campagne pour l'instant.</p>
        <p className="text-xs text-muted-foreground mt-1">Créez votre première campagne pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground">Campagne</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Client</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Statut</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Créée le</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id} className="hover:bg-muted/30">
              <TableCell>
                <Link
                  href={`/dashboard/campaigns/${campaign.id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {campaign.name}
                </Link>
                {campaign.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                    {campaign.description}
                  </p>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {campaign.clientName}
              </TableCell>
              <TableCell>
                <Badge
                  variant={campaign.status === "active" ? "default" : "secondary"}
                  className="text-xs rounded"
                >
                  {campaign.status === "active" ? "Active" : "Archivée"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(campaign.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                {campaign.status === "active" && (
                  <form action={archiveCampaign.bind(null, campaign.id)}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </form>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
