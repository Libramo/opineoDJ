"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, FileText, Users, Settings, LayoutDashboard, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const nav = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Users },
  { label: "Campagnes", href: "/dashboard/campaigns", icon: FolderOpen },
  { label: "Sondages", href: "/dashboard/surveys", icon: FileText },
  { label: "Résultats", href: "/dashboard/results", icon: BarChart2 },
  { label: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

interface AdminSidebarProps {
  user: { name?: string | null; email: string };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-60 shrink-0 h-full border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-14 border-b border-border shrink-0">
        <span className="font-serif text-base font-semibold text-foreground tracking-tight">
          Opineo
          <span className="text-accent">DJ</span>
        </span>
        <span className="text-xs text-muted-foreground font-sans">by BlyAnalytics</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer — user + theme toggle */}
      <div className="shrink-0 border-t border-border px-4 py-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{user.name ?? user.email}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
