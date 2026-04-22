import { Link, useLocation } from "wouter";
import { Activity, Menu } from "lucide-react";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/input", label: "New Report" },
  { href: "/results", label: "Results" },
  { href: "/plan", label: "7-Day Plan" },
  { href: "/history", label: "Trends" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/calculators", label: "Calculators" },
  { href: "/library", label: "Library" },
];

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 print-hide">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Activity className="h-6 w-6" />
          <span className="font-bold text-lg tracking-tight">HealthAdvisor</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                location === l.href
                  ? "text-foreground bg-muted"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ProfileSwitcher />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-6">
                {NAV_LINKS.map(l => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`text-sm font-medium px-3 py-2 rounded-md ${
                      location === l.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
