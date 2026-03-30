import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminOrAbove } from "@/lib/permissions";
import InviteAdminClient from "./invite-admin-client";

export default async function NewUserInvitePage() {
  const session = await auth();
  if (!session?.user || !isAdminOrAbove(session.user.role)) {
    redirect("/settings");
  }

  return <InviteAdminClient currentRole={session.user.role} />;
}
