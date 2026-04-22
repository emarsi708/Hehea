import { useState } from "react";
import { useHealthReport } from "@/hooks/use-health-report";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Users, UserPlus, Check, Trash2 } from "lucide-react";

export function ProfileSwitcher() {
  const profiles = useHealthReport(s => s.profiles);
  const currentId = useHealthReport(s => s.currentProfileId);
  const switchProfile = useHealthReport(s => s.switchProfile);
  const addProfile = useHealthReport(s => s.addProfile);
  const removeProfile = useHealthReport(s => s.removeProfile);

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("family");
  const current = profiles.find(p => p.id === currentId) ?? profiles[0];

  const handleAdd = () => {
    if (!name.trim()) return;
    const id = addProfile(name.trim(), relation);
    switchProfile(id);
    setName(""); setRelation("family");
    setOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{current.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Switch profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {profiles.map(p => (
            <DropdownMenuItem
              key={p.id}
              onClick={() => switchProfile(p.id)}
              className="flex justify-between items-center"
            >
              <div className="flex flex-col">
                <span className="font-medium">{p.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{p.relation}</span>
              </div>
              <div className="flex items-center gap-1">
                {p.id === currentId && <Check className="h-4 w-4 text-primary" />}
                {profiles.length > 1 && p.id !== currentId && (
                  <button
                    type="button"
                    aria-label="Remove profile"
                    onClick={(e) => { e.stopPropagation(); removeProfile(p.id); }}
                    className="opacity-50 hover:opacity-100 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={(e) => { e.preventDefault(); setOpen(true); }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add a profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a profile</DialogTitle>
            <DialogDescription>
              Track reports for a family member or yourself separately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input id="profile-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mom" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-relation">Relation</Label>
              <Input id="profile-relation" value={relation} onChange={e => setRelation(e.target.value)} placeholder="e.g. mother, spouse, child" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!name.trim()}>Add profile</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
