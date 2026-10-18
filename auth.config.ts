import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find User in DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error("Invalid email or password")
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated. Please contact support.")
        }

        // 3. Verify Password
        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.password)
        if (!passwordsMatch) {
          throw new Error("Invalid email or password")
        }

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      if (token.role && session.user) {
        session.user.role = token.role as "ADMIN" | "USER"
      }
      
      // Force DB check by immutable user ID on every session retrieval to ensure deactivated users are kicked out
      const userId = token.sub || token.id;
      if (userId && typeof userId === "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, isActive: true, role: true },
        });
        if (!dbUser || !dbUser.isActive) {
          throw new Error("User is deactivated");
        }
        // Keep session email and role in sync with database in case they were updated
        if (dbUser.email && session.user) {
          session.user.email = dbUser.email;
        }
        if (dbUser.role && session.user) {
          session.user.role = dbUser.role as "ADMIN" | "USER";
        }
      }

      return session
    },
  },
  pages: {
    signIn: "/", // Since our login form is on the homepage (page.tsx)
  },
} satisfies NextAuthConfig
