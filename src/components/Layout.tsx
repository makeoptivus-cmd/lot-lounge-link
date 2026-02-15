import { Link, useLocation } from "react-router-dom";
import { 
  Users, MapPin, Eye, Handshake, Scale, UserCheck, 
  Building, FileCheck, Home, Menu, X, Flower2, ClipboardList
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const stages = [
  { path: "/owner-profile", label: "Owner Profile", icon: ClipboardList, stage: 0 },
  { path: "/land-owner", label: "Land Owner", icon: Users, stage: 1 },
  { path: "/land-details", label: "Land Details", icon: MapPin, stage: 2 },
  { path: "/site-visit", label: "Site Visit", icon: Eye, stage: 3 },
  { path: "/owner-meeting", label: "Owner Meeting", icon: Handshake, stage: 4 },
  { path: "/mediation", label: "Mediation", icon: Scale, stage: 5 },
  { path: "/buyer-seller", label: "Buyer & Seller", icon: UserCheck, stage: 6 },
  { path: "/meeting-place", label: "Meeting Place", icon: Building, stage: 7 },
  { path: "/advance-registration", label: "Advance & Reg.", icon: FileCheck, stage: 8 },
];

const stageColors: Record<number, string> = {
  0: "bg-primary",
  1: "bg-[hsl(var(--stage-1))]",
  2: "bg-[hsl(var(--stage-2))]",
  3: "bg-[hsl(var(--stage-3))]",
  4: "bg-[hsl(var(--stage-4))]",
  5: "bg-[hsl(var(--stage-5))]",
  6: "bg-[hsl(var(--stage-6))]",
  7: "bg-[hsl(var(--stage-7))]",
  8: "bg-[hsl(var(--stage-8))]",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Flower2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight text-foreground">
                Success Real Estate
              </h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Land Seller
              </p>
            </div>
          </Link>
          <div className="ml-auto">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
          <nav className="sticky top-16 space-y-1 p-4">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Workflow Stages
            </p>
            {stages.map(({ path, label, icon: Icon, stage }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : `${stageColors[stage]} text-white`
                    )}
                  >
                    {stage}
                  </div>
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-foreground/20" onClick={() => setMobileOpen(false)} />
            <aside className="relative z-50 h-full w-72 border-r bg-card shadow-xl">
              <nav className="space-y-1 p-4 pt-6">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Workflow Stages
                </p>
                {stages.map(({ path, label, icon: Icon, stage }) => {
                  const isActive = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : `${stageColors[stage]} text-white`
                        )}
                      >
                        {stage}
                      </div>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-4xl p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
