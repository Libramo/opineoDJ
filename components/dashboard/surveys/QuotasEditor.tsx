"use client";

import { useState, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createQuota, deleteQuota } from "@/lib/actions/quotas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InferSelectModel } from "drizzle-orm";
import type { quotas } from "@/db/schema";
import { Input } from "@/components/ui/input";

type Quota = InferSelectModel<typeof quotas>;

const demographicLabels = {
  gender: "Genre",
  age_range: "Tranche d'âge",
  region: "Région",
  profession: "Profession",
  csp: "CSP",
};

const demographicCells: Record<string, string[]> = {
  gender: ["Homme", "Femme"],
  age_range: [
    "18-24 ans",
    "25-34 ans",
    "35-49 ans",
    "50-64 ans",
    "65 ans et plus",
  ],
  region: [
    "Île-de-France",
    "Auvergne-Rhône-Alpes",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Hauts-de-France",
    "Grand Est",
    "Provence-Alpes-Côte d'Azur",
    "Pays de la Loire",
    "Normandie",
    "Bretagne",
    "Bourgogne-Franche-Comté",
    "Centre-Val de Loire",
    "Corse",
  ],
  profession: [
    "Agriculteur",
    "Artisan / Commerçant",
    "Cadre",
    "Profession intermédiaire",
    "Employé",
    "Ouvrier",
    "Retraité",
    "Sans activité",
  ],
  csp: [
    "Agriculteur",
    "Artisan / Commerçant",
    "Cadre",
    "Profession intermédiaire",
    "Employé",
    "Ouvrier",
    "Retraité",
    "Sans activité",
  ],
};

export function QuotasEditor({
  surveyId,
  quotas,
}: {
  surveyId: string;
  quotas: Quota[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [demographicKey, setDemographicKey] = useState<string>("gender");
  const [cellLabel, setCellLabel] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("surveyId", surveyId);
    formData.set("demographicKey", demographicKey);
    formData.set("cellLabel", cellLabel);
    setIsPending(true);
    try {
      await createQuota(formData);
      setOpen(false);
      formRef.current?.reset();
      setCellLabel("");
    } finally {
      setIsPending(false);
    }
  }

  // Group quotas by demographic key
  const grouped = quotas.reduce<Record<string, Quota[]>>((acc, q) => {
    if (!acc[q.demographicKey]) acc[q.demographicKey] = [];
    acc[q.demographicKey].push(q);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {quotas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucun quota défini.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Définissez des cellules démographiques cibles pour ce sondage.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([key, cells]) => {
            const total = cells.reduce((sum, c) => sum + c.targetCount, 0);
            return (
              <div
                key={key}
                className="rounded-lg border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                  <span className="text-xs font-medium text-foreground">
                    {demographicLabels[key as keyof typeof demographicLabels]}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    Total : {total}
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs text-muted-foreground">
                        Cellule
                      </TableHead>
                      <TableHead className="text-xs text-muted-foreground text-right">
                        Objectif
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cells.map((cell) => (
                      <TableRow key={cell.id}>
                        <TableCell className="text-sm">
                          {cell.cellLabel}
                        </TableCell>
                        <TableCell className="text-sm text-right font-mono">
                          {cell.targetCount}
                        </TableCell>
                        <TableCell>
                          <form
                            action={deleteQuota.bind(null, cell.id, surveyId)}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-md w-full"
          >
            <Plus className="h-4 w-4" />
            Ajouter une cellule de quota
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">
              Nouvelle cellule
            </DialogTitle>
          </DialogHeader>
          <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Critère démographique</Label>
              <Select
                value={demographicKey}
                onValueChange={(v) => {
                  setDemographicKey(v);
                  setCellLabel("");
                }}
              >
                <SelectTrigger className="rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(demographicLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Libellé de la cellule</Label>
              <Select value={cellLabel} onValueChange={setCellLabel} required>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="Sélectionner une valeur" />
                </SelectTrigger>
                <SelectContent>
                  {(demographicCells[demographicKey] ?? []).map((val) => (
                    <SelectItem key={val} value={val}>
                      {val}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetCount">Objectif (nombre de réponses)</Label>
              <Input
                id="targetCount"
                name="targetCount"
                type="number"
                min={1}
                placeholder="ex. 250"
                required
                className="rounded-md"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="rounded-md"
              >
                {isPending ? "Ajout…" : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
