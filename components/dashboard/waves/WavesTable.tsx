"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { InferSelectModel } from "drizzle-orm";
import type { surveyWaves } from "@/db/schema";

type Wave = InferSelectModel<typeof surveyWaves>;

export function WavesTable({ waves, campaignId }: { waves: Wave[]; campaignId: string }) {
  if (waves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Aucune vague pour cette campagne.</p>
        <p className="text-xs text-muted-foreground mt-1">Créez la première vague pour commencer la collecte.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground w-16">Vague</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Nom</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Créée le</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {waves.map((wave) => (
            <TableRow key={wave.id} className="hover:bg-muted/30">
              <TableCell>
                <Badge variant="secondary" className="text-xs rounded font-mono">
                  V{wave.waveNumber}
                </Badge>
              </TableCell>
              <TableCell>
                <Link
                  href={`/dashboard/campaigns/${campaignId}/waves/${wave.id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {wave.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(wave.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/campaigns/${campaignId}/waves/${wave.id}`}>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
