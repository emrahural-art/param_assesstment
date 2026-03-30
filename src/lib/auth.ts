import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { normalizeLoginEmail } from "@/lib/login-email";
import { auditLog } from "@/lib/audit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { db } = await import("@/lib/prisma");
        const email = normalizeLoginEmail(credentials.email as string);
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) return null;

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        if (user?.id && user?.name) {
          auditLog({ userId: user.id, userName: user.name, action: "LOGIN", entity: "User", entityId: user.id, metadata: { provider: "credentials" } });
        }
        return true;
      }

      const rawEmail = user.email;
      if (!rawEmail) return false;

      try {
        const { db } = await import("@/lib/prisma");
        const email = normalizeLoginEmail(rawEmail);
        const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

        if (adminEmail && email === adminEmail) {
          const sysAdmin = await db.user.upsert({
            where: { email },
            create: {
              email,
              name: user.name ?? email.split("@")[0] ?? "Admin",
              role: "SYSTEM_ADMIN",
              passwordHash: null,
            },
            update: {
              name: user.name ?? undefined,
              role: "SYSTEM_ADMIN",
            },
          });
          auditLog({ userId: sysAdmin.id, userName: sysAdmin.name, action: "LOGIN", entity: "User", entityId: sysAdmin.id, metadata: { provider: "google" } });
          return true;
        }

        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
          auditLog({ userId: existing.id, userName: existing.name, action: "LOGIN", entity: "User", entityId: existing.id, metadata: { provider: "google" } });
          return true;
        }

        const invite = await db.loginInvite.findUnique({ where: { email } });
        if (invite) {
          const newUser = await db.user.create({
            data: {
              email,
              name: user.name ?? email.split("@")[0] ?? "Kullanıcı",
              role: invite.role,
              passwordHash: null,
            },
          });
          await db.loginInvite.delete({ where: { id: invite.id } });
          auditLog({ userId: newUser.id, userName: newUser.name, action: "REGISTER_VIA_INVITE", entity: "User", entityId: newUser.id, metadata: { provider: "google", role: invite.role } });
          return true;
        }

        return false;
      } catch (err) {
        console.error("[AUTH] signIn callback error:", err);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        if ("role" in user && user.role && user.id) {
          token.sub = user.id;
          token.role = user.role;
          if (user.email) token.email = user.email;
          if (user.name) token.name = user.name;
        } else {
          const emailRaw = user.email;
          if (typeof emailRaw === "string") {
            const { db } = await import("@/lib/prisma");
            const email = normalizeLoginEmail(emailRaw);
            const dbUser = await db.user.findUnique({ where: { email } });
            if (dbUser) {
              token.sub = dbUser.id;
              token.role = dbUser.role;
              token.email = dbUser.email;
              token.name = dbUser.name;
            }
          }
        }
      }

      // Her istekte DB'den rolü tazele (JWT'de eski ADMIN kalıp SYSTEM_ADMIN UI'sinin gizlenmesini önler)
      if (token.sub) {
        const { db } = await import("@/lib/prisma");
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          select: { role: true, email: true, name: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          if (dbUser.email) token.email = dbUser.email;
          if (dbUser.name) token.name = dbUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = (token.role as string) ?? "HR_SPECIALIST";
        if (typeof token.email === "string") session.user.email = token.email;
        if (typeof token.name === "string") session.user.name = token.name;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  trustHost: true,
});
