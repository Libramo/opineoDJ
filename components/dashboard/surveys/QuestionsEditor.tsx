"use client";

import { useState, useRef } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { move } from "@dnd-kit/helpers";
import { Plus, Trash2, GripVertical, Pencil, X, AlertCircle } from "lucide-react";
import { createQuestion, deleteQuestion, updateQuestion } from "@/lib/actions/questions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

const typeLabels: Record<string, string> = {
  multiple_choice: "Choix multiple",
  rating: "Échelle de notation",
  open_text: "Texte libre",
  date: "Date",
  number: "Nombre",
};

const typeDescriptions: Record<string, string> = {
  multiple_choice: "Le répondant choisit parmi une liste d'options.",
  rating: "Le répondant attribue une note de 1 à 10.",
  open_text: "Le répondant saisit une réponse libre.",
  date: "Le répondant sélectionne une date.",
  number: "Le répondant saisit une valeur numérique.",
};

type QuestionOption = { id: string; questionId: string; text: string; order: number };

type Question = {
  id: string;
  surveyId: string;
  text: string;
  type: "multiple_choice" | "rating" | "open_text" | "date" | "number";
  order: number;
  required: boolean;
  config?: { scaleMin?: number; scaleMax?: number; labelMin?: string; labelMax?: string } | null;
  createdAt: Date;
  options: QuestionOption[];
};

// ---------------------------------------------------------------------------
// Options builder
// ---------------------------------------------------------------------------

function OptionsBuilder({ value, onChange }: { value: string[]; onChange: (opts: string[]) => void }) {
  function update(i: number, val: string) {
    const next = [...value];
    next[i] = val;
    onChange(next);
  }
  function remove(i: number) { onChange(value.filter((_, idx) => idx !== i)); }
  function add() { onChange([...value, ""]); }

  return (
    <div className="space-y-2">
      {value.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
          <Input
            value={opt}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`Option ${i + 1}`}
            className="rounded-md h-8 text-sm"
            autoFocus={i === value.length - 1 && i > 0}
          />
          <Button
            type="button" variant="ghost" size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => remove(i)}
            disabled={value.length <= 1}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5 rounded-md text-xs h-8 mt-1" onClick={add}>
        <Plus className="h-3.5 w-3.5" />
        Ajouter une option
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rating config
// ---------------------------------------------------------------------------

type RatingConfig = { scaleMin: number; scaleMax: number; labelMin: string; labelMax: string };

function RatingConfig({ value, onChange }: { value: RatingConfig; onChange: (v: RatingConfig) => void }) {
  const steps = Math.min(Math.max(value.scaleMax - value.scaleMin + 1, 2), 20);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="space-y-1.5 w-24">
          <Label>Min</Label>
          <Input
            type="number" min={0} max={value.scaleMax - 1}
            value={value.scaleMin}
            onChange={(e) => onChange({ ...value, scaleMin: Number(e.target.value) })}
            className="rounded-md h-8 text-sm font-mono"
          />
        </div>
        <div className="space-y-1.5 w-24">
          <Label>Max</Label>
          <Input
            type="number" min={value.scaleMin + 1} max={20}
            value={value.scaleMax}
            onChange={(e) => onChange({ ...value, scaleMax: Number(e.target.value) })}
            className="rounded-md h-8 text-sm font-mono"
          />
        </div>
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: steps }, (_, i) => value.scaleMin + i).map((n) => (
          <div key={n} className="w-8 h-8 rounded-md border border-border bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground">
            {n}
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1.5">
          <Label>Libellé min <span className="text-muted-foreground">(optionnel)</span></Label>
          <Input
            value={value.labelMin}
            onChange={(e) => onChange({ ...value, labelMin: e.target.value })}
            placeholder="ex. Pas du tout d'accord"
            className="rounded-md h-8 text-sm"
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label>Libellé max <span className="text-muted-foreground">(optionnel)</span></Label>
          <Input
            value={value.labelMax}
            onChange={(e) => onChange({ ...value, labelMax: e.target.value })}
            placeholder="ex. Tout à fait d'accord"
            className="rounded-md h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Create dialog
// ---------------------------------------------------------------------------

function CreateQuestionDialog({ surveyId, questionCount }: { surveyId: string; questionCount: number }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [type, setType] = useState("multiple_choice");
  const [required, setRequired] = useState(true);
  const [options, setOptions] = useState(["", "", ""]);
  const [text, setText] = useState("");
  const [ratingConfig, setRatingConfig] = useState<RatingConfig>({ scaleMin: 1, scaleMax: 10, labelMin: "", labelMax: "" });
  const formRef = useRef<HTMLFormElement>(null);

  function reset() {
    setText(""); setType("multiple_choice"); setRequired(true);
    setOptions(["", "", ""]);
    setRatingConfig({ scaleMin: 1, scaleMax: 10, labelMin: "", labelMax: "" });
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("surveyId", surveyId);
    fd.set("type", type);
    fd.set("order", String(questionCount));
    fd.set("text", text);
    fd.set("required", String(required));
    if (type === "multiple_choice") fd.set("options", options.filter((o) => o.trim()).join("\n"));
    if (type === "rating") {
      fd.set("scaleMin", String(ratingConfig.scaleMin));
      fd.set("scaleMax", String(ratingConfig.scaleMax));
      fd.set("labelMin", ratingConfig.labelMin);
      fd.set("labelMax", ratingConfig.labelMax);
    }
    setIsPending(true);
    try { await createQuestion(fd); setOpen(false); reset(); }
    finally { setIsPending(false); }
  }

  const canSubmit = text.trim().length > 0 &&
    (type !== "multiple_choice" || options.filter((o) => o.trim()).length >= 2);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
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
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label>Type de question</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="rounded-md"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{typeDescriptions[type]}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="create-text">Intitulé de la question</Label>
            <Textarea id="create-text" value={text} onChange={(e) => setText(e.target.value)}
              placeholder="ex. Quel est votre parti politique préféré ?" rows={2} required
              className="rounded-md resize-none" />
          </div>
          {type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Options de réponse</Label>
              {options.filter((o) => o.trim()).length < 2 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Minimum 2 options requises
                </div>
              )}
              <OptionsBuilder value={options} onChange={setOptions} />
            </div>
          )}
          {type === "rating" && (
            <div className="space-y-2">
              <Label>Configuration de l'échelle</Label>
              <RatingConfig value={ratingConfig} onChange={setRatingConfig} />
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Réponse obligatoire</p>
              <p className="text-xs text-muted-foreground">Le répondant devra répondre à cette question.</p>
            </div>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={isPending || !canSubmit} className="rounded-md">
              {isPending ? "Ajout…" : "Ajouter la question"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Edit dialog
// ---------------------------------------------------------------------------

function EditQuestionDialog({ question, surveyId }: { question: Question; surveyId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [text, setText] = useState(question.text);
  const [options, setOptions] = useState<string[]>(
    question.options.length > 0 ? question.options.map((o) => o.text) : ["", ""]
  );
  const [ratingConfig, setRatingConfig] = useState<RatingConfig>({
    scaleMin: question.config?.scaleMin ?? 1,
    scaleMax: question.config?.scaleMax ?? 10,
    labelMin: question.config?.labelMin ?? "",
    labelMax: question.config?.labelMax ?? "",
  });

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("id", question.id);
    fd.set("surveyId", surveyId);
    fd.set("type", question.type);
    fd.set("text", text);
    if (question.type === "multiple_choice") fd.set("options", options.filter((o) => o.trim()).join("\n"));
    if (question.type === "rating") {
      fd.set("scaleMin", String(ratingConfig.scaleMin));
      fd.set("scaleMax", String(ratingConfig.scaleMax));
      fd.set("labelMin", ratingConfig.labelMin);
      fd.set("labelMax", ratingConfig.labelMax);
    }
    setIsPending(true);
    try { await updateQuestion(fd); setOpen(false); }
    finally { setIsPending(false); }
  }

  const canSubmit = text.trim().length > 0 &&
    (question.type !== "multiple_choice" || options.filter((o) => o.trim()).length >= 2);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Modifier la question</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded text-xs">{typeLabels[question.type]}</Badge>
              <span className="text-xs text-muted-foreground">Le type ne peut pas être modifié après création.</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-text">Intitulé de la question</Label>
            <Textarea id="edit-text" value={text} onChange={(e) => setText(e.target.value)}
              rows={2} required className="rounded-md resize-none" />
          </div>
          {question.type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Options de réponse</Label>
              {options.filter((o) => o.trim()).length < 2 && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Minimum 2 options requises
                </div>
              )}
              <OptionsBuilder value={options} onChange={setOptions} />
            </div>
          )}
          {question.type === "rating" && (
            <div className="space-y-2">
              <Label>Configuration de l'échelle</Label>
              <RatingConfig value={ratingConfig} onChange={setRatingConfig} />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={isPending || !canSubmit} className="rounded-md">
              {isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Sortable question row
// ---------------------------------------------------------------------------

function SortableQuestion({
  question,
  index,
  surveyId,
}: {
  question: Question;
  index: number;
  surveyId: string;
}) {
  const { ref, handleRef, isDragSource } = useSortable({ id: question.id, index });

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 p-4 rounded-lg border border-border bg-card transition-all group ${
        isDragSource ? "opacity-40" : "hover:bg-muted/20"
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        aria-label="Réorganiser"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-xs font-mono text-muted-foreground">Q{index + 1}</span>
          <Badge variant="secondary" className="text-xs rounded">{typeLabels[question.type]}</Badge>
          {!question.required && (
            <Badge variant="outline" className="text-xs rounded text-muted-foreground">Facultatif</Badge>
          )}
        </div>
        <p className="text-sm text-foreground">{question.text}</p>
        {question.options.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {question.options.map((opt) => (
              <span key={opt.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground border border-border">
                {opt.text}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <EditQuestionDialog question={question} surveyId={surveyId} />
        <form action={deleteQuestion.bind(null, question.id, surveyId)}>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function QuestionsEditor({ surveyId, questions: initialQuestions }: { surveyId: string; questions: Question[] }) {
  const [items, setItems] = useState(initialQuestions);

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
          <p className="text-sm text-muted-foreground">Aucune question pour l'instant.</p>
          <p className="text-xs text-muted-foreground mt-1">Ajoutez votre première question ci-dessous.</p>
        </div>
      ) : (
        <DragDropProvider
          onDragOver={(event) => setItems((prev) => move(prev, event))}
          onDragEnd={(event) => {
            if (event.canceled) {
              setItems(initialQuestions);
              return;
            }
            const orderedIds = items.map((q) => q.id);
            fetch("/api/questions/reorder", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderedIds }),
            })
              .then((res) => { if (!res.ok) setItems(initialQuestions); })
              .catch(() => setItems(initialQuestions));
          }}
        >
          <div className="space-y-2">
            {items.map((q, i) => (
              <SortableQuestion key={q.id} question={q} index={i} surveyId={surveyId} />
            ))}
          </div>
        </DragDropProvider>
      )}

      <CreateQuestionDialog surveyId={surveyId} questionCount={items.length} />
    </div>
  );
}
