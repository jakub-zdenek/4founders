import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: Array<ReturnType<typeof GitHub> | ReturnType<typeof Credentials>> = [];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

providers.push(
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: String(credentials.email) },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });

      if (!user?.passwordHash) {
        return null;
      }

      const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
      if (!valid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        roles: user.userRoles.map((entry) => entry.role.type),
      };
    },
  }),
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const userWithRoles = await prisma.user.findUnique({
          where: { id: user.id },
          include: { userRoles: { include: { role: true } } },
        });

        token.roles = userWithRoles?.userRoles.map((entry) => entry.role.type) ?? [];
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.roles = (token.roles ?? []) as string[];
      }

      return session;
    },
  },
  trustHost: true,
});
