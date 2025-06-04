import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth"; // Use import type
import GoogleProvider from "next-auth/providers/google";
import type { User } from "next-auth";
import type { JWT } from "next-auth/jwt"; // Keep type imports if needed elsewhere, adjust if not
import { prisma } from "@/lib/prisma";

// Define authOptions with NextAuthOptions type for v4
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      // Ensure environment variables are defined and non-empty
      clientId: process.env.GOOGLE_CLIENT_ID ?? "", 
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/login", // This remains the same
    // Add error page if needed for v4, e.g., error: '/auth/error', 
  },
  callbacks: {
    // Note: v4 callback structure might differ slightly, especially JWT/session interaction
    // Review v4 docs if more complex logic is needed here.
    async session({ session, token }) {
      if (session?.user && token?.sub) {
        (session.user as User & { id: string }).id = token.sub;
      }
      if (session?.user) {
        (session.user as User & { isAdmin?: boolean }).isAdmin = (token as JWT &
          { isAdmin?: boolean }).isAdmin;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email ?? "" },
          select: { isAdmin: true },
        });
        (token as JWT & { isAdmin?: boolean }).isAdmin = dbUser?.isAdmin ?? false;
      }
      return token;
    },
  },
  // The secret is automatically picked up from NEXTAUTH_SECRET env var in v4
  // No need to explicitly define 'secret: process.env.NEXTAUTH_SECRET' here usually
  // session: { // Example: Define session strategy if needed (default is 'jwt')
  //   strategy: "jwt", 
  // },
};

// Export the handler directly for App Router in v4
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
