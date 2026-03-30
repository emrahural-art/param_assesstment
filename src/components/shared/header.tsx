"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { roleLabelsTr } from "@/lib/role-labels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { data: session } = useSession();

  const initials = session?.user?.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() ?? "?";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-accent transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start text-left">
            <span className="text-sm">{session?.user?.name ?? "Kullanıcı"}</span>
            {session?.user?.role && (
              <Badge variant="outline" className="mt-0.5 text-[10px] font-normal px-1.5 py-0">
                {roleLabelsTr[session.user.role] ?? session.user.role}
              </Badge>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
            {session?.user?.email}
          </DropdownMenuItem>
          {session?.user?.role && (
            <DropdownMenuItem className="text-xs" disabled>
              Rol: {roleLabelsTr[session.user.role] ?? session.user.role}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
            Çıkış Yap
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
