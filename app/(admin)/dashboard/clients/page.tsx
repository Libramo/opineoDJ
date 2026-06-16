import { getClients } from "@/lib/actions/clients";
import { ClientsTable } from "@/components/dashboard/clients/ClientsTable";
import { CreateClientDialog } from "@/components/dashboard/clients/CreateClientDialog";

export const metadata = { title: "Clients — OpineoDJ" };

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Clients</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <CreateClientDialog />
      </div>
      <ClientsTable clients={clients} />
    </div>
  );
}
