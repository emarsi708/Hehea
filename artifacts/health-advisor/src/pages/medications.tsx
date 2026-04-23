import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Pill, Plus, Trash2, Edit2, AlertTriangle, Search } from "lucide-react";
import { useHealthReport, useCurrentProfile, type Medication } from "@/hooks/use-health-report";
import { MED_DATABASE, findMedDef, findInteractions } from "@/lib/medications";
import { useToast } from "@/hooks/use-toast";

export default function Medications() {
  const profile = useCurrentProfile();
  const { addMedication, updateMedication, removeMedication, lastReport } = useHealthReport();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Medication | null>(null);
  const [search, setSearch] = useState("");

  const meds = profile?.medications ?? [];

  const warnings = useMemo(() => {
    if (!lastReport?.flags?.length || !meds.length) return [];
    return findInteractions(meds, lastReport.flags);
  }, [meds, lastReport]);

  const filteredDb = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MED_DATABASE.slice(0, 6);
    return MED_DATABASE.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.aliases.some(a => a.includes(q)) ||
      m.class.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const startAdd = () => {
    setEditing(null);
    setOpen(true);
  };

  const startEdit = (m: Medication) => {
    setEditing(m);
    setOpen(true);
  };

  const handleSave = (data: Omit<Medication, "id">) => {
    if (!data.name.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMedication(editing.id, data);
      toast({ title: "Medication updated" });
    } else {
      addMedication(data);
      toast({ title: "Medication added" });
    }
    setOpen(false);
    setEditing(null);
  };

  const quickAdd = (name: string) => {
    addMedication({ name });
    toast({ title: `${name.split(" ")[0]} added` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Pill className="h-7 w-7 text-primary" />
              Medications & Supplements
            </h1>
            <p className="text-muted-foreground mt-1">
              Track what {profile?.name ?? "you"} take. We'll warn you about lab interactions.
            </p>
          </div>
          <Button onClick={startAdd} data-testid="button-add-med">
            <Plus className="h-4 w-4 mr-2" />
            Add Medication
          </Button>
        </div>

        {/* Lab interaction warnings */}
        {warnings.length > 0 && (
          <Card className="mb-6 border-amber-500/50 bg-amber-50/40 dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <AlertTriangle className="h-5 w-5" />
                Lab Interactions Detected
              </CardTitle>
              <CardDescription>
                Your current medications may explain or affect some flagged lab values.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {warnings.map((w, i) => (
                <div key={i} className="bg-background rounded-lg border p-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{w.medication}</span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {w.flaggedMetric}
                    </span>
                  </div>
                  <p className="text-sm">{w.effect}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <span className="font-medium">Tip:</span> {w.recommendation}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Med list */}
        <Card>
          <CardHeader>
            <CardTitle>Your list ({meds.length})</CardTitle>
            <CardDescription>
              {meds.length === 0 ? "No medications added yet." : "Tap to edit or remove."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meds.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Pill className="h-12 w-12 mx-auto opacity-30 mb-3" />
                <p>Add your first medication or supplement to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {meds.map(m => {
                  const def = findMedDef(m.name);
                  return (
                    <div
                      key={m.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                      data-testid="row-med"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{m.name}</span>
                          {def && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary rounded-full px-2 py-0.5">
                              {def.class}
                            </span>
                          )}
                          {def?.category === "supplement" && (
                            <span className="text-[10px] uppercase font-bold tracking-wider bg-muted rounded-full px-2 py-0.5">
                              Supplement
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-0.5 flex flex-wrap gap-x-3">
                          {m.dose && <span>Dose: {m.dose}</span>}
                          {m.frequency && <span>Freq: {m.frequency}</span>}
                          {m.startedOn && <span>Since: {m.startedOn}</span>}
                        </div>
                        {m.notes && <p className="text-xs text-muted-foreground mt-1">{m.notes}</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => startEdit(m)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeMedication(m.id);
                            toast({ title: "Removed" });
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick add suggestions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quick add common items</CardTitle>
            <CardDescription>Or search for one in our database of {MED_DATABASE.length} items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search medications and supplements..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filteredDb.map(d => (
                <Button
                  key={d.name}
                  variant="outline"
                  size="sm"
                  onClick={() => quickAdd(d.name)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {d.name}
                </Button>
              ))}
              {filteredDb.length === 0 && (
                <p className="text-sm text-muted-foreground">No matches. You can still add it manually.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-6 max-w-2xl mx-auto">
          This tool is informational only. Never start, stop, or change medication doses
          without consulting your doctor or pharmacist.
        </p>

        {/* Add/Edit dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit medication" : "Add medication"}</DialogTitle>
            </DialogHeader>
            <MedForm key={editing?.id ?? "new"} initial={editing} onSubmit={handleSave} onCancel={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function MedForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial: Medication | null;
  onSubmit: (data: Omit<Medication, "id">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [dose, setDose] = useState(initial?.dose ?? "");
  const [frequency, setFrequency] = useState(initial?.frequency ?? "");
  const [startedOn, setStartedOn] = useState(initial?.startedOn ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ name, dose, frequency, startedOn, notes });
      }}
      className="space-y-3"
    >
      <div>
        <Label htmlFor="med-name">Name *</Label>
        <Input
          id="med-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Atorvastatin, Vitamin D3"
          required
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="med-dose">Dose</Label>
          <Input
            id="med-dose"
            value={dose}
            onChange={e => setDose(e.target.value)}
            placeholder="10 mg"
          />
        </div>
        <div>
          <Label htmlFor="med-freq">Frequency</Label>
          <Input
            id="med-freq"
            value={frequency}
            onChange={e => setFrequency(e.target.value)}
            placeholder="Once daily"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="med-since">Started on</Label>
        <Input
          id="med-since"
          type="date"
          value={startedOn}
          onChange={e => setStartedOn(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="med-notes">Notes</Label>
        <Textarea
          id="med-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Take with food, etc."
          rows={2}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initial ? "Save" : "Add"}</Button>
      </DialogFooter>
    </form>
  );
}
