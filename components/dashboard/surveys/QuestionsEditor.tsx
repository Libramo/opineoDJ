"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, GripVertical, Pencil } from "lucide-react";
import { createQuestion, deleteQuestion, updateQuestion } from "@/lib/actions/questions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const typeLabels = {
  multiple_choice: "Choix multiple",
  rating: "Échelle / Note",
  open_text: "Texte libre",
  date: "Date",
  number: "Nombre",
};

type Question = {
  id: string;
  surveyId: string;
  text: string;
  type: "multiple_choice" | "rating" | "open_text" | "date" | "number";
  order: number;
  required: boolean;
  createdAt: Date;
  options: { id: string; questionId: string; text: string; order: number }[];
};

function EditQuestionDialog({
  question,
  surveyId,
}: {
  question: Question;
  surveyId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("id", question.id);
    formData.set("surveyId", surveyId);
    formData.set("type", question.type);
    setIsPending(true);
    try {
      await updateQuestion(formData);
      setOpen(false);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Modifier la question</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="text">Texte de la question</Label>
            <Textarea
              id="text"
              name="text"
              defaultValue={question.text}
              rows={2}
              required
              className="rounded-md resize-none"
            />
          </div>
          {question.type === "multiple_choice" && (
            <div className="space-y-1.5">
              <Label htmlFor="options">
                Options{" "}
                <span className="text-muted-foreground">(une par ligne)</span>
              </Label>
              <Textarea
                id="options"
                name="options"
                defaultValue={question.options.map((o) => o.text).join("\n")}
                rows={4}
                className="rounded-md resize-none font-mono text-sm"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="rounded-md">
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function QuestionsEditor({
  surveyId,
  questions,
}: {
  surveyId: string;
  questions: Question[];
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [type, setType] = useState<string>("multiple_choice");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    formData.set("surveyId", surveyId);
    formData.set("type", type);
    formData.set("order", String(questions.length));
    setIsPending(true);
    try {
      await createQuestion(formData);
      setOpen(false);
      formRef.current?.reset();
      setType("multiple_choice");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucune question pour l'instant.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Ajoutez votre première question ci-dessous.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground">Q{i + 1}</span>
                  <Badge variant="secondary" className="text-xs rounded">
                    {typeLabels[q.type]}
                  </Badge>
                  {q.required && (
                    <Badge variant="outline" className="text-xs rounded">
                      Obligatoire
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-foreground mt-1">{q.text}</p>
                {q.options.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {q.options.map((opt) => (
                      <li key={opt.id} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                        {opt.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <EditQuestionDialog question={q} surveyId={surveyId} />
                <form action={deleteQuestion.bind(null, q.id, surveyId)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 rounded-md w-full">
            <Plus className="h-4 w-4" />
            Ajouter une question
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Nouvelle question</DialogTitle>
          </DialogHeader>
          <form ref={formRef} action={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label>Type de question</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="rounded-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="text">Texte de la question</Label>
              <Textarea
                id="text"
                name="text"
                placeholder="ex. Quel est votre parti politique préféré ?"
                rows={2}
                required
                className="rounded-md resize-none"
              />
            </div>
            {type === "multiple_choice" && (
              <div className="space-y-1.5">
                <Label htmlFor="options">
                  Options{" "}
                  <span className="text-muted-foreground">(une par ligne)</span>
                </Label>
                <Textarea
                  id="options"
                  name="options"
                  placeholder={"Parti A\nParti B\nParti C\nSans préférence"}
                  rows={4}
                  className="rounded-md resize-none font-mono text-sm"
                />
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="rounded-md">
                {isPending ? "Ajout…" : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
