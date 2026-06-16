"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InferSelectModel } from "drizzle-orm";
import type { surveys } from "@/db/schema";

type Survey = InferSelectModel<typeof surveys>;

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

export function SurveysTable({ surveys }: { surveys: Survey[] }) {
  if (surveys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Aucun sondage dans cette vague.</p>
        <p className="text-xs text-muted-foreground mt-1">
          Créez votre premier sondage pour commencer.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground">Titre</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Statut</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Objectif</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Créé le</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {surveys.map((survey) => (
            <TableRow key={survey.id} className="hover:bg-muted/30">
              <TableCell>
                <Link
                  href={`/dashboard/surveys/${survey.id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {survey.title}
                </Link>
                {survey.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                    {survey.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[survey.status]} className="text-xs rounded">
                  {statusLabel[survey.status]}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground font-mono">
                {survey.targetResponses ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(survey.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/surveys/${survey.id}`}>
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
