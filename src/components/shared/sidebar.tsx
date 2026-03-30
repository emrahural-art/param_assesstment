"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Briefcase,
  ClipboardList,
  Mail,
  Settings,
  Shield,
} from "lucide-react";
import { type FeatureFlagRecord } from "@/lib/features-env";

const allNavItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, feature: null as string | null },
  { href: "/candidates", label: "Adaylar", icon: Users, feature: null },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch, feature: "pipeline" },
  { href: "/listings", label: "İlanlar", icon: Briefcase, feature: "listings" },
  { href: "/assessments", label: "Testler", icon: ClipboardList, feature: null },
  { href: "/communication", label: "İletişim", icon: Mail, feature: "communication" },
  { href: "/settings", label: "Ayarlar", icon: Settings, feature: null },
];

interface SidebarProps {
  featureFlags?: FeatureFlagRecord;
  userRole?: string;
}

export function Sidebar({ featureFlags, userRole }: SidebarProps) {
  const pathname = usePathname();

  const navItems = allNavItems.filter(
    (item) => !item.feature || (featureFlags && featureFlags[item.feature])
  );

  const isSystemAdmin = userRole === "SYSTEM_ADMIN";

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-sidebar">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <Image
          src="/logos/param.svg"
          alt="Param"
          width={90}
          height={30}
          className="brightness-0 invert"
        />
        <div className="h-5 w-px bg-sidebar-border" />
        <span className="text-xs font-medium text-sidebar-foreground/60 tracking-wide uppercase">
          AC
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {isSystemAdmin && (
          <>
            <div className="my-2 border-t border-sidebar-border" />
            <Link
              href="/settings/logs"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith("/settings/logs")
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Sistem Logları
            </Link>
          </>
        )}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <p className="text-[10px] text-sidebar-foreground/40 text-center">
          Param Assessment Center v0.1
        </p>
      </div>
    </aside>
  );
}
