"use client";

import { Trash2 } from "lucide-react";
import { deleteClient } from "@/lib/actions/clients";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { clients } from "@/db/schema";
import type { InferSelectModel } from "drizzle-orm";
import Link from "next/link";

type Client = InferSelectModel<typeof clients>;

export function ClientsTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-lg">
        <p className="text-sm text-muted-foreground">Aucun client pour l'instant.</p>
        <p className="text-xs text-muted-foreground mt-1">Créez votre premier client pour commencer.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="text-xs font-medium text-muted-foreground">Nom</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Email de contact</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Créé le</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="hover:bg-muted/30">
              <TableCell>
                <Link
                  href={`/dashboard/clients/${client.id}`}
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {client.name}
                </Link>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {client.contactEmail ?? "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(client.createdAt).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <form action={deleteClient.bind(null, client.id)}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
