import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { db } from "@/db";
import { surveys, surveyWaves, campaigns, clients } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = { title: "Sondages — OpineoDJ" };

const statusLabel = { draft: "Brouillon", active: "Actif", closed: "Clôturé" };
const statusVariant = { draft: "secondary", active: "default", closed: "outline" } as const;

export default async function SurveysPage() {
  const rows = await db
    .select({
      id: surveys.id,
      title: surveys.title,
      status: surveys.status,
      slug: surveys.slug,
      createdAt: surveys.createdAt,
      waveName: surveyWaves.name,
      waveId: surveyWaves.id,
      campaignId: campaigns.id,
      campaignName: campaigns.name,
      clientName: clients.name,
    })
    .from(surveys)
    .innerJoin(surveyWaves, eq(surveys.waveId, surveyWaves.id))
    .innerJoin(campaigns, eq(surveyWaves.campaignId, campaigns.id))
    .innerJoin(clients, eq(campaigns.clientId, clients.id))
    .orderBy(desc(surveys.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Sondages</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {rows.length} sondage{rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucun sondage pour l'instant.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Créez un sondage depuis une vague de campagne.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-xs font-medium text-muted-foreground">Titre</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Client · Campagne</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Statut</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Créé le</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/30">
                  <TableCell>
                    <Link
                      href={`/dashboard/surveys/${s.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {s.title}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      /survey/{s.slug}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.clientName} · {s.campaignName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[s.status]} className="text-xs rounded">
                      {statusLabel[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/surveys/${s.id}`}>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
