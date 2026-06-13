import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Building2, Mail, Phone, MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import PageHeader from "../components/shared/PageHeader";
import StatusBadge from "../components/shared/StatusBadge";
import ClientForm from "../components/clients/ClientForm";
import { Link } from "react-router-dom";

export default function Clients() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list("-created_date"),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["plans"],
    queryFn: () => base44.entities.BenefitPlan.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Client.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["clients"] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Client.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const filtered = clients.filter(c =>
    c.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.contact_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getPlanCount = (clientId) => plans.filter(p => p.client_id === clientId && p.status === "active").length;

  return (
    <div>
      <PageHeader title="Clients" description="Manage your employer clients">
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </PageHeader>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-3">
        {filtered.map(client => (
          <Card key={client.id} className="p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/clients/${client.id}`} className="font-medium text-sm hover:text-primary transition-colors truncate">
                      {client.company_name}
                    </Link>
                    <StatusBadge status={client.status} />
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    {client.contact_name && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{client.contact_name}</span>}
                    {client.total_employees && <span>{client.total_employees} employees</span>}
                    <span>{getPlanCount(client.id)} plans</span>
                    {client.ein && <span>EIN: {client.ein}</span>}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/clients/${client.id}`}><Eye className="w-4 h-4 mr-2" />View Details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setEditing(client)}>
                    <Pencil className="w-4 h-4 mr-2" />Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteMutation.mutate(client.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No clients found</p>
          </div>
        )}
      </div>

      {showForm && (
        <ClientForm open onClose={() => setShowForm(false)} onSubmit={data => createMutation.mutate(data)} />
      )}
      {editing && (
        <ClientForm open client={editing} onClose={() => setEditing(null)} onSubmit={data => updateMutation.mutate({ id: editing.id, data })} />
      )}
    </div>
  );
}