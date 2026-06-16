"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { createWave } from "@/lib/actions/waves";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateWaveDialog({
  campaignId,
  nextWaveNumber,
}: {
  campaignId: string;
  nextWaveNumber: number;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("campaignId", campaignId);
    formData.set("waveNumber", String(nextWaveNumber));
    setIsPending(true);
    try {
      await createWave(formData);
      setOpen(false);
      formRef.current?.reset();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-md">
          <Plus className="h-4 w-4" />
          Nouvelle vague
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Vague {nextWaveNumber}
          </DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de la vague</Label>
            <Input
              id="name"
              name="name"
              placeholder={`ex. Vague ${nextWaveNumber} — Juin 2026`}
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
            <Button type="submit" size="sm" disabled={isPending} className="rounded-md">
              {isPending ? "Création…" : "Créer la vague"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
