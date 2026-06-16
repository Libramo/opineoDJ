"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createSurvey } from "@/lib/actions/surveys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateSurveyDialog({ waveId }: { waveId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("waveId", waveId);
    setIsPending(true);
    try {
      const survey = await createSurvey(formData);
      setOpen(false);
      router.push(`/dashboard/surveys/${survey.id}`);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-md">
          <Plus className="h-4 w-4" />
          Nouveau sondage
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nouveau sondage</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titre du sondage</Label>
            <Input
              id="title"
              name="title"
              placeholder="ex. Intentions de vote — Juin 2026"
              required
              className="rounded-md"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description{" "}
              <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Contexte, objectifs…"
              rows={3}
              className="rounded-md resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetResponses">
              Objectif de réponses{" "}
              <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Input
              id="targetResponses"
              name="targetResponses"
              type="number"
              min={1}
              placeholder="ex. 1000"
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
              {isPending ? "Création…" : "Créer le sondage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
