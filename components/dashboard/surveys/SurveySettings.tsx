"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Copy, Check } from "lucide-react";
import { updateSurveyStatus } from "@/lib/actions/surveys";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { InferSelectModel } from "drizzle-orm";
import type { surveys } from "@/db/schema";

type Survey = InferSelectModel<typeof surveys>;

export function SurveySettings({ survey }: { survey: Survey }) {
  const [isPending, setIsPending] = useState(false);
  const [copied, setCopied] = useState(false);

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

  function handleCopy() {
    navigator.clipboard.writeText(`${origin}/survey/${survey.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStatusChange(status: "active" | "closed" | "draft") {
    setIsPending(true);
    try {
      await updateSurveyStatus(survey.id, status);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      {/* Survey info */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h2 className="text-sm font-medium text-foreground">Informations</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Titre</span>
            <span className="text-foreground font-medium">{survey.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug public</span>
            <span className="text-foreground font-mono text-xs">{survey.slug}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Objectif</span>
            <span className="text-foreground font-mono">
              {survey.targetResponses ?? "—"}
            </span>
          </div>
          {survey.publishedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Publié le</span>
              <span className="text-foreground">
                {new Date(survey.publishedAt).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator />

      {/* Status actions */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Statut du sondage</h2>

        {survey.status === "draft" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Publiez le sondage pour rendre le formulaire public et commencer la collecte.
            </p>
            <Button
              size="sm"
              className="rounded-md"
              disabled={isPending}
              onClick={() => handleStatusChange("active")}
            >
              {isPending ? "Publication…" : "Publier le sondage"}
            </Button>
          </div>
        )}

        {survey.status === "active" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Le sondage est actif. Clôturez-le pour arrêter la collecte de réponses.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-md"
                disabled={isPending}
                onClick={() => handleStatusChange("closed")}
              >
                {isPending ? "Clôture…" : "Clôturer le sondage"}
              </Button>
            </div>
          </div>
        )}

        {survey.status === "closed" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Ce sondage est clôturé. La collecte de réponses est terminée.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="rounded-md"
              disabled={isPending}
              onClick={() => handleStatusChange("active")}
            >
              {isPending ? "Réouverture…" : "Réouvrir le sondage"}
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Public URL */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-foreground">Lien public</h2>
        <p className="text-xs text-muted-foreground">
          Partagez ce lien avec vos répondants.
        </p>
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted border border-border">
          <span className="text-xs font-mono text-foreground flex-1 truncate">
            {origin}/survey/{survey.slug}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-6 px-2 rounded"
            onClick={handleCopy}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1 text-primary"
                >
                  <Check className="h-3 w-3" />
                  Copié
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  Copier
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </div>
  );
}
