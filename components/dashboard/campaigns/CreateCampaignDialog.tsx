"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { createCampaign } from "@/lib/actions/campaigns";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InferSelectModel } from "drizzle-orm";
import type { clients } from "@/db/schema";

type Client = InferSelectModel<typeof clients>;

export function CreateCampaignDialog({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [clientId, setClientId] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("clientId", clientId);
    setIsPending(true);
    try {
      await createCampaign(formData);
      setOpen(false);
      formRef.current?.reset();
      setClientId("");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5 rounded-md">
          <Plus className="h-4 w-4" />
          Nouvelle campagne
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Nouvelle campagne</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="clientId">Client</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger className="rounded-md">
                <SelectValue placeholder="Sélectionner un client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nom de la campagne</Label>
            <Input
              id="name"
              name="name"
              placeholder="ex. Baromètre politique 2026"
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
              placeholder="Objectifs, contexte…"
              rows={3}
              className="rounded-md resize-none"
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
              disabled={isPending || !clientId}
              className="rounded-md"
            >
              {isPending ? "Création…" : "Créer la campagne"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
