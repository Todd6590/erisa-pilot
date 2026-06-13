import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import PageHeader from "../components/shared/PageHeader";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ agency_name: "", license_number: "", phone: "" });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      setForm({
        agency_name: u?.agency_name || "",
        license_number: u?.license_number || "",
        phone: u?.phone || "",
      });
    });
  }, []);

  const { toast } = useToast();

  const handleSave = async () => {
    await base44.auth.updateMe(form);
    toast({ title: "Settings saved" });
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your broker profile and preferences" />

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-heading">Broker Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={user?.full_name || ""} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
            <Separator />
            <div>
              <Label>Agency / Firm Name</Label>
              <Input value={form.agency_name} onChange={e => setForm(p => ({ ...p, agency_name: e.target.value }))} />
            </div>
            <div>
              <Label>License Number</Label>
              <Input value={form.license_number} onChange={e => setForm(p => ({ ...p, license_number: e.target.value }))} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}