import { Link } from "wouter";
import { Activity } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 print-hide">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Activity className="h-6 w-6" />
          <span className="font-bold text-lg tracking-tight">HealthAdvisor</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/input" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            New Report
          </Link>
          <Link href="/results" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Last Results
          </Link>
        </div>
      </div>
    </nav>
  );
}
